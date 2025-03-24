import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  collection, 
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import "./JoinQueue.css";

const JoinQueue = () => {
  const { restaurantId } = useParams();
  const [phone, setPhone] = useState('');
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validRestaurant, setValidRestaurant] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [queueId, setQueueId] = useState('');
  const [queuePosition, setQueuePosition] = useState(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(null);

  useEffect(() => {
    const verifyRestaurant = async () => {
      try {
        const db = getFirestore();
        const docRef = doc(db, "restaurants", restaurantId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("Invalid restaurant QR code");
        } else {
          setValidRestaurant(true);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setError("Failed to verify restaurant");
      } finally {
        setVerifying(false);
      }
    };
    if (restaurantId) {
      verifyRestaurant();
    } else {
      setError("Missing restaurant ID");
      setVerifying(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (!queueId || !success) return;

    const db = getFirestore();
    
    const q = query(
      collection(db, "queue"),
      where("restaurantId", "==", restaurantId),
      where("status", "==", "Waiting"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const position = snapshot.docs.findIndex(doc => doc.id === queueId) + 1;
      setQueuePosition(position);
      const estimatedMinutes = position * 15;
      setEstimatedWaitTime(estimatedMinutes);
    }, (error) => {
      console.error("Position tracking error:", error);
      setError("Failed to track position");
    });

    return () => unsubscribe();
  }, [queueId, restaurantId, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!/^\+?[1-9]\d{9,14}$/.test(phone)) {
        throw new Error('Invalid phone format. Use +966500000000');
      }
      if (seats < 1) {
        throw new Error('Number of seats must be at least 1');
      }
      
      const db = getFirestore();
      // First, create the queue document
      const docRef = await addDoc(collection(db, 'queue'), {
        restaurantId,
        phone,
        status: 'Waiting',
        seats: seats,
        timestamp: serverTimestamp()
      });

      // Then, update the document to include its own ID
      await updateDoc(doc(db, 'queue', docRef.id), {
        queueId: docRef.id  // Add the queueId to the document
      });

      setQueueId(docRef.id);
      setSuccess(true);
      setPhone('');
      setSeats(1);
    } catch (error) {
      console.error("Submission error:", error);
      setError(error.message || 'Failed to join queue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatWaitTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
  };

  if (verifying) {
    return (
      <div className="auth-container">
        <div className="spinner"></div>
        <p>Verifying restaurant...</p>
      </div>
    );
  }

  if (!validRestaurant) {
    return (
      <div className="auth-container">
        <h2>⚠️ Invalid QR Code</h2>
        <p>{error || 'The scanned QR code is not valid.'}</p>
      </div>
    );
  }

  return (
    <div className="auth-container">
      {success ? (
        <div className="success-message">
          <h2>🎉 You&apos;re in the queue!</h2>
          
          <div className="queue-status">
            <div className="status-item">
              <h3>Your Position</h3>
              {queuePosition ? (
                <p className="position-number">{queuePosition}</p>
              ) : (
                <div className="spinner small"></div>
              )}
            </div>
            
            <div className="status-item">
              <h3>Estimated Wait</h3>
              {estimatedWaitTime ? (
                <p className="wait-time">{formatWaitTime(estimatedWaitTime)}</p>
              ) : (
                <div className="spinner small"></div>
              )}
            </div>
          </div>

          <p>We&apos;ll notify you via WhatsApp when your table is ready.</p>
          <p className="queue-id">Queue ID: {queueId}</p>
          <small className="queue-id-note">Keep this ID for reference</small>
          
          <button 
            className="auth-button"
            onClick={() => {
              setSuccess(false);
              setQueueId('');
              setQueuePosition(null);
              setEstimatedWaitTime(null);
            }}
          >
            Back to QR
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="queue-form">
          <h1>EasyQueue</h1>
          <div className="image-placeholder">ICON<br />or<br />Join Queue image</div>

          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="tel"
              placeholder="+966500000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              pattern="\+?[1-9]\d{9,14}"
              required
            />
            <small className="hint">Include country code (e.g., +966)</small>
          </div>

          <div className="form-group">
            <label>Number of Seats:</label>
            <input
              type="number"
              min="1"
              value={seats}
              onChange={(e) => setSeats(parseInt(e.target.value, 10))}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}
          <button 
            type="submit" 
            disabled={loading} 
            className={`auth-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Joining Queue...
              </>
            ) : (
              'Join Queue'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default JoinQueue;