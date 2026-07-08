import React from 'react';
import ProductList  from '../components/ProductList';
import CustomBagForm from '../components/CustomBagForm';
import Features    from '../components/Features';
import Reviews     from '../components/Reviews';
import FAQs        from '../components/FAQs';

const Home = () => {
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-pink-50 dark:bg-gray-900 flex flex-col items-center transition-colors">
      {/* Hero */}
      <div className="py-20 px-4 w-full flex flex-col items-center text-center">
        <span className="inline-block bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
          Handcrafted with Love
        </span>
        <h1 className="text-5xl font-bold text-pink-800 dark:text-pink-300 mb-4">Custom Pearl</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl leading-relaxed">
          Premium handcrafted pearl &amp; crochet bags. Beautifully made, uniquely yours, delivered across Pakistan.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={() => scrollTo('shop-section')}
            className="bg-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 shadow-lg transition">
            🛍️ Shop Collection
          </button>
          <button onClick={() => scrollTo('custom-section')}
            className="bg-white dark:bg-gray-800 text-pink-600 dark:text-pink-400 border-2 border-pink-600 dark:border-pink-400 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 dark:hover:bg-gray-700 shadow-lg transition">
            ✨ Customise Your Bag
          </button>
        </div>
        <div className="flex flex-wrap gap-8 justify-center mt-14">
          {[
            { value:'500+', label:'Happy Customers'       },
            { value:'100%', label:'Handcrafted'           },
            { value:'Free', label:'Delivery Pakistan-wide' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="shop-section"   className="w-full bg-white dark:bg-gray-900"><ProductList /></div>
      <div id="custom-section" className="w-full bg-pink-50 dark:bg-gray-800"><CustomBagForm /></div>
      <Features />
      <Reviews />
      <FAQs />
    </div>
  );
};

export default Home;
