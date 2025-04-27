// queueRoutes.js
const express = require('express');
const router = express.Router();

const {
  joinQueue,
  getQueueByRestaurant,
  updateQueueStatus,
  updateQueueSeats,
  deleteQueueEntry,
  sendCustomNotification,
  getRemainingSeatsAPI,
  stepBackInQueue
} = require('../controllers/queueController');

// Join queue (triggers SMS)
router.post('/', joinQueue);

// Get queue for a specific restaurant
router.get('/restaurant/:restaurantId', getQueueByRestaurant);

// Get remaining seats for a restaurant (used by frontend to validate)
router.get('/restaurant/remaining-seats', getRemainingSeatsAPI);

// Step back in queue (used by frontend)
router.patch('/step-back', stepBackInQueue);

// Update queue status (e.g., Seat, Re-Add) — triggers SMS
router.patch('/:id/status', updateQueueStatus);

// Update number of seats for a queue entry
router.patch('/:id', updateQueueSeats);

// Delete a queue entry — triggers SMS
router.delete('/:id', deleteQueueEntry);

// Manual "Send SMS" trigger from dashboard
router.post('/:id/notify', sendCustomNotification);

module.exports = router;