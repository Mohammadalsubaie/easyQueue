const admin = require('../config/firebase');

// Get all menu items for a restaurant
exports.getMenuByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ message: 'restaurantId is required' });
    }

    const snapshot = await admin.firestore()
      .collection('menus')
      .where('restaurantId', '==', restaurantId)
      .get();

    const menu = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ menu });
  } catch (error) {
    console.error('❌ Error fetching menu:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Add a new menu item
exports.addMenuItem = async (req, res) => {
  try {
    const { name, description, category, image, restaurantId } = req.body;

    if (!name || !category || !restaurantId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const item = {
      name,
      description: description || '',
      category,
      image: image || '',
      restaurantId
    };

    const docRef = await admin.firestore().collection('menus').add(item);
    res.status(201).json({ id: docRef.id, ...item });
  } catch (error) {
    console.error('❌ Error adding menu item:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    await admin.firestore().collection('menus').doc(id).delete();
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting item:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};