const Product = require('../models/Product');

//POST /api/products create new product
const createProduct = async (req, res) => {
    console.log('Logged in user:', req.user);
    console.log('Incoming POST /api/products:', req.body);
    const { name, description, price, images, category, location, featured } = req.body;

    if (!name || !description || !price || !images?.length || !category || !location) {
        return res.status(400).json({ message: 'please fill all required fields'});
    }

    const normalizedCategory = category.trim().toLowerCase();

    try {
        const product = new Product({
            name,
            description,
            price,
            images,
            category: normalizedCategory ,
            location,
            featured: featured || false,
            createdBy: req.user._id
        })

        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error('product creation error:', err);
        console.error('Request  body:', req.body);
        res.status(500).json({message: 'Failed to create product'})
    }
};

//Get all products
const getAllProducts = async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        const sortOption = req.query.sort || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const category = req.query.category;
        let query = {};

        if (searchQuery) {
            query.$or = [
                {name: { $regex: searchQuery, $options: 'i'}},
                {description: {$regex: searchQuery, $options: 'i'}},
                {location: {$regex: searchQuery, $options: 'i'}},
                {category: {$regex: searchQuery, $options: 'i'}}
            ];
        }

        if (category) {
            query.category = { $regex: new RegExp(category, 'i')};
        }

        // Determine sorting
        let sort = {};
        if (sortOption === 'price_asc') {
            sort = { price: 1 };
        } else if (sortOption === 'price_desc') {
            sort = { price: -1 };
        } else {
            sort = { createdAt: -1 }; // default: newest first
        }

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('createdBy', 'username email')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            products,
            page,
            totalPages: Math.ceil(total / limit),
            totalProducts: total
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
};



//Get a single product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('createdBy', 'username email phone');
        if (!product) {
            return res.status(404).json({message: 'Product not found'})
        }
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Failed to fetch product'})
    }
}

//get featured products
const getFeaturedProducts = async (req, res) => {
    try {
        const featuredProducts = await Product.find({ featured: true});
        res.json(featuredProducts);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Failed to fetch featured products'})
    }
}

//get products by category
const getProductsByCategory = async(req, res) => {
    try {
        const category = req.params.category;
        const products = await Product.find({ category: { $regex: new RegExp(category, 'i')} });
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Failed to fetch category products'})
    }
}

//get all unique categories
const getAllCategories = async(req, res) => {
     try { 

        const rawCategories = await Product.distinct('category');

        //map categories to include images
        const categoriesWithImages = rawCategories.map((category) => {
            //default image fallback
            let image = `/images/categories/default.png`;

            //assign images for known categories
            switch (category.toLowerCase()) {
                case 'electronics':
                    image = '/images/categories/electronics.png';
                    break;
                case 'fashion':
                    image = '/images/categories/fashion.png';
                    break;
                case 'furniture':
                    image = '/images/categories/furniture.png';
                    break;
                case 'books':
                    image = '/images/categories/books.png';
                    break;
                case 'vehicles':
                    image = '/images/categories/electronics.png';
                    break;
                case 'shoes':
                    image = '/images/categories/shoes.png'
                //add more categories as needed
            }

            return {
                name: category,
                image
            }
        })

        res.json(categoriesWithImages);
    } catch (err) {
        console.error(err);
        res.status(500).json({message:'failed to fetch all categories'})
    }
}

module.exports = { createProduct, getAllProducts,getFeaturedProducts,  getProductsByCategory, getAllCategories, getProductById  }  