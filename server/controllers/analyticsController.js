const admin = require('../config/firebase');

exports.getAnalyticsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    const db = admin.firestore();
    const snapshot = await db.collection('queues')
      .where('restaurantId', '==', restaurantId)
      .get();

    const queue = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (queue.length === 0) {
      return res.status(200).json({
        avgWaitTimes: { labels: [], data: [] },
        peakHours: { labels: [], data: [] },
        partySizes: { labels: [], data: [] },
        liveStats: { labels: [], waiting: [], seated: [] }
      });
    }

    // Average Wait Times by Day of Week
    const waitTimeByDay = {};
    queue.forEach(entry => {
      if (entry.status === 'Seated' && entry.joinedAt?._seconds) {
        const joinedDate = new Date(entry.joinedAt._seconds * 1000);
        const day = joinedDate.toLocaleString('en-US', { weekday: 'short' });
        const now = new Date();
        const waitTimeMin = Math.round((now - joinedDate) / 60000);

        waitTimeByDay[day] = waitTimeByDay[day] || [];
        waitTimeByDay[day].push(waitTimeMin);
      }
    });

    const avgWaitTimes = {
      labels: Object.keys(waitTimeByDay),
      data: Object.values(waitTimeByDay).map(times => {
        const sum = times.reduce((acc, t) => acc + t, 0);
        return Math.round(sum / times.length);
      })
    };

    // Peak Hours
    const hourCounts = {};
    queue.forEach(entry => {
      if (entry.joinedAt?._seconds) {
        const joinedDate = new Date(entry.joinedAt._seconds * 1000);
        const hour = `${joinedDate.getHours()}:00`;
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    const peakHours = {
      labels: Object.keys(hourCounts),
      data: Object.values(hourCounts)
    };

    // Party Sizes (1 - 10+)
    const partySizeCount = {};
    queue.forEach(entry => {
    const size = entry.seats > 10 ? '10+' : `${entry.seats}`;
    partySizeCount[size] = (partySizeCount[size] || 0) + 1;
    });

    const sortedLabels = Object.keys(partySizeCount).sort((a, b) => {
    if (a === '10+') return 1;
    if (b === '10+') return -1;
    return Number(a) - Number(b);
    });

    const partySizes = {
    labels: sortedLabels,
    data: sortedLabels.map(size => partySizeCount[size])
    };

    // Live Stats from 12:00 AM to current hour
    const now = new Date();
    const localMidnight = new Date(now);
    localMidnight.setHours(0, 0, 0, 0);

    const hours = [];
    const waiting = Array(24).fill(0);
    const seated = Array(24).fill(0);

    for (let i = 0; i <= now.getHours(); i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }

    queue.forEach(entry => {
      if (!entry.joinedAt?._seconds) return;
      const joined = new Date(entry.joinedAt._seconds * 1000);
      const hour = joined.getHours();
      if (joined >= localMidnight && hour <= now.getHours()) {
        if (entry.status === 'Waiting') waiting[hour]++;
        if (entry.status === 'Seated') seated[hour]++;
      }
    });

    const liveStats = {
      labels: hours,
      waiting: waiting.slice(0, hours.length),
      seated: seated.slice(0, hours.length)
    };

    return res.status(200).json({
      avgWaitTimes,
      peakHours,
      partySizes,
      liveStats
    });
  } catch (error) {
    console.error('❌ Error in getAnalyticsByRestaurant:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
