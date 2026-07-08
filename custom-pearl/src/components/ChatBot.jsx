import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! Custom Pearl mein khush amdeed. Main aapki kya madad kar sakta hoon?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Aapka WhatsApp Number (Country code ke sath)
  const WHATSAPP_NUMBER = "923094677278"; 

  // Combined aur Updated FAQs
  const faqs = {
    'delivery': 'Humara standard delivery time 3 se 5 working days hai.',
    'time': 'Bags deliver hone mein aam tor par 3 se 5 din lagte hain.',
    'payment': 'Hum Cash on Delivery (COD), JazzCash, aur Bank Transfer accept karte hain.',
    'cod': 'Ji haan, Cash on Delivery (COD) ki sahulat mojood hai.',
    'custom': 'Ji bilkul! Aap apne bag ka size, pearl color aur design customize karwa sakte hain.',
    'track': 'Aap website par "Track Order" section mein ja kar apni Tracking ID se order status check kar sakte hain.',
    'return': 'Agar product mein koi manufacturing defect ho, toh aap 7 din ke andar exchange ke liye contact kar sakte hain.',
    'price': 'Har bag ki price uske design aur size ke hisaab se hoti hai. Aap Shop section mein prices check kar sakte hain.',
    'location': 'Humari delivery pure Pakistan mein hoti hai.',
    'artist': 'Hamari art team aapke bataye hue design ko bag par perfectly hand-paint kar sakti hai.',
    'care': 'Apne pearl ya crochet bag ko saaf rakhne ke liye naram (soft) kapre ka istemal karein. Perfume ya tez chemicals se bachayein.',
    'clean': 'Apne pearl ya crochet bag ko saaf rakhne ke liye naram (soft) kapre ka istemal karein. Perfume ya tez chemicals se bachayein.',
    'change': 'Agar aapka order abhi dispatch (shipped) nahi hua, toh aap WhatsApp par rabta kar ke usme tabdeeli karwa sakte hain.',
    'modify': 'Agar aapka order abhi dispatch (shipped) nahi hua, toh aap WhatsApp par rabta kar ke usme tabdeeli karwa sakte hain.',
    'discount': 'Humari latest sales aur promo codes ki details ke liye aap hamara Instagram page follow kar sakte hain.',
    'sale': 'Humari latest sales aur promo codes ki details ke liye aap hamara Instagram page follow kar sakte hain.',
    'material': 'Hum premium quality pearls aur high-grade crochet threads use karte hain taake aapka bag khoobsurat aur long-lasting ho.',
    'quality': 'Hum premium quality pearls aur high-grade crochet threads use karte hain taake aapka bag khoobsurat aur long-lasting ho.',
    'bulk': 'Ji haan! Bulk ya wholesale orders par special discount available hai. Mazeed maloomat ke liye WhatsApp par message karein.',
    'wholesale': 'Ji haan! Bulk ya wholesale orders par special discount available hai. Mazeed maloomat ke liye WhatsApp par message karein.',
    'stock': 'Out of stock items aam tor par 1-2 hafte mein restock ho jate hain. Aap advance order ke liye humein WhatsApp kar sakte hain.',
    'size': 'Har bag ki dimensions (size) uski product details mein likhi hoti hai. Aap apni marzi ka size bhi custom banwa sakte hain.',
    'bada': 'Aap bag ka size apni marzi se chota ya bada custom banwa sakte hain.',
    'gift': 'Ji bilkul! Agar aap kisi ko gift bhejna chahte hain, toh hum bag ki special gift wrapping aur custom note bhi add kar sakte hain.'
  };

  useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    
    setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    const lowerInput = userMsg.toLowerCase();
    let botResponse = '';
    let showWhatsApp = false;

    // LAYER 1: Pehle Local FAQs check karein
    for (let key in faqs) {
      if (lowerInput.includes(key)) {
        botResponse = faqs[key];
        break;
      }
    }

    // LAYER 2: Agar FAQ mein na ho, toh Groq API hit karein
    if (!botResponse) {
      try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
          model: 'llama-3.1-8b-instant', 
          messages: [
            { role: 'system', content: 'You are a helpful customer support assistant for Custom Pearl, an online store selling handcrafted pearl and crochet bags in Pakistan. Give short, polite answers in Roman Urdu/English.' },
            { role: 'user', content: userMsg }
          ],
          temperature: 0.7,
          max_tokens: 150
        }, {
          headers: { 
            // Yahan humne hardcoded key ki jagah environment variable use kiya hai
            'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`, 
            'Content-Type': 'application/json'
          }
        });
        
        botResponse = response.data.choices[0].message.content;
      } catch (err) {
        console.error("Groq API Full Error:", err.response?.data || err.message);
        botResponse = "Maaf kijiye, mujhe is sawal ka jawab dhoondne mein thori mushkil ho rahi hai. Lekin fikar na karein, aap hamari team se direct WhatsApp par baat kar sakte hain!";
        showWhatsApp = true; 
      }
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', text: botResponse, showWhatsApp }]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed bottom-5 right-5 z-[99999]">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)} 
          className="bg-pink-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-pink-700 transition-all duration-300"
          title="Chat with us"
        >
          <span className="text-2xl">💬</span>
        </button>
      ) : (
        <div className="w-80 h-[400px] bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          <div className="bg-pink-600 px-4 py-3 text-white font-bold flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span> Custom Pearl
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white hover:text-gray-200 text-2xl font-bold leading-none pb-1"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] shadow-sm ${
                  m.type === 'user' 
                    ? 'bg-pink-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
                }`}>
                  {m.text}
                </div>
                
                {m.showWhatsApp && (
                  <a 
                    href={`https://wa.me/${WHATSAPP_NUMBER}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebd57] text-white text-xs font-bold px-4 py-2 rounded-full shadow transition-colors w-fit"
                  >
                    <span>📱</span> Chat on WhatsApp
                  </a>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="bg-white border border-gray-200 text-gray-400 text-xs px-4 py-2 rounded-2xl rounded-bl-none w-fit shadow-sm">
                Typing...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t bg-white flex gap-2 items-center">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyPress={handleKeyPress}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all" 
              placeholder="Ask a question..." 
            />
            <button 
              onClick={handleSend} 
              className="bg-pink-600 hover:bg-pink-700 text-white w-9 h-9 rounded-full flex items-center justify-center shadow transition-colors"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;