import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();
  const location                = useLocation();
  const inactivityMsg           = location.state?.message || '';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 dark:bg-gray-900 flex items-center justify-center px-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-pink-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-center text-pink-700 dark:text-pink-400 mb-2">Admin Login</h2>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">Custom Pearl — Dashboard Access</p>

        {inactivityMsg && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 p-3 rounded-lg mb-4 text-center text-sm font-medium">
            ⏱ {inactivityMsg}
          </div>
        )}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg mb-4 text-center text-sm">{error}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1 text-sm">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@custompearl.com" required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm" />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1 text-sm">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm" />
          </div>
          <button type="submit" disabled={loading}
            className={`w-full font-bold py-3 rounded-xl transition text-white ${loading ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'}`}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
