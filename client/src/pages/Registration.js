import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Registration() {
  const navigate = useNavigate();
  const [restaurantName, setRestaurantName] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      return alert('Password must be at least 6 characters.');
    }

    if (password !== confirmPassword) {
      return alert('Passwords do not match.');
    }

    const formData = new FormData();
    formData.append('name', restaurantName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('totalSeats', totalSeats);
    formData.append('logo', logo);

    try {
      const response = await fetch('http://localhost:5000/api/restaurants', {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      console.log('🔍 Raw response text:', text);

      try {
        const data = JSON.parse(text);

        if (response.ok) {
          alert('Restaurant registered successfully!');
          navigate('/');
        } else {
          if (response.status === 409) {
            alert(data.message);
          } else {
            alert('Registration failed: ' + (data.message || 'Unknown error'));
          }
          console.error('❌ Server error:', data);
        }
      } catch (parseError) {
        alert('Server returned invalid JSON. Check console for raw response.');
        console.error('❌ JSON Parse Error:', parseError.message);
        console.error('📄 Raw HTML response:', text);
      }
    } catch (error) {
      console.error('❌ Fetch Error:', error);
      alert('A network error occurred: ' + error.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-10 left-5 w-40 h-40 bg-green-500 rounded-full opacity-30 blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-bounce" />
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-gray-400 rounded-full opacity-10 animate-pulse" />
        <div className="absolute top-32 right-10 w-12 h-12 bg-green-600 opacity-30 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-24 left-16 w-16 h-16 bg-gray-500 opacity-20 rotate-12 animate-spin-slow" />
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-20 animate-float" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="relative z-10 bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register Your Restaurant</h2>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700">Restaurant Name</label>
          <input
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700">Total Available Seats</label>
          <input
            type="number"
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-4 relative">
          <label className="block mb-1 text-gray-700">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-2 pr-10"
            required
          />
          <span
            className="absolute right-3 top-9 text-gray-600 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="mb-4 relative">
          <label className="block mb-1 text-gray-700">Confirm Password</label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded p-2 pr-10"
            required
          />
          <span
            className="absolute right-3 top-9 text-gray-600 cursor-pointer"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700">Logo Upload</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="w-full"
            required
          />
          {preview && (
            <img src={preview} alt="Logo Preview" className="mt-2 w-32 h-32 object-contain" />
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Registration;
