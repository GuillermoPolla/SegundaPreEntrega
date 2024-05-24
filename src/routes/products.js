const express = require('express');
const router = express.Router();
const MongoProductManager = require('../dao/MongoProductManager');
const mongoProductManager = new MongoProductManager();

router.get('/', async (req, res) => {
  try {
    const { limit, page, sort, query: filter } = req.query;
    const options = { limit, page, sort, filter };
    const result = await mongoProductManager.getProducts({}, options);

    const { docs: products, totalPages, prevPage, nextPage, page: currentPage, hasPrevPage, hasNextPage } = result;

    const response = {
      status: 'success',
      payload: products,
      totalPages,
      prevPage,
      nextPage,
      page: currentPage,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? `/products?page=${prevPage}&limit=${limit}&sort=${sort}&query=${filter}` : null,
      nextLink: hasNextPage ? `/products?page=${nextPage}&limit=${limit}&sort=${sort}&query=${filter}` : null
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
