import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function JoinQueue() {
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [seats, setSeats] = useState('');
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [maxSeats, setMaxSeats] = useState(10);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    if (id) {
      setRestaurantId(id);
      fetch(`http://localhost:5000/api/restaurants/find?id=${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.restaurant) setRestaurant(data.restaurant);
        })
        .catch(console.error);

      // Fetch remaining seats
      fetch(`http://localhost:5000/api/queues/restaurant/remaining-seats?restaurantId=${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.remaining !== undefined) setMaxSeats(data.remaining);
        })
        .catch(console.error);
    }
  }, [location.search]);

  const validatePhone = () => {
    const phonePattern = /^\+966\d{9}$/;
    const fullPhone = `${countryCode}${phone.replace(/^0+/, '')}`;
    return phonePattern.test(fullPhone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullPhone = `${countryCode}${phone.replace(/^0+/, '')}`;

    if (!name || !phone || !seats || !restaurantId) {
      alert('Please fill out all fields');
      return;
    }

    if (!validatePhone()) {
      alert('❌ Enter a valid number.');
      return;
    }

    if (Number(seats) > maxSeats) {
      alert(`Only ${maxSeats} seat(s) are available.`);
      return;
    }

    try {
      const checkRes = await fetch(`http://localhost:5000/api/queues/restaurant/${restaurantId}`);
      const checkData = await checkRes.json();

      if (checkRes.ok) {
        const alreadyInQueue = checkData.queue.some(entry => entry.phone === fullPhone && entry.status === 'Waiting');
        if (alreadyInQueue) {
          alert('❌ This phone number is already in the queue for this restaurant.');
          return;
        }
      } else {
        console.warn('Could not validate existing queue entries. Proceeding anyway.');
      }

      const res = await fetch(`http://localhost:5000/api/queues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone: fullPhone,
          seats: Number(seats),
          restaurantId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ You have joined the queue!');
        navigate(`/queue-position?id=${data.queueEntry.id}&restaurantId=${restaurantId}`);
      } else {
        alert(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('❌ Error joining queue:', error);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gray-100 px-4 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-10 left-5 w-40 h-40 bg-green-500 rounded-full opacity-30 blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-bounce" />
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-gray-400 rounded-full opacity-10 animate-pulse" />
        <div className="absolute top-32 right-10 w-12 h-12 bg-green-600 opacity-30 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-24 left-16 w-16 h-16 bg-gray-500 opacity-20 rotate-12 animate-spin-slow" />
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-20 animate-float" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white w-full max-w-sm rounded-xl shadow p-6 border border-gray-200"
      >
        <div className="flex justify-center mb-6">
          {restaurant?.logo ? (
            <img
              src={restaurant.logo}
              alt="Restaurant Logo"
              className="w-24 h-24 object-cover rounded-xl border"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl border border-gray-300 flex items-center justify-center text-center text-sm text-gray-500">
              Restaurant Logo
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 font-medium">Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-2">
          <label className="block mb-1 text-gray-700 font-medium">Phone Number</label>
          <div className="flex">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="border border-gray-300 rounded-l px-3 py-2 text-sm bg-gray-50"
            >
              <option value="+966">🇸🇦 (+966)</option>
            </select>
            <input
              type="tel"
              className="flex-1 border border-gray-300 rounded-r px-3 py-2"
              placeholder="e.g. 512345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          SMS messages will be sent to this number
        </p>

        <div className="mb-6">
          <label className="block mb-1 text-gray-700 font-medium">Number of seats</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            required
          >
            <option value="">Select seats</option>
            {[...Array(maxSeats)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Join Queue
        </button>
      </form>
    </div>
  );
}

export default JoinQueue;