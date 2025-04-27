import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import { motion } from 'framer-motion';

function HomeDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/restaurants');
      const data = await response.json();

      if (response.ok) {
        setRestaurants(data.restaurants);
      } else {
        console.error('Failed to fetch restaurants:', data.message);
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
    const interval = setInterval(fetchRestaurants, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location.state?.refreshQR) {
      fetchRestaurants();
    }
  }, [location.state]);

  return (
    <div className="relative min-h-screen bg-gray-100 py-12 px-4 overflow-hidden">
      {/* Background Animations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-5 w-40 h-40 bg-green-500 rounded-full opacity-30 blur-2xl animate-pulse"></div>
        <div className="absolute bottom-16 left-1/4 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-gray-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-32 right-10 w-12 h-12 bg-green-600 opacity-30 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-24 left-16 w-16 h-16 bg-gray-500 opacity-20 rotate-12 animate-spin-slow"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-20 animate-float"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-screen-xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Registered Restaurants
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Click on a restaurant to login and manage its queues.
          </p>
          <Link
            to="/register"
            className="inline-block px-6 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition"
          >
            Register Your Restaurant
          </Link>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {loading ? (
            <div className="col-span-full text-center text-gray-500 italic">
              Loading restaurants...
            </div>
          ) : restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <motion.div
                key={restaurant.id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <RestaurantCard restaurant={restaurant} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-600">
              No restaurants found. Please register a restaurant.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeDashboard;
