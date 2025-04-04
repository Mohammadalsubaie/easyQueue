// import React, { useEffect, useState } from "react";
// import { QRCodeSVG } from "qrcode.react";
// import { getFirestore, collection, query, where, onSnapshot, doc, getDoc, updateDoc, serverTimestamp, addDoc, deleteDoc } from "firebase/firestore";
// import { auth, functions } from "../firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { useNavigate } from "react-router-dom";
// import "./dashboard.css";
// import RestaurantSetup from "./RestaurantSetup";

// const Dashboard = () => {
//   const [queue, setQueue] = useState([]);
//   const [restaurantId, setRestaurantId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showQR, setShowQR] = useState(false);
//   const [needsSetup, setNeedsSetup] = useState(false);
//   const [error, setError] = useState(null);
//   const [history, setHistory] = useState([]);
//   const navigate = useNavigate();

//   // Check authentication state first
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (!user) {
//         // No user is signed in, redirect to login
//         navigate("/");
//         return;
//       }

//       // User is signed in, proceed with fetching restaurant data
//       fetchRestaurantData(user);
//     });

//     return () => unsubscribe();
//   }, [navigate]);

//   const fetchRestaurantData = async (user) => {
//     if (!user) return;
    
//     const db = getFirestore();
//     try {
//       const userDoc = await getDoc(doc(db, "restaurants", user.uid));
//       if (userDoc.exists()) {
//         const data = userDoc.data();
//         if (data.restaurantId) {
//           setRestaurantId(data.restaurantId);
//           setNeedsSetup(false);
//         } else {
//           setNeedsSetup(true);
//         }
//       } else {
//         setNeedsSetup(true);
//       }
//     } catch (error) {
//       console.error("Error fetching restaurant data:", error);
//       setError("Failed to load restaurant data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!restaurantId) return;
    
//     const db = getFirestore();
//     const q = query(
//       collection(db, "queue"),
//       where("restaurantId", "==", restaurantId),
//       where("status", "==", "Waiting")
//     );

//     const unsubscribe = onSnapshot(
//       q,
//       (snapshot) => {
//         const queueData = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//           waitingTime: calculateWaitingTime(doc.data().timestamp),
//         }));
//         setQueue(queueData);
//       },
//       (error) => {
//         console.error("Error fetching queue data:", error);
//         setError("Failed to load queue data");
//       }
//     );
//     return () => unsubscribe();
//   }, [restaurantId]);

//   // Handle setup completion
//   const handleSetupComplete = (newRestaurantId) => {
//     setRestaurantId(newRestaurantId);
//     setNeedsSetup(false);
//     setLoading(false);
//   };

//   const calculateWaitingTime = (timestamp) => {
//     if (!timestamp) return "00:00:00";
//     const diff = Date.now() - timestamp.toDate().getTime();
//     return new Date(diff).toISOString().substr(11, 8);
//   };

//   // Format timestamp to a readable string
//   const formatTimestamp = (timestamp) => {
//     if (!timestamp) return "N/A";
    
//     // Check if it's a Firebase timestamp
//     if (timestamp && typeof timestamp.toDate === 'function') {
//       return new Date(timestamp.toDate()).toLocaleString();
//     }
    
//     // Check if it's a string representation of a date
//     if (typeof timestamp === 'string') {
//       try {
//         return new Date(timestamp).toLocaleString();
//       } catch (e) {
//         return timestamp;
//       }
//     }
    
//     return "N/A";
//   };

//   const handleStatusChange = async (queueId, newStatus, phone) => {
//     if (!window.confirm(`Mark this customer as ${newStatus}?`)) return;

//     try {
//       setQueue((prevQueue) =>
//         prevQueue.map((customer) =>
//           customer.id === queueId ? { ...customer, status: newStatus } : customer
//         )
//       );

//       await updateDoc(doc(getFirestore(), "queue", queueId), {
//         status: newStatus,
//         updatedAt: serverTimestamp(),
//       });

//       setHistory((prevHistory) => [
//         ...prevHistory,
//         { action: newStatus, queueId, phone, timestamp: new Date().toISOString() },
//       ]);

//       const db = getFirestore();
//       const his = await addDoc(collection(db, "history"), {
//         queueId: queueId,
//         restaurantId: restaurantId,
//         history: serverTimestamp(),
//         action: newStatus,
//         phone: phone,
//         timestamp: new Date().toISOString(),
//       });
//       await updateDoc(doc(db, 'history', his.id), {
//           hisId: his.id
//       });
      
//     } catch (error) {
//       console.error("Error updating status:", error);
//       alert("Update failed. Please try again.");
//     }
//   };

//   const sendWhatsAppMessage = async (phoneNumber) => {
//     if (!window.confirm("Send WhatsApp message to this customer?")) return;

//     const defaultMessage = "Your table is ready! Please proceed to the restaurant.";
//     try {
//       const sendWhatsAppMessageFunction = functions.httpsCallable("sendWhatsAppMessage");
//       const result = await sendWhatsAppMessageFunction({ phoneNumber, message: defaultMessage });
//       if (result.data.success) {
//         alert("Message sent successfully!");
//         setHistory((prevHistory) => [
//           ...prevHistory,
//           { action: "Message Sent", phoneNumber, timestamp: new Date().toISOString() },
//         ]);
//       } else {
//         alert("Failed to send message.");
//       }
//     } catch (error) {
//       console.error("Error sending WhatsApp message:", error);
//       alert("Failed to send message. Please try again.");
//     }
//   };

//   const deleteHistoryEntry = async (historyId) => {
//     if (!window.confirm("Are you sure you want to delete this history entry?")) return;
    
//     try {
//       const db = getFirestore();
//       await deleteDoc(doc(db, "history", historyId));
//       setHistory(prevHistory => prevHistory.filter(entry => entry.id !== historyId && entry.hisId !== historyId));
//     } catch (error) {
//       console.error("Error deleting history entry:", error);
//       alert("Delete failed. Please try again.");
//     }
//   };

//   const copyLinkToClipboard = async () => {
//     if (!restaurantId) {
//       alert("No restaurant ID available to copy.");
//       return;
//     }
//     const link = `${window.location.origin}/join-queue/${restaurantId}`;
//     try {
//       await navigator.clipboard.writeText(link);
//       alert("Link copied to clipboard!");
//     } catch (error) {
//       console.error("Failed to copy link:", error);
//       alert("Failed to copy link. Please try again.");
//     }
//   }; 

//   useEffect(() => {
//     if (!restaurantId) return;
    
//     const db = getFirestore();
//     const q = query(
//       collection(db, "history"),
//       where("restaurantId", "==", restaurantId)
//     );

//     const unsubscribe = onSnapshot(
//       q,
//       (snapshot) => {
//         const historyData = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setHistory(historyData);
//       },
//       (error) => {
//         console.error("Error fetching history data:", error);
//         setError("Failed to load history data");
//       }
//     );

//     return () => unsubscribe();
//   }, [restaurantId]);

//   if (needsSetup) return <RestaurantSetup onSetupComplete={handleSetupComplete} />;
//   if (loading) {
//     return (
//       <div className="loading">
//         <div className="spinner-container">
//           <div className="spinner-circle"></div>
//           <div className="spinner-circle"></div>
//         </div>
//         <div className="spinner-text">Loading Dashboard...</div>
//       </div>
//     );
//   }
//   if (error) return <div className="error">{error}</div>;

//   return (
//     <div className="dashboard-container">
//       <header className="header">
//         <h1>EasyQueue</h1>
//         <div className="header-controls">
//           <button
//             className="qr-toggle"
//             onClick={() => setShowQR(!showQR)}
//           >
//             {showQR ? "Hide QR" : "Show QR"}
//           </button>
//         </div>
//       </header>

//       <div className="main-content">
//         {showQR && (
//           <section className="qr-section">
//             <h2>Customer Join QR Code</h2>
//             <div className="qr-wrapper">
//               {restaurantId ? (
//                 <>
//                   <QRCodeSVG
//                     value={`${window.location.origin}/join-queue/${restaurantId}`}
//                     size={200}
//                     bgColor="#ffffff"
//                     fgColor="#2a4365"
//                     level="H"
//                   />
//                   <div className="qr-actions">
//                     <button
//                       onClick={() => window.print()}
//                       className="print-btn"
//                     >
//                       Print QR Code
//                     </button>
//                     <button
//                       onClick={copyLinkToClipboard}
//                       className="copy-link-btn"
//                     >
//                       Copy Link
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 <p>Generating QR code...</p>
//               )}
//             </div>
//           </section>
//         )}

//         <main className="queue-management" id="queue">
//           <div className="queue-header">
//             <h3>Current Queue</h3>
//             <div className="queue-stats">
//               <span>Total: {queue.length}</span>
//               <span>Waiting: {queue.filter((c) => c.status === "Waiting").length}</span>
//             </div>
//           </div>
//           <table className="queue-table">
//             <thead>
//               <tr>
//                 <th>Position</th>
//                 <th>Phone Number</th>
//                 <th>Seats</th>
//                 <th>Wait Time</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {queue.map((customer, index) => (
//                 <tr key={customer.id} className="queue-item">
//                   <td>{index + 1}</td>
//                   <td>{customer.phone}</td>
//                   <td>{customer.seats}</td>
//                   <td>{customer.waitingTime}</td>
//                   <td>
//                     <span className={`status ${customer.status.toLowerCase()}`}>
//                       {customer.status}
//                     </span>
//                   </td>
//                   <td className="actions">
//                     <button
//                       className="action-btn seat"
//                       onClick={() => handleStatusChange(customer.id, "Seated", customer.phone)}
//                     >
//                       ✓ Seat
//                     </button>
//                     <button
//                       className="action-btn remove"
//                       onClick={() => handleStatusChange(customer.id, "Removed", customer.phone)}
//                     >
//                       ✕ Remove
//                     </button>
//                     <button
//                       className="action-btn message"
//                       onClick={() => sendWhatsAppMessage(customer.phone)}
//                     >
//                       📩 Message
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {queue.length === 0 && (
//                 <tr>
//                   <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
//                     No customers in queue
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </main>

//         <div style={{ margin: "20px 0" }}></div>

//         <main className="queue-management" id="history">
//           <div className="queue-header">
//             <h3>Action History</h3>
//           </div>
//           <table className="queue-table">
//             <thead>
//               <tr>
//                 <th>Timestamp</th>
//                 <th>Action</th>
//                 <th>Details</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {history.map((entry, index) => (
//                 <tr key={index} className="queue-item">
//                   <td>{formatTimestamp(entry.timestamp)}</td>
//                   <td>{entry.action}</td>
//                   <td>{entry.phone ? `Phone: ${entry.phone}` : (entry.queueId ? `Queue ID: ${entry.queueId}` : 'N/A')}</td>
//                   <td>
//                     <button
//                       className="action-btn remove"
//                       onClick={() => deleteHistoryEntry(entry.id || entry.hisId)}
//                       title="Delete history entry"
//                     >
//                       🗑️ Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {history.length === 0 && (
//                 <tr>
//                   <td colSpan="4" style={{ textAlign: "center", padding: "2rem" }}>
//                     No history yet
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </main>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;


//---------------------------------------------------------------

import React, { useEffect, useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  addDoc, 
  deleteDoc,
  getDocs
} from "firebase/firestore";
import { auth, functions } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import RestaurantSetup from "./RestaurantSetup";

// Initialize localStorage keys for queue and history data
const QUEUE_CACHE_KEY = 'easyqueue_cached_queue';
const HISTORY_CACHE_KEY = 'easyqueue_cached_history';
const RESTAURANT_ID_KEY = 'easyqueue_restaurant_id';

const Dashboard = () => {
  const [queue, setQueue] = useState(() => {
    // Try to load queue from localStorage first
    const cachedQueue = localStorage.getItem(QUEUE_CACHE_KEY);
    return cachedQueue ? JSON.parse(cachedQueue) : [];
  });
  const [restaurantId, setRestaurantId] = useState(() => {
    // Try to load restaurantId from localStorage
    return localStorage.getItem(RESTAURANT_ID_KEY) || null;
  });
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => {
    // Try to load history from localStorage first
    const cachedHistory = localStorage.getItem(HISTORY_CACHE_KEY);
    return cachedHistory ? JSON.parse(cachedHistory) : [];
  });
  const navigate = useNavigate();

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    if (queue.length > 0) {
      localStorage.setItem(QUEUE_CACHE_KEY, JSON.stringify(queue));
    }
  }, [queue]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(history));
    }
  }, [history]);

  // Save restaurantId to localStorage
  useEffect(() => {
    if (restaurantId) {
      localStorage.setItem(RESTAURANT_ID_KEY, restaurantId);
    }
  }, [restaurantId]);

  // Fetch queue data from Firestore
  const fetchQueueData = useCallback(async (id) => {
    if (!id) return;
    
    const db = getFirestore();
    
    // First, get the data immediately with getDocs
    try {
      const q = query(
        collection(db, "queue"),
        where("restaurantId", "==", id),
        where("status", "==", "Waiting")
      );
      
      const snapshot = await getDocs(q);
      const queueData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        waitingTime: calculateWaitingTime(doc.data().timestamp),
      }));
      
      setQueue(queueData);
      
      // Then set up the real-time listener
      return onSnapshot(
        q,
        (snapshot) => {
          const updatedQueueData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            waitingTime: calculateWaitingTime(doc.data().timestamp),
          }));
          setQueue(updatedQueueData);
        },
        (error) => {
          console.error("Error fetching queue data:", error);
          setError("Failed to load queue data");
        }
      );
    } catch (error) {
      console.error("Error in initial queue fetch:", error);
      setError("Failed to load initial queue data");
    }
  }, []);

  // Fetch history data from Firestore
  const fetchHistoryData = useCallback(async (id) => {
    if (!id) return;
    
    const db = getFirestore();
    
    // First, get the data immediately with getDocs
    try {
      const q = query(
        collection(db, "history"),
        where("restaurantId", "==", id)
      );
      
      const snapshot = await getDocs(q);
      const historyData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setHistory(historyData);
      
      // Then set up the real-time listener
      return onSnapshot(
        q,
        (snapshot) => {
          const updatedHistoryData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setHistory(updatedHistoryData);
        },
        (error) => {
          console.error("Error fetching history data:", error);
          setError("Failed to load history data");
        }
      );
    } catch (error) {
      console.error("Error in initial history fetch:", error);
      setError("Failed to load initial history data");
    }
  }, []);

  const fetchRestaurantData = useCallback(async (user) => {
    if (!user) return;
    
    const db = getFirestore();
    try {
      const userDoc = await getDoc(doc(db, "restaurants", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.restaurantId) {
          setRestaurantId(data.restaurantId);
          setNeedsSetup(false);
          
          // Immediately fetch queue and history data
          fetchQueueData(data.restaurantId);
          fetchHistoryData(data.restaurantId);
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
  }, [fetchQueueData, fetchHistoryData]);

  // Check authentication state first
  useEffect(() => {
    let queueUnsubscribe = null;
    let historyUnsubscribe = null;
    
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // No user is signed in, redirect to login
        navigate("/");
        return;
      }

      // User is signed in, proceed with fetching restaurant data
      fetchRestaurantData(user);
    });

    return () => {
      // Clean up all subscriptions
      authUnsubscribe();
      if (queueUnsubscribe) queueUnsubscribe();
      if (historyUnsubscribe) historyUnsubscribe();
    };
  }, [navigate, fetchRestaurantData]);

  // Calculate waiting time from timestamp
  const calculateWaitingTime = (timestamp) => {
    if (!timestamp) return "00:00:00";
    try {
      const diff = Date.now() - timestamp.toDate().getTime();
      return new Date(diff).toISOString().substr(11, 8);
    } catch (error) {
      return "00:00:00";
    }
  };

  // Handle setup completion
  const handleSetupComplete = (newRestaurantId) => {
    setRestaurantId(newRestaurantId);
    setNeedsSetup(false);
    setLoading(false);
    
    // Immediately start fetching data
    fetchQueueData(newRestaurantId);
    fetchHistoryData(newRestaurantId);
  };

  // Format timestamp to a readable string
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    
    // Check if it's a Firebase timestamp
    if (timestamp && typeof timestamp.toDate === 'function') {
      return new Date(timestamp.toDate()).toLocaleString();
    }
    
    // Check if it's a string representation of a date
    if (typeof timestamp === 'string') {
      try {
        return new Date(timestamp).toLocaleString();
      } catch (e) {
        return timestamp;
      }
    }
    
    return "N/A";
  };

  const handleStatusChange = async (queueId, newStatus, phone) => {
    if (!window.confirm(`Mark this customer as ${newStatus}?`)) return;

    try {
      // Optimistic update for UI
      setQueue((prevQueue) =>
        prevQueue.map((customer) =>
          customer.id === queueId ? { ...customer, status: newStatus } : customer
        )
      );

      await updateDoc(doc(getFirestore(), "queue", queueId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      // Optimistic update for history
      const newHistoryEntry = { 
        action: newStatus, 
        queueId, 
        phone, 
        timestamp: new Date().toISOString() 
      };
      
      setHistory((prevHistory) => [newHistoryEntry, ...prevHistory]);

      const db = getFirestore();
      const his = await addDoc(collection(db, "history"), {
        queueId: queueId,
        restaurantId: restaurantId,
        history: serverTimestamp(),
        action: newStatus,
        phone: phone,
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
        
        // Optimistic update for history
        const newHistoryEntry = { 
          action: "Message Sent", 
          phoneNumber, 
          timestamp: new Date().toISOString() 
        };
        
        setHistory((prevHistory) => [newHistoryEntry, ...prevHistory]);
      } else {
        alert("Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const deleteHistoryEntry = async (historyId) => {
    if (!window.confirm("Are you sure you want to delete this history entry?")) return;
    
    try {
      // Optimistic update
      setHistory(prevHistory => prevHistory.filter(entry => entry.id !== historyId && entry.hisId !== historyId));
      
      const db = getFirestore();
      await deleteDoc(doc(db, "history", historyId));
    } catch (error) {
      console.error("Error deleting history entry:", error);
      alert("Delete failed. Please try again.");
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
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      alert("Failed to copy link. Please try again.");
    }
  }; 

  // Update queue items with waiting time periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setQueue(prevQueue => 
        prevQueue.map(customer => ({
          ...customer,
          waitingTime: calculateWaitingTime(customer.timestamp)
        }))
      );
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  if (needsSetup) return <RestaurantSetup onSetupComplete={handleSetupComplete} />;
  if (loading && queue.length === 0 && history.length === 0) {
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
  if (error && queue.length === 0 && history.length === 0) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>EasyQueue</h1>
        <div className="header-controls">
          <button
            className="qr-toggle"
            onClick={() => setShowQR(!showQR)}
          >
            {showQR ? "Hide QR" : "Show QR"}
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
                    fgColor="#2a4365"
                    level="H"
                  />
                  <div className="qr-actions">
                    <button
                      onClick={() => window.print()}
                      className="print-btn"
                    >
                      Print QR Code
                    </button>
                    <button
                      onClick={copyLinkToClipboard}
                      className="copy-link-btn"
                    >
                      Copy Link
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
              {queue.map((customer, index) => (
                <tr key={customer.id} className="queue-item">
                  <td>{index + 1}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.seats}</td>
                  <td>{customer.waitingTime}</td>
                  <td>
                    <span className={`status ${customer.status?.toLowerCase() || 'waiting'}`}>
                      {customer.status || 'Waiting'}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="action-btn seat"
                      onClick={() => handleStatusChange(customer.id, "Seated", customer.phone)}
                    >
                      ✓ Seat
                    </button>
                    <button
                      className="action-btn remove"
                      onClick={() => handleStatusChange(customer.id, "Removed", customer.phone)}
                    >
                      ✕ Remove
                    </button>
                    <button
                      className="action-btn message"
                      onClick={() => sendWhatsAppMessage(customer.phone)}
                    >
                      📩 Message
                    </button>
                  </td>
                </tr>
              ))}
              {queue.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                    No customers in queue
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </main>

        <div style={{ margin: "20px 0" }}></div>

        <main className="queue-management" id="history">
          <div className="queue-header">
            <h3>Action History</h3>
          </div>
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
                  <td>{formatTimestamp(entry.timestamp)}</td>
                  <td>{entry.action}</td>
                  <td>{entry.phone ? `Phone: ${entry.phone}` : (entry.queueId ? `Queue ID: ${entry.queueId}` : 'N/A')}</td>
                  <td>
                    <button
                      className="action-btn remove"
                      onClick={() => deleteHistoryEntry(entry.id || entry.hisId)}
                      title="Delete history entry"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "2rem" }}>
                    No history yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;