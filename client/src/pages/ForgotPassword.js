import React, { useState } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('✅ Reset link sent to your email.');
      } else {
        setStatus(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setStatus('Network error. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm border p-8 rounded-[2rem] shadow text-center">
        <h2 className="text-lg font-semibold mb-2">
          Enter the email address to your account.
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          You will receive an email with a link to reset your password.
        </p>

        {status && <p className="text-sm mb-4 text-gray-700">{status}</p>}

        <form onSubmit={handleSubmit} className="text-left">
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-green-200"
          />
          <button
            type="submit"
            className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;