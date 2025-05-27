const express = require('express')
const multer = require ('multer')
const upload = require('../middleware/upload')
const path = require ('path')
const { protect }   = require('../middleware/authMiddleware')

const router = express.Router();


//POST /api/upload
router.post('/', protect, upload.array('images', 6), (req, res) => {
    console.log('FILES:' , req.files);

    if (!req.files || req.files.length === 0){
        return res.status(400).json({message: 'No files uploaded'})
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.send({ imageUrls });//send array of uploaded image urls
})

module.exports = router;