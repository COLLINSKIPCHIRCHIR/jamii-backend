const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required:true },
  description: { type: String, required: true},
  price: { type: Number, required: true },
  images: [{ type: String }], // URLs from /uploads/
  category: { type: String, required: true },
  location: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  featured: {
    type: Boolean,
    default: false
  }

}, { timestamps: true});

module.exports = mongoose.model('Product', productSchema);