import React, { useState, useEffect } from "react";
import { useOrder } from "../context/OrderContext";
import { useLocation, Link } from "react-router-dom";
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
  'Website':   { icon: '🌐', label: 'Website' },
  'WhatsApp':  { icon: '💬', label: 'WhatsApp' },
  'Instagram': { icon: '📸', label: 'Instagram' },
};

export default function TrackOrder() {
  const { trackSingleOrder } = useOrder();
  const location = useLocation();

  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder]           = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [searched, setSearched]     = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const idFromUrl = queryParams.get('id');
    if (idFromUrl) {
      setTrackingId(idFromUrl);
      handleTrack(idFromUrl);
    }
  }, [location]);

  const handleTrack = async (idToTrack = trackingId) => {
    const tid = idToTrack.trim().toUpperCase();
    if (!tid) { setError('Please enter a Tracking ID.'); return; }
    
    setLoading(true); setError(''); setOrder(null); setSearched(false);
    
    try {
      const data = await trackSingleOrder(tid);
      setOrder(data.data);
    } catch (err) {
      setError(err.message || 'Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false); setSearched(true);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-PK', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  const isCustom = order?.OrderType === 'custom';
  const statusCfg = order ? (STATUS_COLORS[order.OrderStatus] || STATUS_COLORS['Pending']) : null;
  const channel   = order ? (CHANNEL_INFO[order.OrderChannel] || CHANNEL_INFO['Website']) : null;

  const checkoutSteps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const customSteps   = ['Pending Quotation', 'Quotation Sent', 'Confirmed', 'In Production', 'Shipped', 'Delivered'];

  return (
    <div className="min-h-screen bg-[#fdf8f3] p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8 text-center sm:text-left">
          <span className="text-5xl">🔍</span>
          <div>
            <h1 className="text-3xl font-extrabold text-[#8b5e3c] m-0">Track Your Order</h1>
            <p className="text-gray-500 text-sm mt-1">Check your order status using your Tracking ID</p>
          </div>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)] mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">🔖 Tracking ID</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 px-4 py-3 rounded-xl border-2 border-[#e0d5c5] text-[15px] focus:outline-none focus:border-[#c9a96e] tracking-wide w-full transition-colors"
              placeholder="e.g., PRL-LX4K2A-9F3B"
              value={trackingId}
              onChange={e => setTrackingId(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleTrack()}
            />
            <button 
              onClick={() => handleTrack()} 
              disabled={loading} 
              className="px-8 py-3 bg-gradient-to-br from-[#c9a96e] to-[#8b5e3c] text-white font-bold rounded-xl hover:opacity-90 transition-opacity w-full sm:w-auto disabled:opacity-70 whitespace-nowrap"
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          <p className="text-gray-400 text-xs mt-2">Your Tracking ID is provided on the screen after placing an order.</p>
        </div>

        {/* Result Card */}
        {order && (
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
            
            {/* Order Type Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <span className="text-4xl">{isCustom ? '🎨' : '🛍️'}</span>
              <div className="flex-1">
                <div className="font-bold text-lg text-gray-800">{isCustom ? 'Custom Pearl Order' : 'Shop Order'}</div>
                <div className="text-gray-500 text-xs mt-1">{formatDate(order.OrderDate)}</div>
              </div>
              <span 
                className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap mt-2 sm:mt-0"
                style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}
              >
                {order.OrderStatus}
              </span>
            </div>

            <hr className="border-[#f0e8dc] my-5" />

            {/* Meta Info */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Tracking ID</span>
                <code className="text-lg font-bold text-blue-700 tracking-wide bg-blue-50 px-2 py-1 rounded-md w-fit">
                  {order.TrackingId}
                </code>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Order Channel</span>
                <span className="text-gray-700 text-sm font-semibold flex items-center gap-1">
                  {channel.icon} {channel.label}
                </span>
              </div>
            </div>

            <hr className="border-[#f0e8dc] my-5" />

            {/* Amount */}
            <div className="flex justify-between items-center bg-[#fdf8f3] p-4 rounded-xl">
              <span className="text-gray-600 text-sm font-medium">{isCustom ? 'Estimated Price' : 'Total Amount'}</span>
              <span className="font-extrabold text-[#8b5e3c] text-xl md:text-2xl">
                {isCustom && (!order.EstimatedPrice || order.EstimatedPrice == 0)
                  ? <span className="bg-[#fff8e1] text-[#f57f17] px-3 py-1 rounded-lg text-sm font-bold">Quote Pending</span>
                  : `Rs. ${Number(order.TotalAmount || order.EstimatedPrice).toLocaleString()}`
                }
              </span>
            </div>

            {/* Customer Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <InfoItem label="Customer Name" value={order.CustomerName} />
              <InfoItem label="Phone Number" value={order.CustomerPhone} />

              {!isCustom && <>
                <InfoItem label="Shipping Address" value={order.ShippingAddress} full />
                <InfoItem label="Payment Method"
                  value={order.PaymentMethod === 'cod' ? '💵 Cash on Delivery'
                    : order.PaymentMethod === 'bank' ? '🏦 Bank Transfer'
                    : order.PaymentMethod === 'social' ? `${channel.icon} ${channel.label}`
                    : '💳 Online Payment'} />
              </>}

              {isCustom && <>
                <InfoItem label="Bag Type" value={order.BagType} />
                <InfoItem label="Pearl Color" value={order.PearlColor} />
                <InfoItem label="Bag Size" value={order.BagSize} />
                {order.Dimensions && <InfoItem label="Dimensions" value={order.Dimensions} />}
                {order.SelectedItemName && <InfoItem label="Selected Item" value={order.SelectedItemName} />}
                {order.OrderDescription && <InfoItem label="Description" value={order.OrderDescription} full />}
              </>}
            </div>

            {/* Cart Items */}
            {!isCustom && Array.isArray(order.CartItems) && order.CartItems.length > 0 && (
              <div className="mt-6">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">🛒 Ordered Items</p>
                <div className="flex flex-col gap-2">
                  {order.CartItems.map((item, i) => {
  // Case-sensitive masle ko handle karne ke liye variables
  const itemName = item.name || item.Name || 'Unknown Item';
  const itemQty = item.quantity || item.qty || 1;
  const itemPrice = Number(item.price || item.Price || 0);

  return (
    <div key={i} className="flex justify-between items-center bg-[#fdf8f0] p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-gray-700 mt-1">
      <span>
        {itemName} <span className="text-gray-400 mx-1">×</span> {itemQty}
      </span>
      <span className="font-bold text-[#8b5e3c]">
        {itemPrice > 0 ? `Rs. ${(itemPrice * itemQty).toLocaleString()}` : 'TBD'}
      </span>
    </div>
  );
})}
                </div>
              </div>
            )}

            {/* Pending Quote Message */}
            {isCustom && (!order.EstimatedPrice || order.EstimatedPrice == 0) && (
              <div className="mt-6 bg-[#fff8e1] p-4 rounded-xl flex items-start gap-3 border border-[#ffe082]">
                <span className="text-xl">📩</span>
                <p className="text-[#6d4c41] text-sm leading-relaxed">
                  We will send the estimated price for your custom order via <strong>{channel.icon} {channel.label}</strong> to <strong>{order.CustomerPhone}</strong> shortly. Thank you for your patience!
                </p>
              </div>
            )}

            <hr className="border-[#f0e8dc] my-6" />

            {/* Timeline */}
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-6">📍 Order Progress</p>
            <div className="flex overflow-x-auto pb-4 scrollbar-hide">
              {(isCustom ? customSteps : checkoutSteps).map((step, i) => {
                const steps   = isCustom ? customSteps : checkoutSteps;
                const current = steps.indexOf(order.OrderStatus);
                const done    = i < current;
                const active  = i === current;
                const cancel  = order.OrderStatus === 'Cancelled';
                
                return (
                  <div key={step} className="flex flex-col items-center flex-1 min-w-[80px]">
                    <div className="flex items-center w-full relative justify-center">
                      <div className={`w-4 h-4 rounded-full z-10 shrink-0 transition-all ${
                        cancel && active ? 'bg-red-500' : active ? 'bg-[#c9a96e] ring-4 ring-[#c9a96e]/30' : done ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                      {i < steps.length - 1 && (
                        <div className={`absolute left-1/2 top-1.5 w-full h-[2px] z-0 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <span className={`text-[11px] text-center mt-3 leading-tight px-1 ${
                      active ? 'font-bold text-[#8b5e3c]' : done ? 'font-medium text-green-700' : 'text-gray-400'
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {searched && !order && !error && !loading && (
          <div className="text-center py-12">
            <span className="text-6xl">🔎</span>
            <p className="text-gray-500 mt-4 text-lg">No order found matching this Tracking ID.</p>
          </div>
        )}

        {/* Link to My Orders */}
        <div className="text-center mt-8 pb-8">
          <p className="text-gray-500 text-sm">
            Want to view all your orders? →{' '}
            <Link to="/my-orders" className="text-[#c9a96e] font-bold hover:underline">
              My Orders
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

function InfoItem({ label, value, full }) {
  return (
    <div className={`flex flex-col gap-1 ${full ? 'sm:col-span-2' : ''}`}>
      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{label}</span>
      <span className="text-gray-800 text-sm font-medium">{value || '—'}</span>
    </div>
  );
}