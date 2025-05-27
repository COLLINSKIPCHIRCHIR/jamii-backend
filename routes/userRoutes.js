const express = require('express')
const upload = require('../middleware/upload')
const { registerUser, loginUser, updateProfilePic, deleteProfilepic, googleLogin , getUser } = require('../controllers/userController');
const {protect} = require('../middleware/authMiddleware')



const router = express.Router();

console.log('updateProfilePic is:', typeof updateProfilePic);

//routes for signup and profile pic
router.post('/signup',  registerUser);

router.get('/me', protect , getUser);

//route for login
router.post('/login', loginUser);

//google log-in route
router.post('/google-login' , googleLogin )

//update profile pic (requires auth)
console.log('upload.single exists:', typeof upload.single); // should be 'function'
router.put('/profile-pic', protect, upload.single('profilepic'), updateProfilePic)



//delete profile pic
router.delete('/profile-pic', protect, deleteProfilepic);

console.log('typeof upload:', typeof upload); // should be 'function' (the multer object)
console.log('typeof upload.single:', typeof upload.single); // should be 'function'


module.exports = router;