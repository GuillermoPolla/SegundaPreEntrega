require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const handlebars = require('handlebars');
const path = require('path');
const MongoProductManager = require('./dao/MongoProductManager');
const ProductManager = require('./ProductManager');
const connectDB = require('./config');
const Message = require('./dao/models/Message');
const Cart = require('./dao/models/Cart');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/carts');
const viewRoutes = require('./routes/views');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Conectar a MongoDB
connectDB();

// Configurar Handlebars
const hbs = exphbs.create({
  handlebars: allowInsecurePrototypeAccess(handlebars),
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Configurar archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Crear instancia de los managers
const mongoProductManager = new MongoProductManager();
const productManager = new ProductManager('./data/productos.json');

// Rutas de productos
app.use('/api/products', productRoutes);

// Ruta para la vista de chat
app.get('/chat', (req, res) => {
  res.render('chat');
});

// Ruta para la vista de carritos
app.use('/api/carts', cartRoutes);

// Rutas de vistas
app.use('/', viewRoutes);

// Iniciar servidor WebSocket
io.on('connection', (socket) => {
  console.log('Usuario conectado');

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });

  // Escuchar evento para agregar un producto
  socket.on('addProduct', async (product) => {
    await mongoProductManager.addProduct(product);
    io.emit('productListUpdated', await mongoProductManager.getProducts());
  });

  // Escuchar evento para eliminar un producto
  socket.on('deleteProduct', async (id) => {
    await mongoProductManager.deleteProduct(id);
    io.emit('productListUpdated', await mongoProductManager.getProducts());
  });

  // Escuchar evento de chat
  socket.on('chatMessage', async (msg) => {
    const newMessage = new Message(msg);
    await newMessage.save();
    io.emit('message', msg);
  });
});

// Rutas para las vistas
app.get('/products', async (req, res) => {
  const { limit, page, sort, query: filter } = req.query;
  const options = { limit, page, sort, filter };
  const result = await mongoProductManager.getProducts({}, options);
  const { docs: products, totalPages, prevPage, nextPage, page: currentPage, hasPrevPage, hasNextPage } = result;

  res.render('products', {
    products,
    totalPages,
    prevPage,
    nextPage,
    page: currentPage,
    hasPrevPage,
    hasNextPage,
    prevLink: hasPrevPage ? `/products?page=${prevPage}&limit=${limit}&sort=${sort}&query=${filter}` : null,
    nextLink: hasNextPage ? `/products?page=${nextPage}&limit=${limit}&sort=${sort}&query=${filter}` : null
  });
});

app.get('/carts/:cid', async (req, res) => {
  const { cid } = req.params;
  const cart = await Cart.findById(cid).populate('products.product');
  if (!cart) {
    return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
  }
  res.render('cart', { cart });
});

// Iniciar el servidor
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Servidor iniciado en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error(`No se pudo iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
};

startServer();
