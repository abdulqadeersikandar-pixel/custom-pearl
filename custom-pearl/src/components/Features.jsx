import React from 'react';
import { API_URL } from "../config";
const features = [
  { icon: '🪬', text: 'Premium Quality Pearls & Threads' },
  { icon: '🤲', text: 'Handcrafted with Care' },
  { icon: '✨', text: 'Neat, Precise Finishing' },
  { icon: '💰', text: 'Affordable Prices' },
  { icon: '🚚', text: 'Free Delivery Across Pakistan' },
  { icon: '🔒', text: 'Secure & Easy Ordering' },
];

const Features = () => (
  <div className="py-16 bg-pink-100 dark:bg-gray-800 w-full transition-colors">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold text-pink-800 dark:text-pink-300 mb-2">Why Choose Custom Pearl?</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Handmade quality you can trust</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <div key={i} className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm flex items-center gap-3 text-left">
            <span className="text-2xl">{f.icon}</span>
            <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Features;
