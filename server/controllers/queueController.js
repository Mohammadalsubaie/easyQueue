const admin = require('../config/firebase');
const sendSms = require('../utils/sendSms');

// Helper to calculate remaining available seats for a restaurant
const getRemainingSeats = async (restaurantId, excludeQueueId = null) => {
  const db = admin.firestore();

  const restaurantDoc = await db.collection('restaurants').doc(restaurantId).get();
  if (!restaurantDoc.exists) throw new Error('Restaurant not found');

  const totalSeats = Number(restaurantDoc.data().totalSeats || 0);

  const queueSnapshot = await db
    .collection('queues')
    .where('restaurantId', '==', restaurantId)
    .where('status', '==', 'Waiting')
    .get();

  let usedSeats = 0;
  queueSnapshot.docs.forEach(doc => {
    if (doc.id !== excludeQueueId) {
      usedSeats += Number(doc.data().seats || 0);
    }
  });

  return totalSeats - usedSeats;
};

// Join a queue
exports.joinQueue = async (req, res) => {
  try {
    const { name, phone, seats, restaurantId } = req.body;

    if (!name || !phone || !seats || !restaurantId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const requestedSeats = Number(seats);
    const remainingSeats = await getRemainingSeats(restaurantId);

    if (requestedSeats > remainingSeats) {
      return res.status(400).json({ message: `Only ${remainingSeats} seats are available.` });
    }

    const db = admin.firestore();
    const queueEntry = {
      name,
      phone,
      seats: requestedSeats,
      restaurantId,
      status: 'Waiting',
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('queues').add(queueEntry);
    queueEntry.id = docRef.id;

    const restaurantDoc = await db.collection('restaurants').doc(restaurantId).get();
    const restaurant = restaurantDoc.exists ? restaurantDoc.data() : null;

    if (restaurant) {
      const queueUrl = `http://localhost:3000/queue-position?id=${docRef.id}&restaurantId=${restaurantId}`;
      await sendSms(phone, `✅ You’ve joined the queue at ${restaurant.name}. Track here: ${queueUrl}`);
    }

    return res.status(201).json({
      message: "Joined queue successfully",
      queueEntry,
    });
  } catch (error) {
    console.error("❌ Error in joinQueue:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get all queues for a specific restaurant (sorted by joinedAt)
exports.getQueueByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    const db = admin.firestore();
    const snapshot = await db
      .collection('queues')
      .where('restaurantId', '==', restaurantId)
      .orderBy('joinedAt', 'asc')
      .get();

    const queue = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({ queue });
  } catch (error) {
    console.error("❌ Error in getQueueByRestaurant:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Update queue status (e.g., Seat, Re-add)
exports.updateQueueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, joinedAt } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const db = admin.firestore();
    const docRef = db.collection('queues').doc(id);

    await docRef.update({
      status,
      ...(status === 'Waiting' && { joinedAt: joinedAt || admin.firestore.FieldValue.serverTimestamp() })
    });

    const updatedDoc = await docRef.get();
    const queueEntry = updatedDoc.data();
    queueEntry.id = id;

    const restaurantDoc = await db.collection('restaurants').doc(queueEntry.restaurantId).get();
    const restaurant = restaurantDoc.exists ? restaurantDoc.data() : null;

    if (restaurant) {
      const queueUrl = `http://localhost:3000/queue-position?id=${id}&restaurantId=${queueEntry.restaurantId}`;
      await sendSms(queueEntry.phone, `ℹ️ Update: You are now marked as '${status}' at ${restaurant.name}. Track here: ${queueUrl}`);
    }

    return res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("❌ Error in updateQueueStatus:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Update number of seats for a queue entry
exports.updateQueueSeats = async (req, res) => {
  try {
    const { id } = req.params;
    const { seats } = req.body;

    if (!seats || isNaN(seats)) {
      return res.status(400).json({ message: "Valid seat number is required" });
    }

    const db = admin.firestore();
    const docRef = db.collection('queues').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Queue entry not found" });
    }

    const entry = doc.data();
    const currentSeats = Number(entry.seats);
    const newSeats = Number(seats);
    const seatDiff = newSeats - currentSeats;

    if (seatDiff > 0) {
      const remaining = await getRemainingSeats(entry.restaurantId, id);
      if (seatDiff > remaining) {
        return res.status(400).json({ message: `Only ${remaining + currentSeats} seats are available.` });
      }
    }

    await docRef.update({ seats: newSeats });

    return res.status(200).json({ message: "Seat count updated successfully" });
  } catch (error) {
    console.error("❌ Error in updateQueueSeats:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Delete a queue entry
exports.deleteQueueEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const db = admin.firestore();
    const docRef = db.collection('queues').doc(id);
    const doc = await docRef.get();
    const queueEntry = doc.exists ? doc.data() : null;

    await docRef.delete();

    if (queueEntry) {
      const restaurantDoc = await db.collection('restaurants').doc(queueEntry.restaurantId).get();
      const restaurant = restaurantDoc.exists ? restaurantDoc.data() : null;

      if (restaurant) {
        await sendSms(queueEntry.phone, `🚫 You've been removed from ${restaurant.name}'s queue.`);
      }
    }

    return res.status(200).json({ message: "Queue entry deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteQueueEntry:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Manual SMS notification trigger
exports.sendCustomNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const db = admin.firestore();
    const doc = await db.collection('queues').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Queue entry not found' });
    }

    const queueEntry = doc.data();
    const restaurantDoc = await db.collection('restaurants').doc(queueEntry.restaurantId).get();
    const restaurant = restaurantDoc.exists ? restaurantDoc.data() : null;

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const queueUrl = `http://localhost:3000/queue-position?id=${id}&restaurantId=${queueEntry.restaurantId}`;
    await sendSms(queueEntry.phone, `📲 Message from ${restaurant.name}: Track your queue status here → ${queueUrl}`);

    return res.status(200).json({ message: 'SMS notification sent successfully' });
  } catch (error) {
    console.error("❌ Error in sendCustomNotification:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// API to get remaining available seats (for client-side validation)
exports.getRemainingSeatsAPI = async (req, res) => {
  try {
    const { restaurantId, excludeId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const remaining = await getRemainingSeats(restaurantId, excludeId);
    return res.status(200).json({ remaining });
  } catch (error) {
    console.error("❌ Error in getRemainingSeatsAPI:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Step back in queue (swap with person behind)
exports.stepBackInQueue = async (req, res) => {
  try {
    const { restaurantId, queueId } = req.body;
    if (!restaurantId || !queueId) {
      return res.status(400).json({ message: "restaurantId and queueId are required" });
    }

    const db = admin.firestore();
    const queueSnapshot = await db
      .collection('queues')
      .where('restaurantId', '==', restaurantId)
      .where('status', '==', 'Waiting')
      .orderBy('joinedAt', 'asc')
      .get();

    const queue = queueSnapshot.docs;
    const index = queue.findIndex(doc => doc.id === queueId);

    if (index === -1 || index === queue.length - 1) {
      return res.status(400).json({ message: "Cannot step back any further." });
    }

    const currentRef = db.collection('queues').doc(queue[index].id);
    const nextRef = db.collection('queues').doc(queue[index + 1].id);

    const currentJoined = queue[index].data().joinedAt || admin.firestore.Timestamp.now();
    const nextJoined = queue[index + 1].data().joinedAt || admin.firestore.Timestamp.now();

    await currentRef.update({ joinedAt: nextJoined });
    await nextRef.update({ joinedAt: currentJoined });

    return res.status(200).json({ message: "Stepped back successfully" });
  } catch (error) {
    console.error("❌ Error in stepBackInQueue:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};