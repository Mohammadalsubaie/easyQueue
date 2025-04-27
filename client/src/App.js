import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomeDashboard from './pages/HomeDashboard';
import Registration from './pages/Registration';
import Login from './pages/Login';
import RestaurantDashboard from './pages/RestaurantDashboard';
import JoinQueue from './pages/JoinQueue';
import QueuePosition from './pages/QueuePosition';
import ForgotPassword from './pages/ForgotPassword';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AdminMenuDashboard from './pages/AdminMenuDashboard';
import MenuBrowser from './pages/MenuBrowser';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomeDashboard />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
          <Route path="/join-queue" element={<JoinQueue />} />
          <Route path="/queue-position" element={<QueuePosition />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/admin-menu" element={<AdminMenuDashboard />} />
          <Route path="/menu-browser" element={<MenuBrowser />} />
        </Routes>
      </main>
    </Router>
  );
}

function Navbar() {
  return (
    <header className="fixed top-0 w-full z-30 bg-transparent backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-start">
        <Link to="/" className="text-2xl font-bold text-green-600">
          EasyQueue
        </Link>
      </nav>
    </header>
  );
}

export default App;