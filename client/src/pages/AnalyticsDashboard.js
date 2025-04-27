// client/src/pages/AnalyticsDashboard.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

function AnalyticsDashboard() {
  const location = useLocation();
  const [analytics, setAnalytics] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [error, setError] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const restaurantId = searchParams.get('id');

  const fetchAnalytics = async () => {
    try {
      if (!restaurantId) {
        setError('❌ No restaurant ID provided in URL.');
        return;
      }

      const analyticsRes = await fetch(`http://localhost:5000/api/analytics/${restaurantId}`);
      if (!analyticsRes.ok) throw new Error('Failed to load analytics data.');
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);

      const restaurantRes = await fetch(`http://localhost:5000/api/restaurants/find?id=${restaurantId}`);
      const restaurantData = await restaurantRes.json();
      setRestaurantName(restaurantData?.restaurant?.name || 'Unknown Restaurant');
    } catch (err) {
      console.error('❌ Error fetching analytics:', err.message);
      setError('Failed to load analytics. Please try again later.');
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [restaurantId]);

  if (error) {
    return <div className="text-center text-red-600 mt-20">{error}</div>;
  }

  if (!analytics) {
    return <div className="text-center text-gray-500 mt-20">Loading analytics...</div>;
  }

  const Card = ({ children }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      {children}
    </motion.div>
  );

  return (
    <div className="relative min-h-screen px-4 py-12 overflow-hidden bg-gray-100">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-10 left-5 w-40 h-40 bg-green-500 rounded-full opacity-30 blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-bounce" />
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-gray-400 rounded-full opacity-10 animate-pulse" />
        <div className="absolute top-32 right-10 w-12 h-12 bg-green-600 opacity-30 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-24 left-16 w-16 h-16 bg-gray-500 opacity-20 rotate-12 animate-spin-slow" />
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-20 animate-float" />
      </div>

      {/* Page Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-green-600">
          📊 {restaurantName} – Analytics Dashboard
        </h1>
        <p className="text-center text-gray-500 mb-10">
          Visual insights into customer wait times, peak periods, party sizes, and live stats.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Average Wait Time (minutes)</h2>
            <Bar
              data={{
                labels: analytics.avgWaitTimes.labels,
                datasets: [{
                  label: 'Minutes',
                  data: analytics.avgWaitTimes.data,
                  backgroundColor: '#34D399'
                }]
              }}
              options={{ responsive: true }}
            />
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">⏰ Peak Hours</h2>
            <Bar
              data={{
                labels: analytics.peakHours.labels,
                datasets: [{
                  label: 'Queue Count',
                  data: analytics.peakHours.data,
                  backgroundColor: '#60A5FA'
                }]
              }}
              options={{ responsive: true }}
            />
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">👥 Most Requested Party Sizes</h2>
            <Doughnut
              data={{
                labels: analytics.partySizes.labels,
                datasets: [{
                  data: analytics.partySizes.data,
                  backgroundColor: ['#FBBF24', '#F87171', '#34D399', '#60A5FA', '#A78BFA']
                }]
              }}
            />
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">Live Queue Stats (From 12:00 AM)</h2>
            <Line
              data={{
                labels: analytics.liveStats.labels,
                datasets: [
                  {
                    label: 'Waiting',
                    data: analytics.liveStats.waiting,
                    borderColor: '#F87171',
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.4
                  },
                  {
                    label: 'Seated',
                    data: analytics.liveStats.seated,
                    borderColor: '#34D399',
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.4
                  }
                ]
              }}
              options={{
                responsive: true,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { position: 'top' } },
                scales: {
                  y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
