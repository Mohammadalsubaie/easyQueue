// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Login from "./components/Login";
// import Register from "./components/Register";
// import ForgotPassword from "./components/ForgotPassword";
// import Dashboard from "./components/dashboard";
// import "./App.css";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         {/* <Route path="/join-queue/:restaurantId" element={<JoinQueue />} /> */}
//       </Routes>
//     </Router>
//   );
// }

// export default App;


// App.js
// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard from "./components/dashboard"; // Check casing
import JoinQueue from "./components/JoinQueue"; // Verify file extension
import TrackQueue from "./components/TrackQueue"; // Verify file extension
import RestaurantSetup from "./components/RestaurantSetup";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/join-queue/:restaurantId" element={<JoinQueue />} />
        <Route path="/track/:queueId" element={<TrackQueue />} />
        <Route path="/setup" element={<RestaurantSetup />} />
        <Route path="*" element={<h1>Not Found</h1>} />
        
      </Routes>
    </Router>
  );
}

export default App;