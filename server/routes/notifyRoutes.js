const express = require('express');
const router = express.Router();
const { sendSMSNotification } = require('../controllers/notifyController');

router.post('/', sendSMSNotification);

module.exports = router;
