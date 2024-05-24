const express = require('express');
const router = express.Router();
const Cart = require('../dao/models/Cart');

// Obtener los productos de un carrito específico
router.get('/carts/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }
    res.render('cart', { cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }const express = require('express');
  const router = express.Router();
  const Cart = require('../dao/models/Cart');
  
  // Obtener los productos de un carrito específico
  router.get('/carts/:cid', async (req, res) => {
    try {
      const { cid } = req.params;
      const cart = await Cart.findById(cid).populate('products.product');
      if (!cart) {
        return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
      }
      res.render('cart', { cart });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  });
  
  module.exports = router;
  
});

module.exports = router;
