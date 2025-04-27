const admin = require('../config/firebase');
const sendSms = require('../utils/sendSms');

exports.sendSMSNotification = async (req, res) => {
  try {
    const { queueId, restaurantId, action } = req.body;

    if (!queueId || !restaurantId || !action) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const db = admin.firestore();

    const queueDoc = await db.collection('queues').doc(queueId).get();
    if (!queueDoc.exists) return res.status(404).json({ message: 'Queue entry not found' });
    const queueData = queueDoc.data();

    const restaurantDoc = await db.collection('restaurants').doc(restaurantId).get();
    if (!restaurantDoc.exists) return res.status(404).json({ message: 'Restaurant not found' });
    const restaurantData = restaurantDoc.data();

    const queueSnapshot = await db
      .collection('queues')
      .where('restaurantId', '==', restaurantId)
      .where('status', '==', 'Waiting')
      .orderBy('joinedAt', 'asc')
      .get();

    const position = queueSnapshot.docs.findIndex(doc => doc.id === queueId) + 1;

    const queueLink = `${process.env.FRONTEND_BASE_URL}/queue-position?id=${queueId}&restaurantId=${restaurantId}`;
    const message = `Hi ${queueData.name},\n\nYour queue status has changed: *${action}*\nRestaurant: ${restaurantData.name}\nYour Position: ${position}\n\nTrack your status: ${queueLink}`;

    await sendSms(queueData.phone, message);

    res.status(200).json({ message: 'SMS sent successfully' });
  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    res.status(500).json({ message: 'Failed to send SMS', error: error.message });
  }
};
