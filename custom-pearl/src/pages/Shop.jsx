import React from 'react';
import ProductList from '../components/ProductList';

const Shop = () => (
  <div className="min-h-screen bg-pink-50 dark:bg-gray-900 transition-colors">
    <div className="py-8 px-4 text-center">
      <h1 className="text-4xl font-bold text-pink-700 dark:text-pink-400 mb-2">Our Shop</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm">Browse our full collection of pearl &amp; crochet bags</p>
    </div>
    <ProductList />
  </div>
);

export default Shop;
