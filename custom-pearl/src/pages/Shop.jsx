import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductList from '../components/ProductList';
import { API_URL } from "../config";

const Shop = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    axios.get('https://custom-pearl.onrender.com/api/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Categories fetch error:", err));
  }, []);

  return (
    <div className="min-h-screen bg-pink-50 dark:bg-gray-900 transition-colors">
      <div className="py-8 px-4 text-center">
        <h1 className="text-4xl font-bold text-pink-700 dark:text-pink-400 mb-2">Our Shop</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Browse our full collection</p>

        {/* Dynamic Categories Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition ${selectedCategory === 'All' ? 'bg-pink-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}`}
          >
            All Products
          </button>
          {categories.map(c => (
            <button 
              key={c.Id} 
              onClick={() => setSelectedCategory(c.name)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition ${selectedCategory === c.name ? 'bg-pink-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Product List mein category pass ho rahi hai */}
      <ProductList selectedCategory={selectedCategory} />
    </div>
  );
};

export default Shop;