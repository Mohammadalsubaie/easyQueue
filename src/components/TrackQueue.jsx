// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { getFirestore, doc, onSnapshot } from "firebase/firestore";

// const TrackQueue = () => {
//   const { queueId } = useParams();
//   const [queueData, setQueueData] = useState(null);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const db = getFirestore();
//     const unsubscribe = onSnapshot(
//       doc(db, "queue", queueId),
//       (docSnap) => {
//         if (docSnap.exists()) {
//           setQueueData(docSnap.data());
//         } else {
//           setError("Invalid queue ID");
//         }
//       },
//       (error) => {
//         console.error("Error fetching queue data:", error);
//         setError("Failed to fetch queue data");
//       }
//     );

//     return () => unsubscribe();
//   }, [queueId]);

//   if (error) {
//     return (
//       <div className="auth-container">
//         <h2>⚠️ Invalid Queue ID</h2>
//         <p>{error}</p>
//       </div>
//     );
//   }

//   if (!queueData) {
//     return (
//       <div className="auth-container">
//         <div className="spinner"></div>
//         <p>Loading queue details...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="auth-container">
//       <h2>Your Queue Status</h2>
//       <p>Queue Number: #{queueId}</p>
//       <p>Status: {queueData.status}</p>
//       <p>Phone Number: {queueData.phone}</p>
//       <p>Joined At: {new Date(queueData.timestamp?.toDate()).toLocaleString()}</p>
//     </div>
//   );
// };

// export default TrackQueue;