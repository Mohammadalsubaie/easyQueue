// utils/sendSms.js
const twilio = require('twilio');

// Load Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const client = twilio(accountSid, authToken);

/**
 * Send an SMS using Twilio
 * @param {string} to - Recipient phone number
 * @param {string} message - SMS body
 */
const sendSms = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    });
    console.log(`✅ SMS sent to ${to} | SID: ${result.sid}`);
  } catch (err) {
    console.error(`❌ SMS failed to ${to}:`, err.message);
  }
};

module.exports = sendSms;
