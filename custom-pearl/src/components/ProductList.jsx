import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const CATEGORIES = ['All', 'Pearls', 'Crochet'];

const ProductList = () => {
  const [products, setProducts]         = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [searchTerm, setSearchTerm]     = useState('');
  const [selectedCat, setSelectedCat]   = useState('All');
  const [sortBy, setSortBy]             = useState('default');
  const [flashId, setFlashId]           = useState(null);
  const { addToCart }                   = useCart();

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => { setProducts(res.data); setFiltered(res.data); })
      .catch(err => console.error('Fetch products:', err));
  }, []);

  useEffect(() => {
    let result = [...products];
    const q = searchTerm.toLowerCase().trim();
    if (q) result = result.filter(p => (p.Name||'').toLowerCase().includes(q) || (p.Description||'').toLowerCase().includes(q));
    if (selectedCat !== 'All') result = result.filter(p => p.Category === selectedCat);
    if (sortBy === 'price-asc')  result.sort((a,b) => Number(a.Price) - Number(b.Price));
    if (sortBy === 'price-desc') result.sort((a,b) => Number(b.Price) - Number(a.Price));
    if (sortBy === 'name')       result.sort((a,b) => (a.Name||'').localeCompare(b.Name||''));
    setFiltered(result);
  }, [searchTerm, selectedCat, sortBy, products]);

  const getImageSrc = p => {
    try {
      if (p.Images?.length > 0) {
        const img = p.Images[0];
        return img.startsWith('http') ? img : `http://localhost:5000${img}`;
      }
    } catch {}
    return 'https://placehold.co/300x280/fdf2f8/9d174d?text=Custom+Pearl';
  };

  const handleAddToCart = product => {
    addToCart(product);
    setFlashId(product.Id);
    setTimeout(() => setFlashId(null), 1500);
  };

  return (
    <div className="py-10 px-6 bg-white dark:bg-gray-900 transition-colors">
      <h2 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-white">Shop Our Collection</h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">Handcrafted pearl &amp; crochet bags</p>

      {/* Filter bar */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row gap-3 items-stretch">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input type="text" placeholder="Search bags…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400" />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-800">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                selectedCat === cat ? 'bg-pink-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700'
              }`}>
              {cat === 'Pearls' ? '🪬 Pearls' : cat === 'Crochet' ? '🧶 Crochet' : 'All'}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 min-w-[155px]">
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="name">Name: A → Z</option>
        </select>
      </div>

      {(searchTerm || selectedCat !== 'All') && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'} found{selectedCat !== 'All' ? ` in ${selectedCat}` : ''}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-lg">No products found.</p>
          <button onClick={() => { setSearchTerm(''); setSelectedCat('All'); }}
            className="mt-4 text-pink-600 hover:underline text-sm">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {filtered.map(product => (
            <div key={product.Id}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white dark:bg-gray-800 flex flex-col">
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <img src={getImageSrc(product)} alt={product.Name} className="w-full h-56 object-cover"
                  onError={e => { e.target.src = 'https://placehold.co/300x280/fdf2f8/9d174d?text=Custom+Pearl'; }} />
                {product.Category && (
                  <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    product.Category === 'Crochet' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'
                  }`}>
                    {product.Category === 'Crochet' ? '🧶' : '🪬'} {product.Category}
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-1">{product.Name}</h3>
              {product.Description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{product.Description}</p>
              )}
              <p className="text-pink-600 font-bold text-lg mb-4">Rs. {product.Price}</p>
              <button onClick={() => handleAddToCart(product)}
                className={`mt-auto w-full py-2 rounded-lg font-semibold transition text-sm ${
                  flashId === product.Id ? 'bg-green-500 text-white' : 'bg-pink-600 hover:bg-pink-700 text-white'
                }`}>
                {flashId === product.Id ? '✓ Added to Cart!' : '🛒 Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
