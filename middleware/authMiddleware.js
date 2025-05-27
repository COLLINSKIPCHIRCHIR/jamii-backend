const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res , next) => {

    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables')
        return res.status(500).json({ message: 'Server configuration error'})
    }

    const authHeader = req.headers.authorization;
    console.log ('Authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error(' No or invalid Authorization header:', authHeader);
        return res.status(401).json({message: 'Not authorized, no token provided'});
    }

    try {
        const token = authHeader.split(' ')[1];
        console.log('Token:', token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //verify token
        console.log('Decoded JWT:',decoded)
        req.user = await User.findById(decoded.id).select('-password'); // attach user to req
        if (!req.user) {
            console.error('User not found for ID:', decoded.id);
            return res.status(401).json({ message: 'Not authorized, user not found'});
        }
        console.log('User found:', req.user);
        next()
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

module.exports = { protect } ;