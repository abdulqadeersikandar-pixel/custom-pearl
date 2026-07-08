import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

// ── Banner ─────────────────────────────────────────────────────────────────────
const Banner = ({ type, msg, onClose }) => {
  if (!msg) return null;
  const s = {
    error:   'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300',
    success: 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300',
    info:    'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300',
  };
  const icons = { error:'⚠️', success:'✅', info:'⏳' };
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl mb-5 border text-sm font-medium ${s[type]||s.info}`}>
      <span className="text-lg leading-none mt-0.5 flex-shrink-0">{icons[type]}</span>
      <span className="flex-1">{msg}</span>
      {onClose && <button onClick={onClose} className="text-xl opacity-50 hover:opacity-100 ml-2 flex-shrink-0">×</button>}
    </div>
  );
};

const FieldError = ({ msg }) =>
  msg ? <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1"><span>⚠</span>{msg}</p> : null;

// ── Static COD always shown ────────────────────────────────────────────────────
const COD = { id:'cod', label:'Cash on Delivery', icon:'💵', desc:'Pay in cash when your order arrives', detail:null };
const PM_ICONS = { jazzcash:'📱', easypaisa:'💚', bank:'🏦' };
const PAYMENT_LABELS = { cod:'💵 Cash on Delivery', jazzcash:'📱 JazzCash', easypaisa:'💚 EasyPaisa', bank:'🏦 Bank Transfer' };

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [paymentMethods, setPaymentMethods] = useState([COD]);
  const [step, setStep]     = useState(1);
  const [formData, setFormData] = useState({
    customerName:'', customerPhone:'', customerEmail:'', shippingAddress:'', orderChannel:'Website', paymentMethod:'',
  });
  const [transactionId, setTransactionId] = useState('');
  const [fieldErrors, setFieldErrors]     = useState({});
  const [banner, setBanner]               = useState({ type:'', msg:'' });
  const [loading, setLoading]             = useState(false);
  const [orderDone, setOrderDone]         = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/payment-settings')
      .then(res => {
        const online = res.data
          .filter(p => p.IsActive)
          .map(p => ({
            id:     p.MethodKey,
            label:  p.AccountTitle, // using AccountTitle as label for simplicity if MethodLabel doesn't exist
            icon:   PM_ICONS[p.MethodKey] || '💳',
            desc:   `Pay via ${p.MethodKey}`,
            detail: { accountTitle:p.AccountTitle, accountNumber:p.AccountNumber, bankName:p.BankName },
          }));
        setPaymentMethods([COD, ...online]);
      })
      .catch(() => {});
  }, []);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors(prev => ({ ...prev, [e.target.name]:'' }));
  };

  const validateStep1 = () => {
    const errors = {};
    if (!formData.customerName.trim())              errors.customerName    = 'Full name is required.';
    if (!/^03\d{9}$/.test(formData.customerPhone))  errors.customerPhone   = 'Enter a valid 11-digit number starting with 03.';
    if (!formData.customerEmail.trim() || !/\S+@\S+\.\S+/.test(formData.customerEmail)) errors.customerEmail = 'Valid email is required.';
    if (!formData.shippingAddress.trim())            errors.shippingAddress = 'Delivery address is required.';
    
    setFieldErrors(errors);
    if (Object.keys(errors).length) { setBanner({ type:'error', msg:'Please fix the highlighted fields.' }); return false; }
    setBanner({ type:'', msg:'' }); return true;
  };

  const validateStep2 = () => {
    if (!formData.paymentMethod) { setBanner({ type:'error', msg:'Please select a payment method.' }); return false; }
    const isOnline = ['jazzcash','easypaisa','bank'].includes(formData.paymentMethod);
    if (isOnline && !transactionId.trim()) { setBanner({ type:'error', msg:'Please enter your Transaction / Reference ID.' }); return false; }
    setBanner({ type:'', msg:'' }); return true;
  };

  const placeOrder = async (channel) => {
    setLoading(true);
    setBanner({ type:'info', msg:'Placing your order, please wait…' });
    try {
      const res = await axios.post('http://localhost:5000/api/checkout-orders', {
        customerName:    formData.customerName,
        customerPhone:   formData.customerPhone,
        customerEmail:   formData.customerEmail.toLowerCase(), // Sent to backend
        shippingAddress: formData.shippingAddress,
        totalAmount:     getCartTotal(),
        cartItems,
        orderChannel:    channel,
        paymentMethod:   formData.paymentMethod,
        transactionId:   transactionId || null,
      });

      const trackingId = res.data.trackingId;
      clearCart();
      setOrderDone({ trackingId, paymentMethod: formData.paymentMethod, orderChannel: channel });
      setBanner({ type:'', msg:'' });

      setTimeout(() => {
        if (channel === 'WhatsApp') {
          const itemsList = cartItems.map(i => `• ${i.Name} × ${i.qty}${i.Price > 0 ? ` — Rs. ${Number(i.Price)*i.qty}` : ''}`).join('%0A');
          const msg = `Hi Custom Pearl! Confirming my order.%0A%0AName: ${formData.customerName}%0APhone: ${formData.customerPhone}%0AEmail: ${formData.customerEmail}%0AAddress: ${formData.shippingAddress}%0A%0AItems:%0A${itemsList}%0A%0ATotal: Rs. ${getCartTotal()}%0APayment: ${PAYMENT_LABELS[formData.paymentMethod]||formData.paymentMethod}%0A` + (transactionId ? `TXN ID: ${transactionId}%0A` : '') + `Tracking ID: ${trackingId}`;
          window.open(`https://wa.me/923094677278?text=${msg}`, '_blank');
        } else if (channel === 'Instagram') {
          window.open('https://www.instagram.com/custompearl/', '_blank');
        }
      }, 600);
    } catch (err) {
      console.error('Checkout error:', err);
      setBanner({ type:'error', msg:'Failed to place order. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const selectedPayment = paymentMethods.find(p => p.id === formData.paymentMethod);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Your cart is empty</h2>
        <Link to="/shop" className="bg-pink-600 text-white px-6 py-3 rounded-full hover:bg-pink-700 font-semibold transition">Browse Collection</Link>
      </div>
    );
  }

  if (orderDone) {
    const pm = paymentMethods.find(p => p.id === orderDone.paymentMethod);
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-10 max-w-md w-full text-center">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
            {orderDone.orderChannel === 'WhatsApp'  && 'WhatsApp has opened — please send the message to complete your order.'}
            {orderDone.orderChannel === 'Instagram' && 'Instagram has opened — please DM us to complete your order.'}
            {orderDone.orderChannel === 'Website'   && 'Thank you! We will contact you shortly to confirm your order.'}
          </p>

          <div className="bg-white dark:bg-gray-800 border border-green-300 dark:border-green-600 rounded-xl p-5 mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Tracking ID</p>
            <p className="text-3xl font-bold text-pink-600 tracking-widest">{orderDone.trackingId}</p>
            <p className="text-xs text-gray-400 mt-2">Save this to track your order</p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 text-sm text-left">
            <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Payment Method</p>
            <p className="text-gray-600 dark:text-gray-300">{pm?.icon} {pm?.label}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/track')} className="bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-xl font-bold transition text-sm">📦 Track This Order</button>
            <button onClick={() => navigate('/')} className="border border-pink-600 text-pink-600 dark:text-pink-400 py-3 px-6 rounded-xl font-bold hover:bg-pink-50 dark:hover:bg-pink-900/20 transition text-sm">Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  const STEPS = ['Delivery', 'Payment', 'Confirm'];

  return (
    <div className="py-10 px-4 max-w-5xl mx-auto min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Checkout</h2>

      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${i < step-1 ? 'text-green-600' : i===step-1 ? 'text-pink-600' : 'text-gray-300 dark:text-gray-600'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i < step-1 ? 'border-green-500 bg-green-500 text-white' : i===step-1 ? 'border-pink-600 bg-pink-600 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                {i < step-1 ? '✓' : i+1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length-1 && <div className={`flex-1 h-0.5 ${i < step-1 ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </React.Fragment>
        ))}
      </div>

      <Banner type={banner.type} msg={banner.msg} onClose={() => setBanner({ type:'', msg:'' })} />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-5">
          <div className={`bg-white dark:bg-gray-800 border rounded-xl p-6 shadow-sm ${step===1 ? 'border-pink-400 dark:border-pink-500' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${step>1?'bg-green-500 text-white':'bg-pink-600 text-white'}`}>{step>1?'✓':'1'}</span>
                Delivery Information
              </h3>
              {step>1 && <button onClick={()=>setStep(1)} className="text-xs text-pink-600 hover:underline font-medium">Edit</button>}
            </div>

            {step===1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Full Name <span className="text-pink-500">*</span></label>
                  <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="e.g. Sarah Ahmed"
                    className={`w-full border rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 ${fieldErrors.customerName?'border-red-400':'border-gray-300 dark:border-gray-600'}`} />
                  <FieldError msg={fieldErrors.customerName} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Phone Number <span className="text-pink-500">*</span></label>
                    <input type="text" name="customerPhone" value={formData.customerPhone} onChange={handleChange} placeholder="03001234567" maxLength={11}
                      className={`w-full border rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 ${fieldErrors.customerPhone?'border-red-400':'border-gray-300 dark:border-gray-600'}`} />
                    <FieldError msg={fieldErrors.customerPhone} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email Address <span className="text-pink-500">*</span></label>
                    <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} placeholder="sarah@example.com"
                      className={`w-full border rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 ${fieldErrors.customerEmail?'border-red-400':'border-gray-300 dark:border-gray-600'}`} />
                    <FieldError msg={fieldErrors.customerEmail} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Delivery Address <span className="text-pink-500">*</span></label>
                  <textarea name="shippingAddress" value={formData.shippingAddress} onChange={handleChange} placeholder="House number, street, area, city, province" rows={3}
                    className={`w-full border rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 ${fieldErrors.shippingAddress?'border-red-400':'border-gray-300 dark:border-gray-600'}`} />
                  <FieldError msg={fieldErrors.shippingAddress} />
                </div>
                <button onClick={() => { if (validateStep1()) setStep(2); }} className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-bold text-sm transition">Continue to Payment →</button>
              </div>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-0.5">
                <p className="font-semibold text-gray-800 dark:text-white">{formData.customerName}</p>
                <p>{formData.customerPhone} | {formData.customerEmail}</p>
                <p>{formData.shippingAddress}</p>
              </div>
            )}
          </div>

          {step >= 2 && (
            <div className={`bg-white dark:bg-gray-800 border rounded-xl p-6 shadow-sm ${step===2?'border-pink-400 dark:border-pink-500':'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${step>2?'bg-green-500 text-white':'bg-pink-600 text-white'}`}>{step>2?'✓':'2'}</span> Payment Method
                </h3>
                {step>2 && <button onClick={()=>setStep(2)} className="text-xs text-pink-600 hover:underline font-medium">Edit</button>}
              </div>

              {step===2 ? (
                <div className="space-y-3">
                  {paymentMethods.map(pm => (
                    <label key={pm.id} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${formData.paymentMethod===pm.id ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-pink-300'}`}>
                      <input type="radio" name="paymentMethod" value={pm.id} checked={formData.paymentMethod===pm.id} onChange={handleChange} className="accent-pink-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">{pm.icon} {pm.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{pm.desc}</p>
                        {formData.paymentMethod===pm.id && pm.detail && (
                          <div className="mt-3 bg-white dark:bg-gray-700 rounded-xl p-3 border border-gray-200 dark:border-gray-600 text-xs space-y-1.5">
                            <p className="font-bold text-gray-700 dark:text-gray-200">Send payment to:</p>
                            {pm.detail.bankName && <p className="text-gray-600 dark:text-gray-300">Bank: <strong>{pm.detail.bankName}</strong></p>}
                            <p className="text-gray-600 dark:text-gray-300">Account Title: <strong>{pm.detail.accountTitle}</strong></p>
                            <p className="text-gray-600 dark:text-gray-300">{pm.id==='bank' ? 'IBAN' : 'Number'}: <strong className="font-mono tracking-wide">{pm.detail.accountNumber}</strong></p>
                            <p className="text-pink-600 dark:text-pink-400 font-bold mt-1">Amount to send: Rs. {getCartTotal().toLocaleString()}</p>
                            <div className="pt-1">
                              <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">Transaction / Reference ID <span className="text-pink-500">*</span></label>
                              <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="Enter TXN ID after making payment" className="w-full border border-gray-300 dark:border-gray-500 rounded-lg p-2 text-xs bg-white dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400" />
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                  <button onClick={() => { if (validateStep2()) setStep(3); }} className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-bold text-sm transition mt-2">Continue to Confirm →</button>
                </div>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>{selectedPayment?.icon} <span className="font-semibold">{selectedPayment?.label}</span></p>
                  {transactionId && <p className="text-xs text-gray-400 mt-0.5">TXN: {transactionId}</p>}
                </div>
              )}
            </div>
          )}

          {step >= 3 && (
            <div className="bg-white dark:bg-gray-800 border border-pink-400 dark:border-pink-500 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center bg-pink-600 text-white">3</span> Confirm Your Order
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Choose how you'd like to receive your confirmation</p>
              <div className="space-y-3">
                {[
                  { channel:'Website',   icon:'🌐', label:'Confirm via Website',   desc:'We will contact you directly',             cls:'bg-pink-600 hover:bg-pink-700' },
                  { channel:'Instagram', icon:'📸', label:'Confirm via Instagram',  desc:'Our Instagram DM will open',               cls:'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90' },
                  { channel:'WhatsApp',  icon:'💬', label:'Confirm via WhatsApp',   desc:'WhatsApp opens with your order details',   cls:'bg-green-500 hover:bg-green-600' },
                ].map(ch => (
                  <button key={ch.channel} onClick={() => placeOrder(ch.channel)} disabled={loading}
                    className={`w-full flex items-center gap-4 ${ch.cls} text-white p-4 rounded-xl font-bold text-sm transition disabled:opacity-50`}>
                    <span className="text-2xl flex-shrink-0">{ch.icon}</span>
                    <div className="text-left">
                      <p>{ch.label}</p>
                      <p className="text-xs font-normal opacity-80">{ch.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-80">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">Order Summary</h3>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cartItems.map(item => (
                <div key={item.Id} className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-lg bg-pink-50 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <span>{item.isCustom?'✨':'👜'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 dark:text-white truncate">{item.Name}</p>
                    <p className="text-gray-400 text-xs">× {item.qty}</p>
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-white flex-shrink-0">
                    {item.Price > 0 ? `Rs. ${(Number(item.Price)*item.qty).toLocaleString()}` : 'TBD'}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400"><span>Subtotal</span><span>Rs. {getCartTotal().toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400"><span>Shipping</span><span className="text-green-600 font-medium">Free</span></div>
              <div className="flex justify-between font-bold text-base border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
                <span className="text-gray-800 dark:text-white">Total</span>
                <span className="text-pink-600">Rs. {getCartTotal().toLocaleString()}</span>
              </div>
            </div>
            <Link to="/cart" className="block text-center text-xs text-gray-400 hover:text-gray-600 mt-4 underline">← Edit Cart</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;