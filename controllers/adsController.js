const Product = require('../models/Product');

// GET /api/ads/mine
const getMyAds = async (req, res) => {
  try {
    const products = await Product.find({ createdBy: req.user._id });
    res.json(products);
  } catch (err) {
    console.error('Error fetching user ads:', err);
    res.status(500).json({ message: 'Error: Failed to fetch user ads' });
  }
};

// DELETE /api/ads/:id
const deleteAd = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!product) return res.status(404).json({ message: 'Ad not found or unauthorized' });

    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Ad deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Error: Failed to delete ad' });
  }
};

// PUT /api/ads/:id
const updateAd = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!product) return res.status(404).json({ message: 'Ad not found or unauthorized' });

    const { name, description, price, category, location, images } = req.body;

    //validate inputs
    if (name && typeof name !== 'string') {
        return res.status(400).json({ message: 'Invalid name format'});
    }
    if (description && typeof description !== 'string') {
        return res.status(400).json({ message: 'Invalid description format' })
    }
    if (price && (isNaN(price) || price < 0)) {
        return res.status(400).json({ message: 'Invalid price format' });
    }
    if (category && typeof category !== 'string') {
        return res.status(400).json({ message: 'Invalid category format' });
    }
    if (location && typeof location !== 'string') {
        return res.status(400).json({ message: 'Invalid location format' });
    }
    if (images && (!Array.isArray(images) || images.some(img => typeof img !== 'string'))) {
        return res.status(400).json({ message: 'Invalid images format' });
    }



    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.location = location || product.location;
    product.images = images || product.images;

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Error: Failed to update ad' });
  }
};

//get single ad
const getSingleAd = async (req, res) => {
    try {
        const ad = await Product.findById(req.params.id);
        if (!ad) {
            console.log('Ad not found');
            return res.status(404).json({ message: 'Ad not found'})
        }
        res.status(200).json(ad);
    } catch (error) {
        console.error('Error fetching single ad:',error);
        res.status(500).json({ message: 'Error: Failed to fetch ad'})
    }
    
} 
module.exports = { getMyAds, deleteAd, updateAd, getSingleAd };
