// server/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { getAnalyticsByRestaurant } = require('../controllers/analyticsController');

router.get('/:restaurantId', getAnalyticsByRestaurant);

module.exports = router;
