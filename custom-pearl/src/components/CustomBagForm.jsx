import { API_URL } from "../config";
import React, 
{ useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const BAG_OPTIONS = {
  Pearls:  ['Mini Pearl Bag', 'Shoulder Pearl Bag', 'Tote Pearl Bag', 'Pearl Clutch'],
  Crochet: ['Mini Crochet Bag', 'Crochet Shoulder Bag', 'Crochet Tote', 'Crochet Clutch'],
};

// Dimensions per size (inches)
const SIZE_DIMENSIONS = {
  Small:  { length: '7',  width: '5',  height: '3'  },
  Medium: { length: '10', width: '7',  height: '4'  },
  Large:  { length: '13', width: '10', height: '5'  },
};

// ── Styled Banner ──────────────────────────────────────────────────────────────
const Banner = ({ type, msg, onClose }) => {
  if (!msg) return null;
  const styles = {
    error:   'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300',
    success: 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300',
    info:    'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300',
  };
  const icons = { error: '⚠️', success: '✅', info: '⏳' };
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl mb-5 border text-sm font-medium ${styles[type] || styles.info}`}>
      <span className="text-lg leading-none mt-0.5 flex-shrink-0">{icons[type]}</span>
      <span className="flex-1">{msg}</span>
      {onClose && (
        <button onClick={onClose} className="text-xl leading-none opacity-50 hover:opacity-100 ml-2 flex-shrink-0">×</button>
      )}
    </div>
  );
};

const FieldError = ({ msg }) =>
  msg ? (
    <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
      <span>⚠</span> {msg}
    </p>
  ) : null;

// ── Main Component ─────────────────────────────────────────────────────────────
const CustomBagForm = () => {
  const [category, setCategory]         = useState('');
  const [formData, setFormData]         = useState({
    customerName: '', phone: '', bagType: '', size: 'Medium', color: '', orderDescription: '',
  });
  const [image, setImage]               = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [banner, setBanner]             = useState({ type: '', msg: '' });
  const [fieldErrors, setFieldErrors]   = useState({});
  const [actionStep, setActionStep]     = useState(null); // null | 'confirm-options'
  const [submitting, setSubmitting]     = useState(false);
  const [orderDone, setOrderDone]       = useState(null); // { trackingId, channel }
  const { addToCart }                   = useCart();
  const navigate                        = useNavigate();

  // When category changes → reset bag type
  useEffect(() => {
    if (category) {
      setFormData(prev => ({ ...prev, bagType: BAG_OPTIONS[category][0] }));
    }
  }, [category]);

  const dims = SIZE_DIMENSIONS[formData.size] || SIZE_DIMENSIONS.Medium;

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    setImage(file);
    setFieldErrors(prev => ({ ...prev, imageOrDesc: '' }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!category)                               errors.category     = 'Please select Pearls or Crochet.';
    if (!formData.customerName.trim())           errors.customerName = 'Full name is required.';
    if (!/^03\d{9}$/.test(formData.phone))       errors.phone        = 'Enter a valid 11-digit number starting with 03.';
    if (!image && !formData.orderDescription.trim())
                                                 errors.imageOrDesc  = 'Please provide at least one: an inspiration image or a description.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setBanner({ type: 'error', msg: 'Please fix the highlighted fields before continuing.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    setBanner({ type: '', msg: '' });
    return true;
  };

  // ── Add to Cart ──────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!validate()) return;
    const customItem = {
      Id: `custom-${Date.now()}`,
      Name: `Custom ${formData.bagType}`,
      Price: 0,
      qty: 1,
      Images: imagePreview ? [imagePreview] : [],
      isCustom: true,
      category,
      customDetails: { ...formData, dimensions: `${dims.length}" × ${dims.width}" × ${dims.height}"` },
    };
    addToCart(customItem);
    setBanner({ type: 'success', msg: 'Custom bag added to cart! Head to cart to review before checkout.' });
    setActionStep(null);
  };

  // ── Show confirm channel picker ───────────────────────────────────────────────
  const handleShowConfirm = () => {
    if (!validate()) return;
    setActionStep('confirm-options');
    setBanner({ type: '', msg: '' });
  };

  // ── Submit order → then open channel ─────────────────────────────────────────
  const submitAndRedirect = async (channel) => {
    setSubmitting(true);
    setBanner({ type: 'info', msg: 'Submitting your order, please wait…' });

    const data = new FormData();
    data.append('customerName',     formData.customerName);
    data.append('phone',            formData.phone);
    data.append('bagType',          formData.bagType);
    data.append('size',             formData.size);
    data.append('color',            formData.color);
    data.append('dimensions',       `${dims.length}" × ${dims.width}" × ${dims.height}"`);
    data.append('orderDescription', formData.orderDescription);
    data.append('selectedCategory', category);
    data.append('orderChannel',     channel);
    if (image) data.append('image', image);

    try {
      const res = await axios.post('https://custom-pearl-backend.onrender.com/api/custom-orders', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const trackingId = res.data.trackingId;
      setOrderDone({ trackingId, channel });
      setActionStep(null);
      setBanner({ type: '', msg: '' });

      // Open channel after short delay so user sees tracking ID first
      setTimeout(() => {
        if (channel === 'WhatsApp') {
          const dimText = `${dims.length}" × ${dims.width}" × ${dims.height}"`;
          const msg =
            `Hi Custom Pearl! I'd like to place a custom bag order.%0A%0A` +
            `Name: ${formData.customerName}%0A` +
            `Phone: ${formData.phone}%0A` +
            `Category: ${category}%0A` +
            `Bag Type: ${formData.bagType}%0A` +
            `Size: ${formData.size} (${dimText})%0A` +
            `Colour: ${formData.color}%0A` +
            `Description: ${formData.orderDescription}%0A%0A` +
            `Tracking ID: ${trackingId}`;
          window.open(`https://wa.me/923094677278?text=${msg}`, '_blank');
        } else if (channel === 'Instagram') {
          window.open('https://www.instagram.com/custompearl/', '_blank');
        }
        // Website: stay on page, tracking ID visible
      }, 800);

    } catch (err) {
      console.error('Custom order error:', err);
      const serverMsg = err?.response?.data?.message || '';
      setBanner({
        type: 'error',
        msg: `Failed to submit order. ${serverMsg ? `(${serverMsg})` : 'Please check your connection and try again.'}`,
      });
      setActionStep('confirm-options');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Order Success Screen ──────────────────────────────────────────────────────
  if (orderDone) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 text-center">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-10">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">Order Submitted!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
            {orderDone.channel === 'WhatsApp'  && 'WhatsApp has opened — please send the message to confirm your order.'}
            {orderDone.channel === 'Instagram' && 'Instagram has opened — please send us a DM to confirm your order.'}
            {orderDone.channel === 'Website'   && 'Your order has been received. We will contact you shortly to confirm.'}
          </p>

          {/* Tracking ID */}
          <div className="bg-white dark:bg-gray-800 border border-green-300 dark:border-green-600 rounded-xl p-5 mb-6 inline-block w-full">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Tracking ID</p>
            <p className="text-3xl font-bold text-pink-600 tracking-widest">{orderDone.trackingId}</p>
            <p className="text-xs text-gray-400 mt-2">Save this to track your order at <strong>Track Order</strong> page</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/track')}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-bold transition text-sm"
            >
              📦 Track This Order
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="border border-pink-600 text-pink-600 dark:text-pink-400 px-6 py-3 rounded-xl font-bold hover:bg-pink-50 dark:hover:bg-pink-900/20 transition text-sm"
            >
              🛒 View Cart
            </button>
            <button
              onClick={() => {
                setOrderDone(null);
                setFormData({ customerName:'', phone:'', bagType:'', size:'Medium', color:'', orderDescription:'' });
                setImage(null); setImagePreview(null); setCategory('');
              }}
              className="text-gray-400 hover:text-gray-600 text-sm underline self-center"
            >
              Place Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <h2 className="text-3xl font-bold mb-1 text-center text-gray-800 dark:text-white">
        Customise Your Bag
      </h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">
        Choose your style and let us craft it for you
      </p>

      <Banner type={banner.type} msg={banner.msg} onClose={() => setBanner({ type:'', msg:'' })} />

      <div className="space-y-5 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">

        {/* STEP 1 — Category */}
        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2 text-sm">
            Step 1 — Select Category <span className="text-pink-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {['Pearls', 'Crochet'].map(cat => (
              <button
                key={cat} type="button"
                onClick={() => { setCategory(cat); setFieldErrors(prev => ({ ...prev, category: '' })); }}
                className={`py-3 rounded-xl border-2 font-semibold text-sm transition ${
                  category === cat
                    ? cat === 'Crochet'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-pink-300'
                }`}
              >
                {cat === 'Pearls' ? '🪬 Pearl Bags' : '🧶 Crochet Bags'}
              </button>
            ))}
          </div>
          <FieldError msg={fieldErrors.category} />
        </div>

        {/* STEP 2 — Rest of form, shown only after category chosen */}
        {category && (
          <>
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Full Name <span className="text-pink-500">*</span>
              </label>
              <input
                type="text" name="customerName" value={formData.customerName} onChange={handleChange}
                placeholder="e.g. Sarah Ahmed"
                className={`w-full border rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 ${fieldErrors.customerName ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
              />
              <FieldError msg={fieldErrors.customerName} />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                WhatsApp Number <span className="text-pink-500">*</span>
              </label>
              <input
                type="text" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="03001234567" maxLength={11}
                className={`w-full border rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 ${fieldErrors.phone ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
              />
              <FieldError msg={fieldErrors.phone} />
            </div>

            {/* Bag Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Bag Type</label>
              <select
                name="bagType" value={formData.bagType} onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                {BAG_OPTIONS[category].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            {/* Size + Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Size &amp; Dimensions
              </label>
              <div className="flex gap-3 items-start">
                <select
                  name="size" value={formData.size} onChange={handleChange}
                  className="w-36 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 flex-shrink-0"
                >
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>

                {/* Dimensions card */}
                <div className="flex-1 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-700 rounded-lg p-3">
                  <p className="text-xs font-semibold text-pink-700 dark:text-pink-300 mb-1.5">
                    📐 Approx. Dimensions
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: 'Length', value: dims.length },
                      { label: 'Width',  value: dims.width  },
                      { label: 'Height', value: dims.height },
                    ].map(d => (
                      <div key={d.label} className="bg-white dark:bg-gray-800 rounded-lg py-1.5 px-1">
                        <p className="text-xs text-gray-400 dark:text-gray-500">{d.label}</p>
                        <p className="text-base font-bold text-pink-600 dark:text-pink-400">{d.value}"</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center">
                    All measurements in inches
                  </p>
                </div>
              </div>
            </div>

            {/* Colour */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Colour Preference
              </label>
              <input
                type="text" name="color" value={formData.color} onChange={handleChange}
                placeholder="e.g. White and Gold, Pastel Pink"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Order Description
                <span className="ml-2 text-xs text-gray-400 font-normal">(required if no image)</span>
              </label>
              <textarea
                name="orderDescription" value={formData.orderDescription} onChange={handleChange} rows={3}
                placeholder="Describe your design: strap length, embellishments, lining colour, any special requests…"
                className={`w-full border rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 ${fieldErrors.imageOrDesc ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Inspiration Image
                <span className="ml-2 text-xs text-gray-400 font-normal">(required if no description)</span>
              </label>
              <input
                type="file" accept="image/*" onChange={handleImageChange}
                className={`w-full border rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none ${fieldErrors.imageOrDesc ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
              />
              <FieldError msg={fieldErrors.imageOrDesc} />
              {imagePreview && (
                <div className="mt-2 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                  <button
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(null); }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow"
                  >×</button>
                </div>
              )}
            </div>

            {/* ── Action Buttons ─────────────────────────────────────────── */}
            {actionStep === null && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                {/* <button
                  type="button" onClick={handleAddToCart}
                  className="w-full border-2 border-pink-600 text-pink-600 dark:text-pink-400 dark:border-pink-400 py-3 rounded-xl font-bold text-sm hover:bg-pink-50 dark:hover:bg-pink-900/20 transition"
                >
                  🛒 Add to Cart
                </button> */}
                <button
                  type="button" onClick={handleShowConfirm}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-bold text-sm transition"
                >
                  ✅ Confirm Order
                </button>
              </div>
            )}

            {/* ── Confirm Channel Options ────────────────────────────────── */}
            {actionStep === 'confirm-options' && (
              <div className="space-y-3 pt-2">
                <p className="text-center text-gray-700 dark:text-gray-200 font-semibold text-sm">
                  How would you like to confirm your order?
                </p>

                {[
                  // { channel: 'Website',   label: 'Confirm via Website',   icon: '🌐', cls: 'bg-pink-600 hover:bg-pink-700' },
                  { channel: 'Instagram', label: 'Confirm via Instagram',  icon: '📸', cls: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90' },
                  { channel: 'WhatsApp',  label: 'Confirm via WhatsApp',   icon: '💬', cls: 'bg-green-500 hover:bg-green-600' },
                ].map(({ channel, label, icon, cls }) => (
                  <button
                    key={channel} type="button" disabled={submitting}
                    onClick={() => submitAndRedirect(channel)}
                    className={`w-full flex items-center justify-center gap-2 ${cls} text-white py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Submitting…
                      </span>
                    ) : `${icon} ${label}`}
                  </button>
                ))}

                <button
                  type="button" onClick={() => setActionStep(null)}
                  className="w-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm underline pt-1"
                >
                  ← Go Back
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomBagForm;
