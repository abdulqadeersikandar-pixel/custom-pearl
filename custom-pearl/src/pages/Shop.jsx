import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import ProductList from '../components/ProductList';

const Shop = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Naya state "Show More" / "Show Less" ko handle karne ke liye
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    // Apne render wale live backend se categories fetch kar rahe hain
    axios.get('https://custom-pearl.onrender.com/api/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Categories fetch error:", err));
  }, []);

  // Agar showAllCategories true hai toh saari dikhao, warna sirf pehli 2
  const visibleCategories = showAllCategories ? categories : categories.slice(0, 2);

  return (
    <div className="min-h-screen bg-pink-50 dark:bg-gray-900 transition-colors">
      <div className="py-8 px-4 text-center">
        <h1 className="text-4xl font-bold text-pink-700 dark:text-pink-400 mb-2">Our Shop</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Browse our full collection</p>

        {/* Dynamic Categories Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          
          {/* "All" button hamesha show hoga */}
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition ${selectedCategory === 'All' ? 'bg-pink-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}`}
          >
            All
          </button>
          
          {/* Categories map kar rahe hain (ya toh 2 ya saari) */}
          {visibleCategories.map(c => (
            <button 
              key={c.Id} 
              onClick={() => setSelectedCategory(c.name)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition ${selectedCategory === c.name ? 'bg-pink-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}`}
            >
              {c.name}
            </button>
          ))}

          {/* Agar categories 2 se zyada hain tabhi "Show More" button dikhega */}
          {categories.length > 2 && (
            <button 
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="px-5 py-2 rounded-full text-sm font-bold transition bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 shadow-sm"
            >
              {showAllCategories ? 'Show Less' : 'Show More'}
            </button>
          )}
          
        </div>
      </div>
      
      {/* Product List ko selected category bhej rahe hain */}
      <ProductList selectedCategory={selectedCategory} />
      <Helmet>
  <title>Shop Pearl Jewelry | Custom Pearl</title>

  <meta
    name="description"
    content="Explore Custom Pearl's collection of pearl jewelry and customized pieces. Browse our latest products and find something special."
  />

  <link
    rel="canonical"
    href="https://custompearl.netlify.app/shop"
  />

  <meta
    property="og:title"
    content="Shop Pearl Jewelry | Custom Pearl"
  />

  <meta
    property="og:description"
    content="Explore pearl jewelry and customized pieces from Custom Pearl."
  />

  <meta
    property="og:url"
    content="https://custompearl.netlify.app/shop"
  />

  <meta property="og:type" content="website" />
</Helmet>
    </div>
  );
};

export default Shop;