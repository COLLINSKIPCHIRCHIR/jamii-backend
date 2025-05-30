const express = require('express');
const router = express.Router();
const {getAllCategories} = require('../controllers/productController')

//get all categories
router.get('/allCategories', getAllCategories);

module.exports = router;