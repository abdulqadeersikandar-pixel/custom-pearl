import React, { useState } from 'react';
import { API_URL } from "../config";
const faqData = [
  { q:'How long does a custom order take?',       a:'Typically 5–10 working days depending on the complexity of your design.' },
  { q:'Do you deliver all across Pakistan?',       a:'Yes! We offer free delivery to all cities and towns across Pakistan.' },
  { q:'Can I send my own design inspiration?',    a:'Absolutely. You can upload an inspiration image directly in the customisation form.' },
  { q:'Do prices vary for custom orders?',        a:'Yes, pricing depends on the bag size, materials, and design complexity. We will confirm the final price after reviewing your order.' },
  { q:'Can I order via WhatsApp or Instagram?',   a:'Yes! When placing a custom order or checking out, simply choose "Confirm via WhatsApp" or "Confirm via Instagram" and you will be connected directly.' },
];

const FAQs = () => {
  const [open, setOpen] = useState(null);
  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-800 w-full transition-colors">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-2">Frequently Asked Questions</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-10">Everything you need to know</p>
        <div className="space-y-3">
          {faqData.map((f, i) => (
            <div key={i} className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-5 py-4 flex justify-between items-center">
                <span className="font-semibold text-pink-700 dark:text-pink-400 text-sm">{f.q}</span>
                <span className="text-gray-400 text-lg ml-3 flex-shrink-0">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-600 pt-3">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQs;
