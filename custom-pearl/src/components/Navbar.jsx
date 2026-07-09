import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from "../config";
const Navbar = () => {
  const { getCartCount }      = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount               = getCartCount();

  // Yahan My Orders add kiya hai aur Track Order ka path theek kiya hai
  const links = [
    { to: '/',            label: 'Home'        },
    { to: '/shop',        label: 'Shop'        },
    { to: '/my-orders',   label: 'My Orders'   },
    { to: '/track-order', label: 'Track Order' },
    // { to: '/admin',       label: 'Admin'       },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md px-6 py-4 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-pink-600 dark:text-pink-400">
          Custom Pearl
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className="text-gray-700 dark:text-gray-200 hover:text-pink-500 dark:hover:text-pink-400 font-medium text-sm transition-colors">
              {l.label}
            </Link>
          ))}
          <button onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            {isDark ? '☀️' : '🌙'}
          </button>
          <Link to="/cart" className="relative flex items-center">
            <span className="text-2xl">🛍️</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-3">
          <button onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-sm">
            {isDark ? '☀️' : '🌙'}
          </button>
          <Link to="/cart" className="relative flex items-center">
            <span className="text-2xl">🛍️</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-600 dark:text-gray-300 text-2xl leading-none">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-3 pb-3 space-y-1 border-t border-gray-100 dark:border-gray-700 pt-3">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className="block px-2 py-2.5 text-gray-700 dark:text-gray-200 hover:text-pink-500 font-medium text-sm transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;