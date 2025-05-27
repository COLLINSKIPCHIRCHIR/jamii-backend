const express = require('express');
const { createProduct, getAllProducts, getFeaturedProducts, getProductsByCategory , getProductById} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const path = require('path');
console.log('Looking for controller at:', path.resolve(__dirname, '../controllers/productController'));



const router = express.Router();

//POST route
router.post('/', protect, createProduct);



//get all products
router.get('/', getAllProducts);

//get featured products
router.get('/featured' , getFeaturedProducts);

//get category products
router.get('/category/:category' , getProductsByCategory);


//get a single product by ID
router.get('/:id', getProductById)


module.exports = router;