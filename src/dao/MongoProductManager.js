const Product = require('./models/Product');

class MongoProductManager {
  async addProduct(product) {
    const newProduct = new Product(product);
    await newProduct.save();
  }

  async getProducts(query = {}, options = {}) {
    const { limit = 10, page = 1, sort, filter } = options;
    const sortOptions = sort ? { price: sort === 'asc' ? 1 : -1 } : {};
    const queryOptions = filter ? { category: filter } : {};

    const products = await Product.paginate(queryOptions, {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sortOptions
    });

    return products;
  }

  async getProductById(id) {
    return await Product.findById(id);
  }

  async updateProduct(id, product) {
    return await Product.findByIdAndUpdate(id, product, { new: true });
  }

  async deleteProduct(id) {
    return await Product.findByIdAndDelete(id);
  }
}

module.exports = MongoProductManager;
