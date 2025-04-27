import React from 'react';
import { useNavigate } from 'react-router-dom';

function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col items-center text-center bg-white border rounded-2xl shadow-md hover:shadow-lg transition p-6 w-full max-w-xs mx-auto">
      {/* Logo */}
      {restaurant.logo ? (
        <img
          src={restaurant.logo}
          alt="Restaurant Logo"
          className="w-24 h-24 object-cover rounded-full border-4 border-white shadow -mt-14 bg-white"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500 shadow -mt-14 border-4 border-white">
          No Logo
        </div>
      )}

      {/* Name */}
      <h2 className="mt-4 text-xl font-bold text-gray-800">{restaurant.name}</h2>

      {/* Login Button */}
      <button
        onClick={() => navigate(`/login?id=${restaurant.id}`)}
        className="mt-6 px-5 py-2 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition"
      >
        Login as Manager
      </button>
    </div>
  );
}

export default RestaurantCard;
