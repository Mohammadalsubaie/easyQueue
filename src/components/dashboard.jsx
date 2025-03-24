import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { auth, functions } from "../firebase";
import "./dashboard.css";
import RestaurantSetup from "./RestaurantSetup";

const Dashboard = () => {
  const [queue, setQueue] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      const db = getFirestore();
      const user = auth.currentUser;
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "restaurants", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.restaurantId) {
            setRestaurantId(data.restaurantId);
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
    fetchRestaurantData();
  }, []);

  useEffect(() => {
    if (restaurantId) {
      const db = getFirestore();
      const q = query(
        collection(db, "queue"),
        where("restaurantId", "==", restaurantId),
        where("status", "==", "Waiting")
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const queueData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            waitingTime: calculateWaitingTime(doc.data().timestamp),
          }));
          setQueue(queueData);
        },
        (error) => {
          console.error("Error fetching queue data:", error);
          setError("Failed to load queue data");
        }
      );
      return () => unsubscribe();
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

  const handleStatusChange = async (queueId, newStatus) => {
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
        { action: newStatus, queueId, timestamp: new Date().toISOString() },
      ]);

      const db = getFirestore();
      const his = await addDoc(collection(db, "history"), {
        queueId: queueId,
        restaurantId: restaurantId,
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
          { action: "Message Sent", phoneNumber, timestamp: new Date().toISOString() },
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
      alert("Link copied to clipboard!");
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

  if (needsSetup) return <RestaurantSetup onSetupComplete={handleSetupComplete} />;
  if (loading) return <div className="loading">Loading Dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

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
                    value={`${window.location.origin}/join/${restaurantId}`}
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
                  <td>{customer.phoneNumber}</td>
                  <td>{customer.seats}</td>
                  <td>{customer.waitingTime}</td>
                  <td className={`status ${customer.status.toLowerCase()}`}>
                    {customer.status}
                  </td>
                  <td className="actions">
                    <button
                      className="action-btn seat"
                      onClick={() => handleStatusChange(customer.id, "Seated")}
                    >
                      ✓ Seat
                    </button>
                    <button
                      className="action-btn remove"
                      onClick={() => handleStatusChange(customer.id, "Removed")}
                    >
                      ✕ Remove
                    </button>
                    <button
                      className="action-btn message"
                      onClick={() => sendWhatsAppMessage(customer.phoneNumber)}
                    >
                      📩 Send Message
                    </button>
                  </td>
                </tr>
              ))}
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
              </tr>
            </thead>
            <tbody>
              {history.map((entry, index) => (
                <tr key={index} className="queue-item">
                  <td>{entry.timestamp}</td>
                  <td>{entry.action}</td>
                  <td>{entry.queueId ? `Queue ID: ${entry.queueId}` : `Phone: ${entry.phoneNumber}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;