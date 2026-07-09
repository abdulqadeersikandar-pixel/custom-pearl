import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Link } from "react-router-dom";
import { API_URL } from "../config";
const STATUS_COLORS = {
  'Pending':           { bg: '#fff8e1', color: '#f57f17', border: '#ffe082' },
  'Pending Quotation': { bg: '#fff3e0', color: '#e65100', border: '#ffcc02' },
  'Quotation Sent':    { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' },
  'Confirmed':         { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' },
  'Processing':        { bg: '#f3e5f5', color: '#6a1b9a', border: '#ce93d8' },
  'In Production':     { bg: '#fce4ec', color: '#880e4f', border: '#f48fb1' },
  'Ready':             { bg: '#e0f2f1', color: '#004d40', border: '#80cbc4' },
  'Shipped':           { bg: '#e8eaf6', color: '#283593', border: '#9fa8da' },
  'Delivered':         { bg: '#e8f5e9', color: '#1b5e20', border: '#66bb6a' },
  'Cancelled':         { bg: '#ffebee', color: '#b71c1c', border: '#ef9a9a' },
};

const CHANNEL_INFO = {
  'Website':   { icon: '🌐', label: 'Website',   color: '#1565c0' },
  'WhatsApp':  { icon: '💬', label: 'WhatsApp',  color: '#25D366' },
  'Instagram': { icon: '📸', label: 'Instagram', color: '#e1306c' },
};

export default function MyOrders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  
  const [phone, setPhone]       = useState('');
  const [email, setEmail]       = useState('');
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userPhone = storedUser.phone || storedUser.customerPhone;
    if (userPhone) {
        setPhone(userPhone);
    }
  }, []);

  const handleFetch = async () => {
    const cleanedPhone = phone.trim().replace(/\s+/g, '');
    const cleanedEmail = email.trim().toLowerCase();
    
    if (!cleanedPhone || !cleanedEmail) {
      setError('Please enter both your Phone Number and Email Address.');
      return;
    }
    
    setSearched(true);
    setLoading(true);
    setError('');

    try {
      // 🟢 NAYA: Secure POST request to our new backend route
      const res = await axios.post('https://custom-pearl-backend.onrender.com/api/my-orders/search', {
        phone: cleanedPhone,
        email: cleanedEmail
      });
      setOrders(res.data.data);
    } catch (err) {
      setOrders([]);
      setError(err.response?.data?.message || 'Failed to fetch orders. Make sure phone and email match.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-PK', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#fdf8f3] p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8 text-center sm:text-left">
          <span className="text-5xl">🌸</span>
          <div>
            <h1 className="text-3xl font-extrabold text-[#8b5e3c] m-0">Order History</h1>
            <p className="text-gray-500 text-sm mt-1">View your complete order history securely</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)] mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">📞 Phone Number</label>
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-[#e0d5c5] text-[15px] focus:outline-none focus:border-[#c9a96e] transition-colors"
                placeholder="03XXXXXXXXX"
                value={phone} onChange={e => setPhone(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">📧 Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#e0d5c5] text-[15px] focus:outline-none focus:border-[#c9a96e] transition-colors"
                placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFetch()}
              />
            </div>
          </div>
          <button onClick={handleFetch} disabled={loading} 
            className="w-full px-8 py-3 mt-2 bg-gradient-to-br from-[#c9a96e] to-[#8b5e3c] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70">
            {loading ? 'Searching...' : 'Search Orders'}
          </button>
          {error && <p className="text-red-600 text-sm mt-3 text-center">{error}</p>}
        </div>

        {orders.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-500 text-sm font-medium">
              <strong className="text-gray-800">{orders.length}</strong> order{orders.length > 1 ? 's' : ''} found
            </p>
            {orders.map((order, i) => {
              const isOpen    = expanded === i;
              const isCustom  = order.OrderType === 'custom';
              const statusCfg = STATUS_COLORS[order.OrderStatus] || STATUS_COLORS['Pending'];
              const channel   = CHANNEL_INFO[order.OrderChannel] || CHANNEL_INFO['Website'];

              return (
                <div key={i} className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-100 transition-all hover:shadow-md">
                  <div className="flex justify-between items-center p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpanded(isOpen ? null : i)}>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{isCustom ? '🎨' : '🛍️'}</span>
                      <div>
                        <div className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                          {isCustom ? 'Custom Order' : 'Shop Order'}
                          <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 flex items-center gap-1 hidden sm:flex" style={{ color: channel.color }}>
                            {channel.icon} {channel.label}
                          </span>
                        </div>
                        <div className="text-gray-400 text-[11px] sm:text-xs mt-0.5">{formatDate(order.OrderDate)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap" style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
                        {order.OrderStatus}
                      </span>
                      <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  <div className="px-4 sm:px-5 pb-4 flex flex-wrap items-center gap-2">
                    <span className="text-gray-400 text-xs font-medium">🔖 Tracking ID:</span>
                    <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold tracking-wide">{order.TrackingId || '—'}</code>
                  </div>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5">
                      <hr className="border-[#f0e8dc] mb-4" />
                      <div className="flex justify-between items-center bg-[#fdf8f3] p-3 sm:p-4 rounded-xl mb-5">
                        <span className="text-gray-600 text-xs sm:text-sm font-medium">{isCustom ? 'Estimated Price' : 'Total Amount'}</span>
                        <span className="font-extrabold text-[#8b5e3c] text-lg sm:text-xl">
                          {isCustom && (!order.TotalAmount || order.TotalAmount == 0)
                            ? <span className="bg-[#fff8e1] text-[#f57f17] px-3 py-1 rounded-lg text-xs sm:text-sm font-bold">Quote Pending</span>
                            : `Rs. ${Number(order.TotalAmount).toLocaleString()}`
                          }
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoRow label="Customer Name" value={order.CustomerName} />
                        <InfoRow label="Phone" value={order.CustomerPhone} />
                        <InfoRow label="Order Date" value={formatDate(order.OrderDate)} />
                        <InfoRow label="Channel" value={<span style={{ color: channel.color }}>{channel.icon} {channel.label}</span>} />

                        {!isCustom && <>
                          <InfoRow label="Shipping Address" value={order.ShippingAddress} full />
                          <InfoRow label="Payment Method" value={order.PaymentMethod === 'cod' ? '💵 Cash on Delivery' : order.PaymentMethod === 'bank' ? '🏦 Bank Transfer' : order.PaymentMethod === 'social' ? `${channel.icon} ${channel.label}` : '💳 Online Payment'} />
                          {order.CartItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-[#fdf8f0] p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-gray-700 mt-1">
                              <span>{item.name || item.Name || 'Unknown Item'} <span className="text-gray-400 mx-1">×</span> {item.quantity || item.qty || 1}</span>
                              <span className="font-bold text-[#8b5e3c]">{Number(item.price || item.Price || 0) > 0 ? `Rs. ${(Number(item.price || item.Price || 0) * (item.quantity || item.qty || 1)).toLocaleString()}` : 'TBD'}</span>
                            </div>
                          ))}
                        </>}

                        {isCustom && <>
                          <InfoRow label="Bag Type" value={order.BagType} />
                          <InfoRow label="Pearl Color" value={order.PearlColor} />
                          <InfoRow label="Bag Size" value={order.BagSize} />
                          {order.Dimensions && <InfoRow label="Dimensions" value={order.Dimensions} />}
                          {order.SelectedItemName && <InfoRow label="Selected Item" value={order.SelectedItemName} />}
                          {order.OrderDescription && <InfoRow label="Details" value={order.OrderDescription} full />}
                          {(!order.TotalAmount || order.TotalAmount == 0) && (
                            <div className="col-span-1 sm:col-span-2 bg-[#fff8e1] p-3 sm:p-4 rounded-xl flex items-start gap-3 border border-[#ffe082] mt-2">
                              <span className="text-lg">📩</span>
                              <p className="text-[#6d4c41] text-xs sm:text-sm leading-relaxed">
                                We will send the estimated price for your custom order to <strong>{order.CustomerPhone}</strong> via <strong>{channel.icon} {channel.label}</strong> shortly.
                              </p>
                            </div>
                          )}
                        </>}
                      </div>
                      <hr className="border-[#f0e8dc] my-5" />
                      <StatusTimeline status={order.OrderStatus} isCustom={isCustom} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {searched && orders.length === 0 && !error && !loading && (
          <div className="text-center py-12">
            <span className="text-6xl">📭</span>
            <p className="text-gray-500 mt-4 text-lg">No orders found for this phone and email combination.</p>
          </div>
        )}

        <div className="text-center mt-8 pb-8">
          <p className="text-gray-500 text-sm">
            Have a Tracking ID? → <Link to="/track-order" className="text-[#c9a96e] font-bold hover:underline">Track Order</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusTimeline({ status, isCustom }) {
  const checkoutSteps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const customSteps   = ['Pending Quotation', 'Quotation Sent', 'Confirmed', 'In Production', 'Shipped', 'Delivered'];
  const steps = isCustom ? customSteps : checkoutSteps;
  const current = steps.indexOf(status);

  return (
    <div className="mt-2">
      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-4">📍 Order Progress</p>
      <div className="flex overflow-x-auto pb-2 scrollbar-hide">
        {steps.map((step, i) => {
          const done   = i < current;
          const active = i === current;
          const cancel = status === 'Cancelled';
          return (
            <div key={step} className="flex flex-col items-center flex-1 min-w-[70px] relative">
              <div className="flex items-center w-full relative justify-center mb-2">
                <div className={`w-3.5 h-3.5 rounded-full z-10 shrink-0 transition-all ${cancel && active ? 'bg-red-500' : active ? 'bg-[#c9a96e] ring-4 ring-[#c9a96e]/30' : done ? 'bg-green-500' : 'bg-gray-200'}`} />
                {i < steps.length - 1 && <div className={`absolute left-1/2 top-1.5 w-full h-[2px] z-0 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
              <span className={`text-[10px] sm:text-[11px] text-center leading-tight px-1 ${active ? 'font-bold text-[#8b5e3c]' : done ? 'font-medium text-green-700' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoRow({ label, value, full }) {
  return (
    <div className={`flex flex-col gap-1 ${full ? 'sm:col-span-2' : ''}`}>
      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{label}</span>
      <span className="text-gray-800 text-sm font-medium">{value || '—'}</span>
    </div>
  );
}