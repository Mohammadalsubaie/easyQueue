// server/controllers/notificationController.js
const twilioClient = require('../config/twilio');

exports.sendQueueNotification = async (req, res) => {
  // Extract phoneNumber and messageBody from the request body.
  // The 'phoneNumber' is the recipient entered after scanning the QR code.
  const { phoneNumber, messageBody } = req.body;

  // Basic input validation
  if (!phoneNumber || !messageBody) {
    return res.status(400).json({ error: 'Both phone number and message body are required' });
  }

  try {
    // Send SMS using Twilio
    const message = await twilioClient.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    res.status(200).json({ success: true, sid: message.sid });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
};