// import React, { useState } from 'react';
// import { getFirestore, doc, setDoc } from 'firebase/firestore';
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { auth } from '../firebase';
// import { serverTimestamp } from 'firebase/firestore';
// import './RestaurantSetup.css';
// import PropTypes from 'prop-types';


// const RestaurantSetup = ({ onSetupComplete }) => {
//   const [name, setName] = useState('');
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImage(file);
//       // Create preview URL
//       const reader = new FileReader();
//       reader.onload = () => {
//         setImagePreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     const db = getFirestore();
//     const storage = getStorage();
//     const user = auth.currentUser;
    
//     try {
//       let imageUrl = null;
      
//       // Upload image if one was selected
//       if (image) {
//         const storageRef = ref(storage, `restaurants/${user.uid}/profile`);
//         await uploadBytes(storageRef, image);
//         imageUrl = await getDownloadURL(storageRef);
//         console.log('Image uploaded:', imageUrl);
//       }
      
//       // Create restaurant document
//       await setDoc(doc(db, 'restaurants', user.uid), {
//         name,
//         imageUrl,
//         restaurantId: user.uid, // Using UID as restaurant ID
//         createdAt: serverTimestamp(),
//         ownerId: user.uid,
//         email: user.email,
//       });
      
//       // Call the callback instead of redirecting
//       if (onSetupComplete) {
//         onSetupComplete(user.uid);
//       } else {
//         // Fallback to redirect if no callback is provided
//         window.location.href = '/dashboard';
//       }
//     } catch (error) {
//       console.error('Error creating restaurant:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container">
//       <div className="card">
//         <div className="header">
//           <h1 className="title">Setup Your Restaurant</h1>
//         </div>
        
//         <form onSubmit={handleSubmit}>
//           {/* Image Upload */}
//           <div className="form-group">
//             <label className="label">Restaurant Logo</label>
//             <div 
//               className={`icon-placeholder ${imagePreview ? 'has-image' : ''}`}
//               onClick={() => document.getElementById('restaurant-image').click()}
//             >
//               {imagePreview ? (
//                 <img 
//                   src={imagePreview} 
//                   alt="Restaurant logo preview" 
//                   style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
//                 />
//               ) : (
//                 <>
//                   <div className="icon-text">Logo</div>
//                   <div className="icon-text">Click to upload</div>
//                 </>
//               )}
//             </div>
//             <input
//               type="file"
//               id="restaurant-image"
//               accept="image/*"
//               onChange={handleImageChange}
//               style={{ display: 'none' }}
//             />
//             <p className="helper-text">Upload your restaurant logo or image</p>
//           </div>
          
//           {/* Restaurant Name */}
//           <div className="form-group">
//             <label htmlFor="restaurant-name" className="label">Restaurant Name</label>
//             <input
//               type="text"
//               id="restaurant-name"
//               className="input"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//             />
//             <p className="helper-text">This will be displayed to your customers</p>
//           </div>
          
//           <button 
//             type="submit" 
//             className="submit-button" 
//             disabled={loading}
//           >
//             {loading ? 'Creating...' : 'Create Restaurant'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };
// RestaurantSetup.propTypes = {
//   onSetupComplete: PropTypes.func,
// };

// export default RestaurantSetup;


// import React, { useState, useEffect } from 'react';
// import { getFirestore, doc, setDoc } from 'firebase/firestore';
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { auth } from '../firebase';
// import { serverTimestamp } from 'firebase/firestore';
// import { useNavigate } from 'react-router-dom';
// import './RestaurantSetup.css';
// import PropTypes from 'prop-types';

// const RestaurantSetup = ({ onSetupComplete }) => {
//   const [name, setName] = useState('');
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [dragActive, setDragActive] = useState(false);
//   const [setupStage, setSetupStage] = useState('start');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkAuth = () => {
//       const user = auth.currentUser;
//       if (!user) {
//         navigate('/');
//       }
//     };
    
//     checkAuth();
//     const unsubscribe = auth.onAuthStateChanged(user => {
//       if (!user) {
//         navigate('/');
//       }
//     });
    
//     return () => unsubscribe();
//   }, [navigate]);

//   // Drag and drop handlers
//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === 'dragenter' || e.type === 'dragover') {
//       setDragActive(true);
//     } else if (e.type === 'dragleave') {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleFileChange(e.dataTransfer.files[0]);
//     }
//   };

//   const handleFileChange = (file) => {
//     // Check file size (max 2MB)
//     if (file.size > 2 * 1024 * 1024) {
//       setError('Image size must be less than 2MB');
//       return;
//     }
    
//     setImage(file);
//     // Create preview URL
//     const reader = new FileReader();
//     reader.onload = () => {
//       setImagePreview(reader.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleImageChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       handleFileChange(e.target.files[0]);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSetupStage('uploading');
    
//     if (!name.trim()) {
//       setError('Restaurant name is required');
//       setLoading(false);
//       setSetupStage('start');
//       return;
//     }
    
//     const db = getFirestore();
//     const storage = getStorage();
//     const user = auth.currentUser;
    
//     if (!user) {
//       setError('You must be logged in to create a restaurant');
//       setLoading(false);
//       setSetupStage('start');
//       return;
//     }
    
//     try {
//       let imageUrl = null;
      
//       // Upload image if one was selected
//       if (image) {
//         try {
//           setSetupStage('uploading-image');
//           console.log('Uploading image...');
//           const storageRef = ref(storage, `restaurants/${user.uid}/profile`);
//           const uploadTask = await uploadBytes(storageRef, image);
//           console.log('Upload successful:', uploadTask);
          
//           imageUrl = await getDownloadURL(storageRef);
//           console.log('Image URL obtained:', imageUrl);
//         } catch (imageError) {
//           console.error('Error uploading image:', imageError);
//           // Continue without image if upload fails
//         }
//       }
      
//       // Create restaurant document
//       setSetupStage('creating-restaurant');
//       console.log('Creating restaurant document...');
//       const restaurantData = {
//         name,
//         imageUrl,
//         restaurantId: user.uid, // Using UID as restaurant ID
//         createdAt: serverTimestamp(),
//         ownerId: user.uid,
//         email: user.email,
//       };
      
//       console.log('Restaurant data:', restaurantData);
//       await setDoc(doc(db, 'restaurants', user.uid), restaurantData);
      
//       console.log('Restaurant created successfully');
//       setSetupStage('completed');
      
//       // Small delay to show success message
//       setTimeout(() => {
//         // Call the callback if provided
//         if (onSetupComplete) {
//           onSetupComplete(user.uid);
//           console.log('Setup complete callback executed');
//         }
        
//         // Navigate to dashboard directly
//         console.log('Navigating to dashboard...');
//         window.location.href = '/dashboard';
//       }, 1500);
      
//     } catch (error) {
//       console.error('Error creating restaurant:', error);
//       setError(`Failed to create restaurant: ${error.message}`);
//       setLoading(false);
//       setSetupStage('start');
//     }
//   };

//   // Get the button text based on current stage
//   const getButtonText = () => {
//     switch (setupStage) {
//       case 'uploading':
//         return 'Creating...';
//       case 'uploading-image':
//         return 'Uploading Image...';
//       case 'creating-restaurant':
//         return 'Setting Up Restaurant...';
//       case 'completed':
//         return 'Success! Redirecting...';
//       default:
//         return 'Create Restaurant';
//     }
//   };

//   return (
//     <div className="container">
//       <div className="card">
//         <div className="header">
//           <h1 className="title">Setup Your Restaurant</h1>
//           <p className="subtitle"> Lets get your restaurant ready for customers</p>
//         </div>
        
//         {error && <div className="error-message">{error}</div>}
        
//         <form onSubmit={handleSubmit}>
//           {/* Image Upload */}
//           <div className="form-group">
//             <label className="label">Restaurant Logo</label>
//             <div 
//               className={`icon-placeholder ${imagePreview ? 'has-image' : ''} ${dragActive ? 'drag-active' : ''}`}
//               onClick={() => document.getElementById('restaurant-image').click()}
//               onDragEnter={handleDrag}
//               onDragOver={handleDrag}
//               onDragLeave={handleDrag}
//               onDrop={handleDrop}
//             >
//               {imagePreview ? (
//                 <img 
//                   src={imagePreview} 
//                   alt="Restaurant logo preview" 
//                   style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
//                 />
//               ) : (
//                 <>
//                   <div className="upload-icon">🖼️</div>
//                   <div className="icon-text">Click or drag to upload</div>
//                   <div className="icon-subtext">JPG, PNG or GIF (max 2MB)</div>
//                 </>
//               )}
//             </div>
//             <input
//               type="file"
//               id="restaurant-image"
//               accept="image/*"
//               onChange={handleImageChange}
//               style={{ display: 'none' }}
//             />
//             <p className="helper-text">Upload your restaurant logo or image for customers to recognize your brand</p>
//           </div>
          
//           {/* Restaurant Name */}
//           <div className="form-group">
//             <label htmlFor="restaurant-name" className="label">Restaurant Name</label>
//             <input
//               type="text"
//               id="restaurant-name"
//               className="input"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="Enter your restaurant name"
//               required
//             />
//             <p className="helper-text">This will be displayed to your customers in the queue interface</p>
//           </div>
          
//           <button 
//             type="submit" 
//             className={`submit-button ${loading ? 'loading' : ''}`}
//             disabled={loading}
//           >
//             {loading && <span className="spinner"></span>}
//             {getButtonText()}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// RestaurantSetup.propTypes = {
//   onSetupComplete: PropTypes.func,
// };

// export default RestaurantSetup;


import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc, updateDoc, serverTimestamp, addDoc, deleteDoc } from "firebase/firestore";
import { auth, functions } from "../firebase";
import "./dashboard.css";
import RestaurantSetup from "./RestaurantSetup";

const Dashboard = () => {
  const [queue, setQueue] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantLogo, setRestaurantLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchRestaurantData = async (user) => {
      if (!user) {
        setLoading(false);
        setError("Not authenticated. Please login first.");
        return;
      }
      
      const db = getFirestore();
      try {
        const userDoc = await getDoc(doc(db, "restaurants", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.restaurantId) {
            setRestaurantId(data.restaurantId);
            // Set restaurant name and logo
            setRestaurantName(data.name || 'EasyQueue');
            setRestaurantLogo(data.imageUrl || null);
          } else {
            setNeedsSetup(true);
          }
        } else {
          setNeedsSetup(true);
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
        setError("Failed to load restaurant data");
      } finally {
        setLoading(false);
      }
    };
    
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchRestaurantData(user);
      } else {
        // Redirect to login if not authenticated
        window.location.href = "/";
        setLoading(false);
      }
    });
    
    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (restaurantId) {
      const db = getFirestore();
      try {
        // First, just check if we can get waiting queue items without ordering
        const q = query(
          collection(db, "queue"),
          where("restaurantId", "==", restaurantId),
          where("status", "==", "Waiting")
        );

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            try {
              // Sort the data on the client side instead of using orderBy in Firestore
              const sortedDocs = [...snapshot.docs].sort((a, b) => {
                const dataA = a.data();
                const dataB = b.data();
                
                // Use manualTimestamp if available, otherwise use timestamp
                const timestampA = dataA.manualTimestamp || dataA.timestamp;
                const timestampB = dataB.manualTimestamp || dataB.timestamp;
                
                // Handle cases where timestamp might be missing
                if (!timestampA) return 1;
                if (!timestampB) return -1;
                
                // If both have seconds property, they are Firestore timestamps
                if (timestampA.seconds && timestampB.seconds) {
                  return timestampA.seconds - timestampB.seconds;
                }
                
                // Fallback to string comparison of ISO date if available
                if (dataA.createdAt && dataB.createdAt) {
                  return dataA.createdAt.localeCompare(dataB.createdAt);
                }
                
                return 0; // No way to sort, maintain order
              });
              
              const queueData = sortedDocs.map((doc, index) => ({
                id: doc.id,
                position: index + 1, // Add position based on sorted order
                ...doc.data(),
                waitingTime: calculateWaitingTime(doc.data().timestamp),
              }));
              
              setQueue(queueData);
              setError(null); // Clear any existing errors
            } catch (err) {
              console.error("Error processing queue data:", err);
              setError("Error processing queue data");
            }
          },
          (error) => {
            console.error("Error fetching queue data:", error);
            setError("Failed to load queue data: " + error.message);
          }
        );
        return () => unsubscribe();
      } catch (err) {
        console.error("Error setting up queue listener:", err);
        setError("Failed to set up queue monitoring");
      }
    }
  }, [restaurantId]);

  // Handle setup completion
  const handleSetupComplete = (newRestaurantId) => {
    setRestaurantId(newRestaurantId);
    setNeedsSetup(false);
    setLoading(false);
  };

  const calculateWaitingTime = (timestamp) => {
    if (!timestamp) return "00:00:00";
    const diff = Date.now() - timestamp.toDate().getTime();
    return new Date(diff).toISOString().substr(11, 8);
  };

  const handleStatusChange = async (queueId, newStatus, customerPhone) => {
    if (!window.confirm(`Mark this customer as ${newStatus}?`)) return;

    try {
      setQueue((prevQueue) =>
        prevQueue.map((customer) =>
          customer.id === queueId ? { ...customer, status: newStatus } : customer
        )
      );

      await updateDoc(doc(getFirestore(), "queue", queueId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      setHistory((prevHistory) => [
        ...prevHistory,
        { action: newStatus, queueId, phone: customerPhone, timestamp: new Date().toISOString() },
      ]);

      const db = getFirestore();
      const his = await addDoc(collection(db, "history"), {
        queueId: queueId,
        restaurantId: restaurantId,
        phone: customerPhone,
        history: serverTimestamp(),
        action: newStatus,
        timestamp: new Date().toISOString(),
      });
      await updateDoc(doc(db, 'history', his.id), {
          hisId: his.id
      });
      
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Update failed. Please try again.");
    }
  };

  const sendWhatsAppMessage = async (phoneNumber) => {
    if (!window.confirm("Send WhatsApp message to this customer?")) return;

    const defaultMessage = "Your table is ready! Please proceed to the restaurant.";
    try {
      const sendWhatsAppMessageFunction = functions.httpsCallable("sendWhatsAppMessage");
      const result = await sendWhatsAppMessageFunction({ phoneNumber, message: defaultMessage });
      if (result.data.success) {
        alert("Message sent successfully!");
        setHistory((prevHistory) => [
          ...prevHistory,
          { action: "Message Sent", phone: phoneNumber, timestamp: new Date().toISOString() },
        ]);
      } else {
        alert("Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const copyLinkToClipboard = async () => {
    if (!restaurantId) {
      alert("No restaurant ID available to copy.");
      return;
    }
    const link = `${window.location.origin}/join-queue/${restaurantId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      alert("Failed to copy link. Please try again.");
    }
  }; 

  useEffect(() => {
    const db = getFirestore();
    if (restaurantId) {
      const q = query(
        collection(db, "history"),
        where("restaurantId", "==", restaurantId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const historyData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setHistory(historyData);
        },
        (error) => {
          console.error("Error fetching history data:", error);
          setError("Failed to load history data");
        }
      );

      return () => unsubscribe();
    }
  }, [restaurantId]);
  
  const deleteHistoryEntry = async (historyId) => {
    if (!window.confirm("Are you sure you want to delete this history entry?")) return;
    
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "history", historyId));
      // The onSnapshot listener will automatically update the UI
      console.log("History entry deleted successfully");
    } catch (error) {
      console.error("Error deleting history entry:", error);
      alert("Failed to delete history entry. Please try again.");
    }
  };

  if (needsSetup) return <RestaurantSetup onSetupComplete={handleSetupComplete} />;
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner-container">
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
        </div>
        <div className="spinner-text">Loading Dashboard...</div>
      </div>
    );
  }
  
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="restaurant-branding">
          {restaurantLogo ? (
            <img 
              src={restaurantLogo} 
              alt={`${restaurantName} Logo`} 
              className="restaurant-logo" 
            />
          ) : (
            <div className="restaurant-logo-placeholder">
              {restaurantName?.charAt(0) || 'E'}
            </div>
          )}
          <h1>{restaurantName}</h1>
        </div>
        <div className="header-controls">
          <button
            className="qr-toggle"
            onClick={() => setShowQR(!showQR)}
          >
            {showQR ? "Hide QR Code" : "Show QR Code"}
          </button>
        </div>
      </header>

      <div className="main-content">
        {showQR && (
          <section className="qr-section">
            <h2>Customer Join QR Code</h2>
            <div className="qr-wrapper">
              {restaurantId ? (
                <>
                  <QRCodeSVG
                    value={`${window.location.origin}/join-queue/${restaurantId}`}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#2d3748"
                    level="H"
                    includeMargin={true}
                  />
                  <div className="qr-actions">
                    <button
                      onClick={() => window.print()}
                      className="print-btn"
                    >
                      <span>🖨️</span> Print QR Code
                    </button>
                    <button
                      onClick={copyLinkToClipboard}
                      className="copy-link-btn"
                    >
                      <span>{copySuccess ? '✅' : '🔗'}</span> 
                      {copySuccess ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </>
              ) : (
                <p>Generating QR code...</p>
              )}
            </div>
          </section>
        )}

        <main className="queue-management" id="queue">
          <div className="queue-header">
            <h3>Current Queue</h3>
            <div className="queue-stats">
              <span>Total: {queue.length}</span>
              <span>Waiting: {queue.filter((c) => c.status === "Waiting").length}</span>
            </div>
          </div>
          
          {queue.length === 0 ? (
            <div className="empty-queue">
              <p>No customers in queue. Share your QR code to start receiving customers!</p>
            </div>
          ) : (
            <table className="queue-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Phone Number</th>
                  <th>Seats</th>
                  <th>Wait Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((customer) => (
                  <tr key={customer.id} className="queue-item">
                    <td>{customer.position}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.seats}</td>
                    <td>{customer.waitingTime}</td>
                    <td className={`status ${customer.status.toLowerCase()}`}>
                      {customer.status}
                    </td>
                    <td className="actions">
                      <button
                        className="action-btn seat"
                        onClick={() => handleStatusChange(customer.id, "Seated", customer.phone)}
                      >
                        <span>✓</span> Seat
                      </button>
                      <button
                        className="action-btn remove"
                        onClick={() => handleStatusChange(customer.id, "Removed", customer.phone)}
                      >
                        <span>✕</span> Remove
                      </button>
                      <button
                        className="action-btn message"
                        onClick={() => sendWhatsAppMessage(customer.phone)}
                      >
                        <span>📱</span> Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>

        <div style={{ margin: "20px 0" }}></div>

        <main className="queue-management" id="history">
          <div className="queue-header">
            <h3>Action History</h3>
          </div>
          
          {history.length === 0 ? (
            <div className="empty-history">
              <p>No history records yet. Actions will be logged here.</p>
            </div>
          ) : (
            <table className="queue-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => (
                  <tr key={index} className="queue-item">
                    <td>{entry.timestamp}</td>
                    <td>{entry.action}</td>
                    <td>{entry.phone ? `Phone: ${entry.phone}` : (entry.queueId ? `Queue ID: ${entry.queueId}` : 'N/A')}</td>
                    <td>
                      <button
                        className="action-btn remove"
                        onClick={() => deleteHistoryEntry(entry.id || entry.hisId)}
                        title="Delete history entry"
                      >
                        <span>🗑️</span> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;