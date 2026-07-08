import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, removeFromCart, updateQty, getCartTotal } = useCart();
  const navigate = useNavigate();

  const getImageSrc = item => {
    try {
      if (item.isCustom && item.Images?.[0]?.startsWith('data:')) return item.Images[0];
      if (item.Images?.length > 0) {
        const img = item.Images[0];
        return img.startsWith('http') ? img : `http://localhost:5000${img}`;
      }
    } catch {}
    return null;
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">You haven't added any bags yet.</p>
        <Link to="/shop" className="bg-pink-600 text-white px-8 py-3 rounded-full hover:bg-pink-700 transition font-semibold">
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 max-w-5xl mx-auto min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Your Shopping Cart</h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {cartItems.map(item => {
            const imgSrc = getImageSrc(item);
            return (
              <div key={item.Id}
                className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
                {/* Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-pink-50 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                  {imgSrc
                    ? <img src={imgSrc} alt={item.Name} className="w-full h-full object-cover" onError={e=>{e.target.style.display='none';}} />
                    : <span className="text-3xl">{item.isCustom ? '✨' : '👜'}</span>}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-white truncate">{item.Name}</h3>
                  {item.isCustom && item.customDetails && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 space-y-0.5">
                      {item.category && <p>{item.category}</p>}
                      {item.customDetails.size && <p>Size: {item.customDetails.size}{item.customDetails.dimensions ? ` (${item.customDetails.dimensions})` : ''}</p>}
                      {item.customDetails.color && <p>Colour: {item.customDetails.color}</p>}
                      {item.customDetails.orderDescription && (
                        <p className="truncate max-w-[220px]">"{item.customDetails.orderDescription}"</p>
                      )}
                    </div>
                  )}
                  <p className="text-pink-600 font-bold mt-1">
                    {item.Price > 0 ? `Rs. ${(Number(item.Price)*item.qty).toLocaleString()}` : 'Price on confirmation'}
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => updateQty(item.Id, item.qty - 1)} disabled={item.qty <= 1}
                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 font-bold text-lg flex items-center justify-center transition">
                    −
                  </button>
                  <span className="w-7 text-center font-semibold text-gray-800 dark:text-white">{item.qty}</span>
                  <button onClick={() => updateQty(item.Id, item.qty + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-lg flex items-center justify-center transition">
                    +
                  </button>
                </div>

                {/* Remove */}
                <button onClick={() => removeFromCart(item.Id)}
                  className="text-red-400 hover:text-red-600 transition text-xl flex-shrink-0 ml-1" title="Remove">🗑️</button>
              </div>
            );
          })}

          <Link to="/shop" className="inline-block text-pink-600 hover:text-pink-800 text-sm font-medium mt-2 transition">
            ← Continue Shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="w-full lg:w-80">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm sticky top-24">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-3 text-gray-800 dark:text-white">
              Order Summary
            </h3>
            <div className="space-y-2 mb-4">
              {cartItems.map(item => (
                <div key={item.Id} className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span className="truncate max-w-[160px]">{item.Name} × {item.qty}</span>
                  <span className="font-medium text-gray-800 dark:text-white flex-shrink-0 ml-2">
                    {item.Price > 0 ? `Rs. ${(Number(item.Price)*item.qty).toLocaleString()}` : 'TBD'}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-lg font-bold mb-5">
              <span className="text-gray-800 dark:text-white">Total</span>
              <span className="text-pink-600">Rs. {getCartTotal().toLocaleString()}</span>
            </div>
            <button onClick={() => navigate('/checkout')}
              className="w-full bg-pink-600 text-white py-3 rounded-xl hover:bg-pink-700 transition font-bold text-base">
              Proceed to Checkout →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
