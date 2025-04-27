const express = require('express');
const router = express.Router();
const {
  getMenuByRestaurant,
  addMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');

// Fetch all menu items by restaurant ID
router.get('/', getMenuByRestaurant);

// Add a menu item
router.post('/', addMenuItem);

// Delete a menu item
router.delete('/:id', deleteMenuItem);

module.exports = router;