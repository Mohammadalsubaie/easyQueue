// fixMissingJoinedAt.js
const admin = require('./config/firebase');

(async () => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('queues').get();

    const batch = db.batch();
    let count = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.joinedAt) {
        const ref = db.collection('queues').doc(doc.id);
        batch.update(ref, {
          joinedAt: admin.firestore.Timestamp.now()
        });
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
      console.log(`✅ Updated ${count} queue documents with missing joinedAt.`);
    } else {
      console.log('✅ All documents already have joinedAt.');
    }
  } catch (err) {
    console.error('❌ Error fixing missing joinedAt:', err.message);
  }
})();