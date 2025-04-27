import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function QueuePosition() {
  const location = useLocation();
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [seats, setSeats] = useState(1);
  const [restaurantId, setRestaurantId] = useState(null);
  const [queueId, setQueueId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurantLogo, setRestaurantLogo] = useState(null);
  const [maxSeats, setMaxSeats] = useState(100);
  const [queueStatus, setQueueStatus] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const restId = params.get('restaurantId');
    if (id && restId) {
      setQueueId(id);
      setRestaurantId(restId);
      fetchRestaurantLogo(restId);
      fetchPosition(id, restId);
      fetchRemainingSeats(restId, id);
      const interval = setInterval(() => fetchPosition(id, restId), 5000);
      return () => clearInterval(interval);
    }
  }, [location.search]);

  const fetchRestaurantLogo = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/restaurants/find?id=${id}`);
      const data = await res.json();
      if (res.ok && data.restaurant?.logo) {
        setRestaurantLogo(data.restaurant.logo);
      }
    } catch (error) {
      console.error('❌ Error fetching restaurant logo:', error);
    }
  };

  const fetchRemainingSeats = async (restaurantId, excludeQueueId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/queues/restaurant/remaining-seats?restaurantId=${restaurantId}&excludeId=${excludeQueueId}`);
      const data = await res.json();
      if (res.ok && data.remaining !== undefined) {
        setMaxSeats(data.remaining);
      }
    } catch (error) {
      console.error('❌ Error fetching remaining seats:', error);
    }
  };

  const fetchPosition = async (entryId, restId) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/queues/restaurant/${restId}`);
      const data = await res.json();
      if (res.ok) {
        const fullEntry = data.queue.find(entry => entry.id === entryId);
        if (!fullEntry) {
          setPosition(-1);
          setQueueStatus('Removed');
          return;
        }
  
        setQueueStatus(fullEntry.status);
  
        if (fullEntry.status === 'Waiting') {
          const sorted = data.queue.filter(q => q.status === 'Waiting');
          const index = sorted.findIndex(entry => entry.id === entryId);
          if (index !== -1) {
            setPosition(index + 1);
            setSeats(fullEntry.seats || 1);
          }
        } else {
          setPosition(-1);
        }
      } else {
        console.error('Failed to fetch queue:', data.message);
        setPosition(-1);
        setQueueStatus('Removed');
      }
    } catch (error) {
      console.error('❌ Error fetching queue:', error);
      setPosition(-1);
      setQueueStatus('Removed');
    } finally {
      setLoading(false);
    }
  };

  const handleStepBack = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/queues/step-back`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, queueId })
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ You stepped one position back.');
        fetchPosition(queueId, restaurantId);
      } else {
        alert(data.message || '❌ Failed to step back');
      }
    } catch (error) {
      console.error('❌ Error stepping back:', error);
      alert('Network error while trying to step back');
    }
  };

  const handleEditSeats = async () => {
    const updated = prompt(`Enter new number of seats (max available: ${maxSeats + seats}):`, seats);
    if (updated && !isNaN(updated)) {
      const newSeats = Number(updated);
      if (newSeats > maxSeats + seats) {
        alert(`❌ Only ${maxSeats + seats} seats are available.`);
        return;
      }
      setSeats(newSeats);
      try {
        const res = await fetch(`http://localhost:5000/api/queues/${queueId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ seats: newSeats }),
        });

        const data = await res.json();
        if (res.ok) {
          alert(`✅ Updated to ${newSeats} seats`);
          fetchRemainingSeats(restaurantId, queueId);
        } else {
          alert(data.message || 'Failed to update seat count');
        }
      } catch (error) {
        console.error('❌ Error updating seat count:', error);
        alert('Network error while updating seat count');
      }
    }
  };

  const handleLeaveQueue = async () => {
    if (window.confirm('Are you sure you want to leave the queue?')) {
      try {
        await fetch(`http://localhost:5000/api/queues/${queueId}`, { method: 'DELETE' });
        alert('You have left the queue.');
        navigate('/');
      } catch (error) {
        alert('Error removing you from queue');
        console.error(error);
      }
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

      <div className="relative z-10 bg-white rounded-xl shadow p-6 w-full max-w-sm border border-gray-200 text-center">
        <div className="flex justify-center mb-4">
          {restaurantLogo ? (
            <img src={restaurantLogo} alt="Restaurant Logo" className="w-20 h-20 object-cover rounded-xl border" />
          ) : (
            <div className="w-20 h-20 rounded-xl border border-gray-300 flex items-center justify-center text-center text-sm text-gray-500">
              Restaurant Logo
            </div>
          )}
        </div>

        <div className="mb-6">
        <div className="h-40 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center text-3xl font-bold text-gray-800">
          {loading
            ? 'Loading...'
            : queueStatus === 'Seated'
            ? 'Seated'
            : queueStatus === 'Removed'
            ? 'Removed'
            : position === -1
            ? 'Not in queue'
            : `#${position}`}
        </div>
          <p className="text-sm text-gray-500 mt-2">Your current position</p>
        </div>

        <div className="flex justify-between space-x-3 mb-4">
          <button
            onClick={handleStepBack}
            className="flex-1 px-3 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
          >
            Take a Step Back
          </button>
          <button
            onClick={handleEditSeats}
            className="flex-1 px-3 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
          >
            Edit number of seats
          </button>
        </div>

        <button
          onClick={handleLeaveQueue}
          className="w-full px-4 py-2 bg-red-700 text-white font-semibold rounded hover:bg-red-800"
        >
          Leave Queue
        </button>

        <a
          href={`/menu-browser?id=${restaurantId}`}
          className="block text-center mt-4 px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition"
        >
          🍽️ Browse Menu
        </a>
      </div>
    </div>
  );
}

export default QueuePosition;
