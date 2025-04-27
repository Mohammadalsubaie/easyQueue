const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure uploads folder exists
const uploadPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Import controllers
const {
  registerRestaurant,
  getRestaurants,
  loginRestaurantManager,
  findRestaurantByName,
  updateRestaurantQR,
  updateRestaurant,
  updateRestaurantLogo
} = require('../controllers/restaurantController');

// Health check route
router.get('/test', (req, res) => {
  res.send('✅ Restaurant routes are working!');
});

// Register restaurant (with logo upload)
router.post('/', upload.single('logo'), registerRestaurant);

// Login restaurant manager
router.post('/login', loginRestaurantManager);

// Update restaurant QR code
router.patch('/:id/qr', updateRestaurantQR);

// Update restaurant name
router.patch('/:id', updateRestaurant);

// Update restaurant logo (with logo upload)
router.patch('/:id/logo', upload.single('logo'), updateRestaurantLogo);

// Find restaurant by ID, email, or name
router.get('/find', findRestaurantByName);

// Get all restaurants
router.get('/', getRestaurants);

module.exports = router;