import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function AdminMenuDashboard() {
  const location = useLocation();
  const [menuItems, setMenuItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState('');
  const [newItem, setNewItem] = useState({ name: '', description: '', category: '', image: '' });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    if (id) {
      setRestaurantId(id);
      fetchMenuItems(id);
    }
  }, [location.search]);

  const fetchMenuItems = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/menu?restaurantId=${id}`);
      const data = await res.json();
      setMenuItems(data.menu || []);
    } catch (err) {
      console.error('Error fetching menu items:', err.message);
    }
  };

  const handleAddItem = async () => {
    try {
      const payload = { ...newItem, restaurantId };
      const res = await fetch('http://localhost:5000/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNewItem({ name: '', description: '', category: '', image: '' });
        fetchMenuItems(restaurantId);
        setSuccessMessage('✅ Item added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error adding item:', err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/menu/${id}`, { method: 'DELETE' });
      fetchMenuItems(restaurantId);
    } catch (err) {
      console.error('Error deleting item:', err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="relative min-h-screen bg-gray-100 overflow-hidden px-4 py-12">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-10 left-5 w-40 h-40 bg-green-500 rounded-full opacity-30 blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-bounce" />
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-gray-400 rounded-full opacity-10 animate-pulse" />
        <div className="absolute top-32 right-10 w-12 h-12 bg-green-600 opacity-30 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-24 left-16 w-16 h-16 bg-gray-500 opacity-20 rotate-12 animate-spin-slow" />
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-20 animate-float" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-green-600">Admin Menu Dashboard</h1>

        {successMessage && (
          <div className="mb-4 px-4 py-2 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={newItem.name}
            onChange={handleInputChange}
            className="border rounded p-2 w-full md:w-1/4"
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={newItem.description}
            onChange={handleInputChange}
            className="border rounded p-2 w-full md:w-1/3"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={newItem.category}
            onChange={handleInputChange}
            className="border rounded p-2 w-full md:w-1/5"
          />
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={newItem.image}
            onChange={handleInputChange}
            className="border rounded p-2 w-full md:w-1/5"
          />
          <button
            onClick={handleAddItem}
            className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 whitespace-nowrap"
          >
            + Add Item
          </button>
        </div>

        <div className="grid gap-4">
          {menuItems.map(item => (
            <div key={item.id} className="flex items-center gap-4 border p-4 rounded shadow-sm bg-white">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{item.name}</h2>
                <p className="text-sm text-gray-600">{item.description}</p>
                <span className="text-xs text-blue-500 uppercase">{item.category}</span>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminMenuDashboard;
