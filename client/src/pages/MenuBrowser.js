// client/src/pages/MenuBrowser.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function MenuBrowser() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const restaurantId = searchParams.get('id');
  const [menu, setMenu] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/menu?restaurantId=${restaurantId}`);
        const data = await res.json();
        if (res.ok) {
          setMenu(data.menu);
        } else {
          setError('⚠️ Failed to fetch menu.');
        }
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('⚠️ Failed to load menu.');
      }
    };

    if (restaurantId) {
      fetchMenu();
    } else {
      setError('No restaurant ID provided.');
    }
  }, [restaurantId]);

  const handleToggleSelect = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const groupedMenu = menu.reduce((acc, item) => {
    const cat = item.category || 'Other';
    acc[cat] = acc[cat] || [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="relative min-h-screen bg-gray-50 px-4 py-6 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-10 left-5 w-40 h-40 bg-green-500 rounded-full opacity-30 blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-bounce" />
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-gray-400 rounded-full opacity-10 animate-pulse" />
        <div className="absolute top-32 right-10 w-12 h-12 bg-green-600 opacity-30 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-24 left-16 w-16 h-16 bg-gray-500 opacity-20 rotate-12 animate-spin-slow" />
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-20 animate-float" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-600">🍽️ Menu</h1>
        <p className="text-center text-gray-500 mb-10">Browse while you wait and pre-select your favorites.</p>

        {error && <p className="text-center text-red-600 mb-4">{error}</p>}

        {Object.keys(groupedMenu).length === 0 ? (
          <div className="text-center text-gray-500">No menu available.</div>
        ) : (
          Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category} className="mb-10">
              <h2 className="text-xl font-semibold mb-4">{category}</h2>
              <div className="grid gap-4">
                {items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleSelect(item.id)}
                    className={`flex items-center gap-4 p-4 border rounded-lg shadow-sm cursor-pointer transition ${
                      selectedItems.includes(item.id)
                        ? 'bg-green-100 border-green-400'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-20 h-20 rounded object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MenuBrowser;
