import React, { useState } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebase';
import { serverTimestamp } from 'firebase/firestore';
import './RestaurantSetup.css';
import PropTypes from 'prop-types';


const RestaurantSetup = ({ onSetupComplete }) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const db = getFirestore();
    const storage = getStorage();
    const user = auth.currentUser;
    
    try {
      let imageUrl = null;
      
      // Upload image if one was selected
      if (image) {
        const storageRef = ref(storage, `restaurants/${user.uid}/profile`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
        console.log('Image uploaded:', imageUrl);
      }
      
      // Create restaurant document
      await setDoc(doc(db, 'restaurants', user.uid), {
        name,
        imageUrl,
        restaurantId: user.uid, // Using UID as restaurant ID
        createdAt: serverTimestamp(),
        ownerId: user.uid,
        email: user.email,
      });
      
      // Call the callback instead of redirecting
      if (onSetupComplete) {
        onSetupComplete(user.uid);
      } else {
        // Fallback to redirect if no callback is provided
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Error creating restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1 className="title">Setup Your Restaurant</h1>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className="form-group">
            <label className="label">Restaurant Logo</label>
            <div 
              className={`icon-placeholder ${imagePreview ? 'has-image' : ''}`}
              onClick={() => document.getElementById('restaurant-image').click()}
            >
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Restaurant logo preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              ) : (
                <>
                  <div className="icon-text">Logo</div>
                  <div className="icon-text">Click to upload</div>
                </>
              )}
            </div>
            <input
              type="file"
              id="restaurant-image"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <p className="helper-text">Upload your restaurant logo or image</p>
          </div>
          
          {/* Restaurant Name */}
          <div className="form-group">
            <label htmlFor="restaurant-name" className="label">Restaurant Name</label>
            <input
              type="text"
              id="restaurant-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <p className="helper-text">This will be displayed to your customers</p>
          </div>
          
          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Restaurant'}
          </button>
        </form>
      </div>
    </div>
  );
};
RestaurantSetup.propTypes = {
  onSetupComplete: PropTypes.func,
};

export default RestaurantSetup;


