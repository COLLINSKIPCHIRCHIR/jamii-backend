const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const path = require('path')
const uploadRoutes = require('./routes/uploadRoutes')
const userRoutes = require('./routes/userRoutes')
const categoryRoutes = require ('./routes/categoryRoutes');
const chatRoutes = require('./routes/chatRoutes')
const adRoutes = require('./routes/adRoutes')
//const adRoutes = require('./routes/adRoutes')

dotenv.config();
connectDB();



const app = express();


const whitelist = [
  'http://localhost:5173', //Vite dev
  'https://jamii-frontend.vercel.app',
  process.env.CLIENT_URL //render -> Vercel site
].filter(Boolean); // drop undefined items

console.log('CORS whitelist:', whitelist);


const corsOptions = {
  origin(origin, cb) {
    //allow tools like curl/postman that send no origin header
    if (!origin) return cb(null, true);

    if (
      whitelist.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) { return cb(null, true);}
    cb(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions));

app.use(express.json()); //allows us to parse JSON to frontend



//use the product routes
app.use('/api/products', productRoutes );

//middleware for uploadRoutes
app.use('/api/upload', uploadRoutes);

//allow backend to serve images
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

//dashbord ad routes
//app.use('/api/ads', adRoutes);

//chat
app.use('/api/chat', chatRoutes);

//ads update/delete show mine
app.use('/api/ads', adRoutes)


//user signup
app.use('/api/users', userRoutes)

//category routes
app.use('/api/categories', categoryRoutes)

app.use('/images', express.static(path.join(__dirname,'public/images')))

// ✅ TEST ROUTE
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


//handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM recieved. Closing server...');
  Server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  })
})
