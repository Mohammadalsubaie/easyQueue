import React, { useEffect, useState } from 'react';
import { FaCog, FaQrcode } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { QRCodeCanvas } from 'qrcode.react';

function RestaurantDashboard() {
  const [queue, setQueue] = useState([]);
  const [restaurantName, setRestaurantName] = useState('My Restaurant');
  const [restaurantId, setRestaurantId] = useState(null);
  const [selectedNote, setSelectedNote] = useState({});
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [newLogo, setNewLogo] = useState(null);
  const [newName, setNewName] = useState('');
  const [tick, setTick] = useState(0);
  const [newSeats, setNewSeats] = useState('');

  const fetchQueue = async () => {
    if (!restaurantId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/queues/restaurant/${restaurantId}`);
      const data = await res.json();
      if (res.ok) {
        setQueue(data.queue);
      } else {
        console.error('Failed to load queue:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching queue:', error.message);
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem('restaurant');
    if (stored) {
      const restaurant = JSON.parse(stored);
      setRestaurantName(restaurant.name);
      setRestaurantId(restaurant.id);
      setLogoUrl(restaurant.logo);
      setQrCodeValue(restaurant.qrCode || '');
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [restaurantId]);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1); // Force re-render every 1s
    }, 1000);
    return () => clearInterval(interval);
  }, []);  

  const getTimeWaiting = (joinedAt, status) => {
    if (status === 'Seated') return '⏸️';
  
    let start;
  
    if (joinedAt?._seconds) {
      start = joinedAt._seconds * 1000;
    } else if (typeof joinedAt === 'number') {
      start = joinedAt;
    } else {
      return '00:00:00';
    }
  
    const now = Date.now();
    const elapsed = Math.max(now - start, 0);
  
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
  
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const sendSMS = async (queueEntry, action) => {
    try {
      await fetch('http://localhost:5000/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: queueEntry.phone,
          action,
          position: queue.findIndex(q => q.id === queueEntry.id) + 1,
          queueId: queueEntry.id,
          restaurantId,
        }),
      });
    } catch (err) {
      console.error(`❌ SMS failed for ${action}`, err);
    }
  };

  const handleSendSMS = (id) => {
    const entry = queue.find(q => q.id === id);
    if (entry) sendSMS(entry, 'Send SMS');
  };

  const handleSeat = async (id) => {
    await fetch(`http://localhost:5000/api/queues/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Seated' }),
    });
    const entry = queue.find(q => q.id === id);
    if (entry) sendSMS(entry, 'Seat');
    fetchQueue();
  };

  const handleReAdd = async (id) => {
    await fetch(`http://localhost:5000/api/queues/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Waiting' }),
    });
    const entry = queue.find(q => q.id === id);
    if (entry) sendSMS(entry, 'Re-add');
    fetchQueue();
  };

  const handleRemove = async (id) => {
    await fetch(`http://localhost:5000/api/queues/${id}`, {
      method: 'DELETE'
    });
    const entry = queue.find(q => q.id === id);
    if (entry) sendSMS(entry, 'Remove');
    fetchQueue();
  };

  const handleNoteChange = (id, note) => {
    setSelectedNote((prev) => ({ ...prev, [id]: note }));
  };

  const handleGenerateQRCode = () => {
    const uniqueCode = `${restaurantName}-${Date.now()}`;
    setQrCodeValue(uniqueCode);
  };

  const handlePrintQRCode = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>QR Code</title></head>
      <body style="text-align:center;">
        <h2>${restaurantName}</h2>
        <div id="qrcode"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
        <script>
          new QRCode(document.getElementById("qrcode"), "${qrCodeValue}");
        </script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const handleShareLink = () => {
    if (!restaurantId) return alert("Restaurant ID missing.");
    const link = `${window.location.origin}/join-queue?id=${restaurantId}`;
    navigator.clipboard.writeText(link);
    alert(`🔗 Join queue link copied:\n${link}`);
  };

  const handleSaveQRCode = async () => {
    if (!restaurantId) return alert('No restaurant ID found.');
    try {
      const response = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}/qr`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: qrCodeValue }),
      });

      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem('restaurant', JSON.stringify(data.restaurant));
        alert('✅ QR code saved successfully.');
      } else {
        alert('❌ Failed to save QR code: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving QR code.');
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleNameUpdate = async () => {
    const trimmedName = newName.trim();
    const trimmedSeats = String(newSeats).trim(); // Convert to string in case it's a number
    const updatingLogo = !!newLogo;
    const updatingName = trimmedName.length > 0;
    const updatingSeats = trimmedSeats !== '' && !isNaN(trimmedSeats) && Number(trimmedSeats) > 0;
  
    if (!updatingLogo && !updatingName && !updatingSeats) {
      alert('⚠️ No changes made.');
      return;
    }
  
    try {
      let updatedRestaurant = null;
  
      // Update logo
      if (updatingLogo) {
        const formData = new FormData();
        formData.append('logo', newLogo);
        const res = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}/logo`, {
          method: 'PATCH',
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          setLogoUrl(data.logo);
          updatedRestaurant = data.restaurant;
        } else {
          alert(data.message || '❌ Logo update failed');
          return;
        }
      }
  
      // Update name or seats
      if (updatingName || updatingSeats) {
        const updatePayload = {};
        if (updatingName) updatePayload.name = trimmedName;
        if (updatingSeats) updatePayload.totalSeats = Number(trimmedSeats);
  
        const res = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        });
  
        const data = await res.json();
        if (res.ok) {
          if (updatingName) {
            setRestaurantName(trimmedName);
            setNewName('');
          }
          if (updatingSeats) {
            setNewSeats('');
          }
          updatedRestaurant = data.restaurant;
        } else {
          alert(data.message || '❌ Name or seat update failed');
          return;
        }
      }
  
      if (updatedRestaurant) {
        sessionStorage.setItem('restaurant', JSON.stringify(updatedRestaurant));
  
        // Dynamic success message
        const updates = [];
        if (updatingLogo) updates.push('Logo');
        if (updatingName) updates.push('Name');
        if (updatingSeats) updates.push('Seats');
        alert(`✅ ${updates.join(' & ')} updated successfully`);
      }
  
      setNewLogo(null); // Reset logo file
    } catch (err) {
      console.error('❌ Error during update:', err);
      alert('An error occurred while updating.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">{restaurantName}</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition"
          >
            <FaCog className="text-xl" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowQRPopup(true)}
            className="flex items-center gap-2 px-3 py-2 border rounded hover:bg-gray-100 transition"
          >
            <FaQrcode />
            <span className="hidden sm:inline">QR Code Setting</span>
          </button>

          {restaurantId && (
            <>
              <a
                href={`/analytics?id=${restaurantId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 border rounded text-sm hover:bg-gray-100 transition text-gray-700"
              >
                📊
                <span className="hidden sm:inline">Analytics</span>
              </a>
              <a
                href={`/admin-menu?id=${restaurantId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 border rounded text-sm hover:bg-gray-100 transition text-gray-700"
              >
                🍔
                <span className="hidden sm:inline">Manage Menu</span>
              </a>
            </>
          )}

          {logoUrl && (
            <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-full border object-cover" />
          )}
        </div>
      </header>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full table-auto text-sm text-left">
          <thead className="bg-gray-100 border-b font-medium text-gray-600">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Seats</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Time Waiting</th>
              <th className="p-3">Status</th>
              <th className="p-3">Controls</th>
              <th className="p-3">Staff Note</th>
            </tr>
          </thead>
          <tbody>
            {queue.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-400 italic">
                  Queue Information Display Area
                </td>
              </tr>
            ) : (
              queue.map((entry, index) => (
                <tr key={entry.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-semibold">{entry.name}</td>
                  <td className="p-3">{entry.seats}</td>
                  <td className="p-3">{entry.phone}</td>
                  <td className="p-3">{getTimeWaiting(entry.joinedAt, entry.status)}</td>
                  <td className="p-3">
                    <span className={`text-sm font-medium ${entry.status === 'Waiting' ? 'text-red-500' : 'text-green-600'}`}>{entry.status}</span>
                  </td>
                  <td className="p-3 flex flex-wrap gap-1">
                    <button onClick={() => handleSendSMS(entry.id)} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">Send SMS</button>
                    <button onClick={() => handleSeat(entry.id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Seat</button>
                    <button onClick={() => handleRemove(entry.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs">Remove</button>
                    {entry.status === 'Seated' && (
                      <button onClick={() => handleReAdd(entry.id)} className="px-2 py-1 bg-yellow-500 text-white rounded text-xs">Re-Add</button>
                    )}
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      placeholder="Add note"
                      value={selectedNote[entry.id] || ''}
                      onChange={(e) => handleNoteChange(entry.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm w-full"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showQRPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md relative">
            <button onClick={() => setShowQRPopup(false)} className="absolute top-2 right-2 text-xl text-gray-500">
              <IoMdClose />
            </button>
            <h3 className="text-xl font-bold mb-4">QR Code for {restaurantName}</h3>
            {qrCodeValue ? (
              <div className="flex justify-center mb-4">
                <QRCodeCanvas value={qrCodeValue} size={180} />
              </div>
            ) : (
              <p className="text-center text-sm text-gray-500 mb-4">No QR code yet. Click below to generate.</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button onClick={handleGenerateQRCode} className="flex-1 bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700">Generate</button>
              <button onClick={handlePrintQRCode} className="flex-1 bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600">Print</button>
              <button onClick={handleShareLink} className="flex-1 bg-gray-600 text-white px-4 py-2 rounded font-semibold hover:bg-gray-700">Share</button>
              <button onClick={handleSaveQRCode} disabled={!qrCodeValue} className={`flex-1 px-4 py-2 rounded font-semibold ${qrCodeValue ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md relative">
            <button onClick={() => setShowSettings(false)} className="absolute top-2 right-2 text-xl text-gray-500">
              <IoMdClose />
            </button>
            <h3 className="text-xl font-bold mb-4">Settings</h3>

            <div className="space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="block mb-1 text-gray-700 font-medium">🖼️ Change Logo</label>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm" />
              </div>

              {/* Update Restaurant Name */}
              <div>
                <label className="block mb-1 text-gray-700 font-medium">✏️ Update Restaurant Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter new name"
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              {/* Update Max Seats */}
              <div>
                <label className="block mb-1 text-gray-700 font-medium">🪑 Update Max Seats</label>
                <input
                  type="number"
                  value={newSeats}
                  onChange={(e) => setNewSeats(e.target.value)}
                  placeholder="Enter new max seats"
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              {/* Unified Update Button */}
              <div className="text-right pt-2">
                <button
                  onClick={handleNameUpdate}
                  className="bg-green-600 text-white px-5 py-2 rounded font-semibold hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantDashboard;
