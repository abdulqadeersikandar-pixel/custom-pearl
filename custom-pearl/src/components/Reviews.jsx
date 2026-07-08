import React from 'react';

const reviews = [
  { id:1, name:'Ayesha K.',   text:'The quality of my pearl bag is absolutely amazing. The custom design was exactly what I had in mind.', rating:5 },
  { id:2, name:'Fatima R.',   text:'The neatness of the work is top-notch. Highly recommend for anyone wanting a custom crochet bag.',    rating:5 },
  { id:3, name:'Zainab Ali',  text:'Fast delivery and the packaging was so premium. Absolutely loved my mini pearl bag!',                  rating:5 },
];

const Reviews = () => (
  <div className="py-16 bg-white dark:bg-gray-900 w-full transition-colors">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-2">What Our Customers Say</h2>
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-10">Real reviews from happy customers</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map(r => (
          <div key={r.id} className="p-6 bg-pink-50 dark:bg-gray-800 rounded-xl shadow-sm border border-pink-100 dark:border-gray-700">
            <span className="text-yellow-400">{'★'.repeat(r.rating)}</span>
            <p className="text-gray-700 dark:text-gray-300 italic mt-3 mb-4 text-sm leading-relaxed">"{r.text}"</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{r.name}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Reviews;
