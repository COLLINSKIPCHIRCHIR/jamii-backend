//handles what should happen when a user submits sign up form
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs')
const path = require('path')
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

console.log('userController loaded');

//generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET,{
        expiresIn: '7d',
    })
}

const googleLogin = async (req, res) => {
    const { token: googleToken } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name,
                email,
                password: null,
                googleId,
            });
        }
        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            message: 'Google login successful',
            token: jwtToken,
            user: { id: user._id, name: user.name, email: user.email},
        })
    } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Error: Failed to authenticate with Google' })
    }

}


const updateProfilePic = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found'})

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded'});
        }

        //if there's a previous profile picture,delete it
        if (user.profilepic) {
            const oldPath = path.join(__dirname, '../uploads/', user.profilepic);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        //save new profilepic filename
        user.profilepic = req.file.filename;
        await user.save();

        res.status(200).json({ message: 'Profile picture updated', profilepic: `/uploads/${user.profilepic}`});

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error'})
    }
}

//get user to fetch user name and profile picture
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            profilepic: user.profilepic ? `/uploads/${user.profilepic}` : '',
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error'});
    }
}

//delete profile picture
const deleteProfilepic = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user || !user.profilepic) {
            return res.status(400).json({ message: 'No profile picture to delete '});
        }

        const filePath = path.join(__dirname, '../uploads/', user.profilepic);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        user.profilepic = null;
        await user.save();

        res.status(200).json({ message: 'Profile picture deleted'})

    } catch (err) {
        console.error('Delete profile pic error:', err);
        res.status(500).json( { message: 'Error deleting profile picture'})
    }
}

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    console.log('Received data', req.body)//debug

    try {
        // check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists'});
        }

        //hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        })

        //create new user
        res.status(201).json({ 
            message: 'User created successfully',
            user: {
                _id:user._id,
                name: user.name,
                email: user.email,
            }
        
        })

        console.log('user created:', user); //debug
    } catch (error) {
        res.status(500).json({ message: 'Error: Failed to create user', error: error.message });  
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
       // find user by email
       const user = await User.findOne({ email });
       
       if (!user) {
        return res.status(400).json({message: 'invalid email or password'});
    
       }
       
       //compare the entered password with hashed password
       const isMatch = await bcrypt.compare(password, user.password);

       if (!isMatch) {
        return res.status(400).json({message: 'Invalid email or password'})
       }

       // create JWT token
       const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET,{
        expiresIn: '7d',
       });

       //return the token and user data(optional: hide password)
       res.status(200).json({
        message: 'Login successful',
        token: generateToken(user._id),
        user: {
            id: user._id,
            username: user.name,
            email: user.email,
        },
       });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Failed to login user', error: error.message })
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateProfilePic,
    deleteProfilepic,
    googleLogin,
    getUser,
};