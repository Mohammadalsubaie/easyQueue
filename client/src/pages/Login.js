import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { validate as isEmailValid } from 'email-validator';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [debouncedEmail, setDebouncedEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmail(email);
    }, 500);
    return () => clearTimeout(timer);
  }, [email]);

  useEffect(() => {
    const fetchLogo = async () => {
      if (!isEmailValid(debouncedEmail)) return;
      try {
        const res = await fetch(`http://localhost:5000/api/restaurants/find?email=${debouncedEmail}`);
        const data = await res.json();
        if (res.ok && data.restaurant?.logo) {
          setLogoUrl(data.restaurant.logo);
        } else {
          setLogoUrl(null);
        }
      } catch (err) {
        console.warn('❌ Could not fetch restaurant logo:', err.message);
        setLogoUrl(null);
      }
    };

    fetchLogo();
  }, [debouncedEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/restaurants/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('restaurant', JSON.stringify(data.restaurant));
        navigate('/restaurant-dashboard');
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Try again.');
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex items-center justify-center overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-10 left-5 w-40 h-40 bg-green-500 rounded-full opacity-30 blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-bounce" />
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-gray-400 rounded-full opacity-10 animate-pulse" />
        <div className="absolute top-32 right-10 w-12 h-12 bg-green-600 opacity-30 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-24 left-16 w-16 h-16 bg-gray-500 opacity-20 rotate-12 animate-spin-slow" />
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-20 animate-float" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm bg-white p-8 rounded-xl shadow-md text-center border">
        {logoUrl ? (
          <img src={logoUrl} alt="Restaurant Logo" className="w-24 h-24 mx-auto rounded-full object-cover mb-4" />
        ) : (
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm">
            LOGO
          </div>
        )}

        <h2 className="text-xl font-semibold text-gray-800 mb-6">Log in to EasyQueue</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="text-left">
          <label className="block mb-2 text-sm text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-4 focus:outline-none focus:ring focus:ring-green-200"
          />

          <label className="block mb-2 text-sm text-gray-700">Password</label>
          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded pr-10 focus:outline-none focus:ring focus:ring-green-200"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-600 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition"
          >
            Log in
          </button>
        </form>

        <div className="text-sm text-gray-600 mt-4 text-center">
          <p>
            Forgot your password? <a href="/forgot-password" className="text-blue-500 hover:underline">click here</a>
          </p>
          <p>
            New user? <a href="/register" className="text-blue-500 hover:underline">Sign up here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
