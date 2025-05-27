const express = require('express');
const { getMyAds, deleteAd, updateAd, getSingleAd } = require('../controllers/adsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

console.log('adsRoutes mounted');

// Get ads for logged-in user
router.get('/mine', protect, getMyAds);

router.get('/:id',protect, getSingleAd)

// Delete ad
router.delete('/:id', protect, deleteAd);

// Update ad
router.put('/:id', protect, updateAd);

module.exports = router;
