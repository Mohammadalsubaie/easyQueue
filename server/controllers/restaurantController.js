const admin = require('../config/firebase');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

exports.registerRestaurant = async (req, res) => {
  try {
    console.log("🟢 Incoming Registration");
    const { name, email, password, totalSeats } = req.body;
    const logo = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;

    if (!name || !email || !password || !totalSeats || !logo) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const db = admin.firestore();

    const existingByEmail = await db.collection('restaurants').where('email', '==', email).get();
    if (!existingByEmail.empty) {
      return res.status(409).json({ message: "Email is already in use" });
    }

    const existingByName = await db.collection('restaurants').where('name', '==', name).get();
    if (!existingByName.empty) {
      return res.status(409).json({ message: "Restaurant name is already taken" });
    }

    const qrCodeData = `${name}-${Date.now()}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData);

    const restaurantData = {
      name,
      email,
      password, // ⚠️ Hash in production
      totalSeats: Number(totalSeats),
      logo,
      qrCode: qrCodeDataUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('restaurants').add(restaurantData);
    restaurantData.id = docRef.id;

    console.log("✅ Registered:", restaurantData);

    return res.status(201).json({
      message: "Restaurant registered successfully",
      restaurant: restaurantData,
    });
  } catch (error) {
    console.error("❌ Error in registerRestaurant:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.getRestaurants = async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('restaurants').get();
    const restaurants = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      data.id = doc.id;
      restaurants.push(data);
    });

    return res.status(200).json({ restaurants });
  } catch (error) {
    console.error("❌ Error in getRestaurants:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.loginRestaurantManager = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const db = admin.firestore();
    const snapshot = await db.collection('restaurants')
      .where('email', '==', email)
      .where('password', '==', password)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const doc = snapshot.docs[0];
    const restaurant = doc.data();
    restaurant.id = doc.id;

    return res.status(200).json({ restaurant });
  } catch (error) {
    console.error("❌ Error in loginRestaurantManager:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.findRestaurantByName = async (req, res) => {
  try {
    const { name, id, email } = req.query;
    const db = admin.firestore();

    if (id) {
      const docRef = db.collection('restaurants').doc(id);
      const doc = await docRef.get();
      if (!doc.exists) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      const restaurant = doc.data();
      restaurant.id = doc.id;
      return res.status(200).json({ restaurant });
    }

    if (email) {
      const snapshot = await db.collection('restaurants').where('email', '==', email).limit(1).get();
      if (snapshot.empty) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      const doc = snapshot.docs[0];
      const restaurant = doc.data();
      restaurant.id = doc.id;
      return res.status(200).json({ restaurant });
    }

    if (name) {
      const snapshot = await db.collection('restaurants').where('name', '==', name).get();
      if (snapshot.empty) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      const doc = snapshot.docs[0];
      const restaurant = doc.data();
      restaurant.id = doc.id;
      return res.status(200).json({ restaurant });
    }

    return res.status(400).json({ message: "Please provide id, name, or email" });
  } catch (error) {
    console.error("❌ Error in findRestaurantByName:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.updateRestaurantQR = async (req, res) => {
  try {
    const { id } = req.params;
    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({ message: "QR code is required" });
    }

    const db = admin.firestore();
    const ref = db.collection('restaurants').doc(id);
    await ref.update({ qrCode });

    const updatedDoc = await ref.get();
    const updatedRestaurant = updatedDoc.data();
    updatedRestaurant.id = updatedDoc.id;

    return res.status(200).json({
      message: "QR code updated successfully",
      restaurant: updatedRestaurant
    });
  } catch (error) {
    console.error("❌ Error in updateRestaurantQR:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, totalSeats } = req.body;

    if (!name && (totalSeats === undefined || totalSeats === null)) {
      return res.status(400).json({ message: "At least one field (name or totalSeats) must be provided" });
    }

    const updateData = {};
    if (name && typeof name === 'string' && name.trim().length > 0) {
      updateData.name = name.trim();
    }
    if (totalSeats !== undefined && !isNaN(totalSeats)) {
      updateData.totalSeats = Number(totalSeats);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Invalid or missing fields to update" });
    }

    const db = admin.firestore();
    const ref = db.collection('restaurants').doc(id);
    await ref.update(updateData);

    const updatedDoc = await ref.get();
    const updatedRestaurant = updatedDoc.data();
    updatedRestaurant.id = updatedDoc.id;

    return res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant: updatedRestaurant
    });
  } catch (error) {
    console.error("❌ Error in updateRestaurant:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.updateRestaurantLogo = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "Logo file is required" });

    const logoUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    const db = admin.firestore();
    const ref = db.collection('restaurants').doc(id);
    await ref.update({ logo: logoUrl });

    const updatedDoc = await ref.get();
    const updatedRestaurant = updatedDoc.data();
    updatedRestaurant.id = updatedDoc.id;

    return res.status(200).json({
      message: "Logo updated successfully",
      logo: logoUrl,
      restaurant: updatedRestaurant
    });
  } catch (error) {
    console.error("❌ Error in updateRestaurantLogo:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};