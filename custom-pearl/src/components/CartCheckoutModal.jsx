// components/CartCheckoutModal.jsx
// Regular items  → COD / Bank Transfer / Online Payment (3 options)
// Custom items   → WhatsApp / Instagram only (2 options)
import { API_URL } from "../config";
import { useState } from "react";

const WHATSAPP_NUMBER = "923094677278";

export default function CartCheckoutModal({ cartItems, onClose, onSuccess }) {
  const [step, setStep] = useState('form');       // 'form' | 'payment' | 'success'
  const [loading, setLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [transactionId, setTransactionId] = useState('');

  const [form, setForm] = useState({
    CustomerName: '', CustomerPhone: '', ShippingAddress: ''
  });
  const [errors, setErrors] = useState({});

  // Detect if ALL items are custom
  const allCustom = cartItems.every(item => item.isCustom === true);
  // Detect if ANY item is custom (mixed cart)
  const hasCustom = cartItems.some(item => item.isCustom === true);

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const validate = () => {
    const e = {};
    if (!form.CustomerName.trim()) e.CustomerName = 'Naam zaruri hai';
    if (!form.CustomerPhone.trim()) e.CustomerPhone = 'Phone zaruri hai';
    if (!form.ShippingAddress.trim()) e.ShippingAddress = 'Address zaruri hai';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFormNext = () => {
    if (validate()) setStep('payment');
  };

  // Regular Website checkout
  const handleWebsiteCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          TotalAmount: totalAmount,
          CartItems: cartItems,
          PaymentMethod: paymentMethod,
          TransactionId: transactionId || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTrackingInfo(data.data);
        setStep('success');
        if (onSuccess) onSuccess(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Social confirm for custom/mixed cart
  const buildWhatsAppMsg = (channel) => {
    const itemList = cartItems.map(i =>
      `• ${i.name} x${i.quantity} — Rs. ${(i.price * i.quantity).toLocaleString()}`
    ).join('\n');

    return encodeURIComponent(
      `Assalam o Alaikum! 🌸 Mujhe Pearl order confirm karni hai:\n\n` +
      `👤 Naam: ${form.CustomerName}\n` +
      `📞 Phone: ${form.CustomerPhone}\n` +
      `📍 Address: ${form.ShippingAddress}\n\n` +
      `🛍️ Items:\n${itemList}\n\n` +
      `💰 Total: Rs. ${totalAmount.toLocaleString()}\n\n` +
      `Kindly confirm karein. Shukriya! 🙏`
    );
  };

  const handleSocialConfirm = async (channel) => {
    if (!validate()) { setStep('form'); return; }
    setLoading(true);
    try {
      // Log to DB as social order (using checkout endpoint with channel)
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          TotalAmount: totalAmount,
          CartItems: cartItems,
          PaymentMethod: 'social',
          TransactionId: null,
          OrderChannel: channel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTrackingInfo(data.data);
        setStep('success');

        if (channel === 'WhatsApp') {
          window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMsg()}`, '_blank');
        } else {
          const plainMsg = decodeURIComponent(buildWhatsAppMsg());
          try { await navigator.clipboard.writeText(plainMsg); } catch {}
          window.open('https://www.instagram.com/direct/new/', '_blank');
        }
        if (onSuccess) onSuccess(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <span>🛒</span>
          <h2 style={styles.title}>
            {step === 'form' ? 'Delivery Details' :
             step === 'payment' ? 'Payment' : 'Order Confirmed!'}
          </h2>
          {step !== 'success' && (
            <button onClick={onClose} style={styles.closeBtn}>✕</button>
          )}
        </div>

        {/* ── STEP 1: Form ── */}
        {step === 'form' && (
          <div style={styles.body}>
            {/* Order Summary */}
            <div style={styles.summaryBox}>
              <h4 style={styles.summaryTitle}>🧾 Order Summary</h4>
              {cartItems.map((item, i) => (
                <div key={i} style={styles.itemRow}>
                  <span style={styles.itemName}>
                    {item.isCustom && <span style={styles.customTag}>Custom</span>}
                    {item.name} × {item.quantity}
                  </span>
                  <span style={styles.itemPrice}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div style={styles.totalRow}>
                <span>Total</span>
                <strong style={styles.totalAmt}>Rs. {totalAmount.toLocaleString()}</strong>
              </div>
            </div>

            {/* Delivery Form */}
            <Field label="Naam *" error={errors.CustomerName}>
              <input style={inputStyle(errors.CustomerName)}
                placeholder="Aapka pura naam"
                value={form.CustomerName}
                onChange={e => setForm({ ...form, CustomerName: e.target.value })} />
            </Field>
            <Field label="Phone *" error={errors.CustomerPhone}>
              <input style={inputStyle(errors.CustomerPhone)}
                placeholder="03xxxxxxxxx"
                value={form.CustomerPhone}
                onChange={e => setForm({ ...form, CustomerPhone: e.target.value })} />
            </Field>
            <Field label="Shipping Address *" error={errors.ShippingAddress}>
              <textarea style={{ ...inputStyle(errors.ShippingAddress), minHeight: '80px', resize: 'vertical' }}
                placeholder="Ghar ka pura address..."
                value={form.ShippingAddress}
                onChange={e => setForm({ ...form, ShippingAddress: e.target.value })} />
            </Field>

            <button onClick={handleFormNext} style={styles.primaryBtn}>
              Aage Jao →
            </button>
          </div>
        )}

        {/* ── STEP 2: Payment ── */}
        {step === 'payment' && (
          <div style={styles.body}>
            {/* Custom / Mixed cart → Social only */}
            {(allCustom || hasCustom) ? (
              <>
                <div style={styles.infoBox}>
                  <p style={styles.infoText}>
                    🎨 Aapke cart mein <strong>customized item(s)</strong> hain. Custom orders ke liye hum
                    WhatsApp ya Instagram pe confirm karte hain taki exact price bata sakein.
                  </p>
                </div>
                <p style={styles.chooseText}>Confirm karne ka tarika chunein:</p>
                <div style={styles.socialRow}>
                  <button
                    onClick={() => handleSocialConfirm('WhatsApp')}
                    disabled={loading}
                    style={{ ...styles.socialBtn, ...styles.waBtn }}
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                      alt="WA" style={styles.socialIcon} />
                    {loading ? 'Saving...' : 'WhatsApp'}
                  </button>
                  <button
                    onClick={() => handleSocialConfirm('Instagram')}
                    disabled={loading}
                    style={{ ...styles.socialBtn, ...styles.igBtn }}
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                      alt="IG" style={styles.socialIcon} />
                    {loading ? 'Saving...' : 'Instagram'}
                  </button>
                </div>
                <p style={styles.noteText}>
                  WhatsApp mein message auto-fill hoga. Instagram ke liye message clipboard mein copy hoga.
                </p>
              </>
            ) : (
              /* Regular items → 3 payment options */
              <>
                <p style={styles.chooseText}>Payment Method:</p>
                {[
                  { key: 'cod',      label: '💵 Cash on Delivery',     sub: 'Delivery pe cash dein' },
                  { key: 'bank',     label: '🏦 Bank Transfer',         sub: 'Bank account pe paise bhejein' },
                  { key: 'online',   label: '💳 Online Payment',        sub: 'Card / JazzCash / EasyPaisa' },
                ].map(opt => (
                  <div key={opt.key}
                    onClick={() => setPaymentMethod(opt.key)}
                    style={{ ...styles.payOption, ...(paymentMethod === opt.key ? styles.paySelected : {}) }}
                  >
                    <div style={styles.payRadio}>
                      {paymentMethod === opt.key ? '🔵' : '⚪'}
                    </div>
                    <div>
                      <div style={styles.payLabel}>{opt.label}</div>
                      <div style={styles.paySub}>{opt.sub}</div>
                    </div>
                  </div>
                ))}

                {/* Transaction ID for non-COD */}
                {paymentMethod !== 'cod' && (
                  <div style={{ marginTop: '12px' }}>
                    <label style={styles.fieldLabel}>Transaction ID (Optional)</label>
                    <input
                      style={inputStyle(false)}
                      placeholder="Payment ke baad transaction ID dalein"
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                    />
                  </div>
                )}

                <div style={styles.totalConfirm}>
                  Total: <strong style={{ color: '#8b5e3c' }}>Rs. {totalAmount.toLocaleString()}</strong>
                </div>

                <button onClick={handleWebsiteCheckout} disabled={loading} style={styles.primaryBtn}>
                  {loading ? 'Processing...' : '✅ Order Place Karein'}
                </button>
              </>
            )}

            <button onClick={() => setStep('form')} style={styles.backBtn}>← Wapas</button>
          </div>
        )}

        {/* ── STEP 3: Success ── */}
        {step === 'success' && (
          <div style={{ ...styles.body, textAlign: 'center' }}>
            <div style={styles.successIcon}>🎉</div>
            <h3 style={styles.successTitle}>Order Ho Gaya!</h3>
            <p style={styles.successMsg}>
              Shukriya <strong>{form.CustomerName}</strong>! Aapka order receive ho gaya.
              Hum jald hi confirm karenge.
            </p>
            <div style={styles.trackingBox}>
              <p style={styles.trackingLabel}>🔖 Tracking ID:</p>
              <code style={styles.trackingId}>{trackingInfo?.trackingId}</code>
              <p style={styles.trackingSub}>"My Orders" ya "Track Order" mein yeh ID use karein</p>
            </div>
            <button onClick={onClose} style={styles.primaryBtn}>Done 🌸</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helper Components ──
function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={styles.fieldLabel}>{label}</label>
      {children}
      {error && <p style={styles.errorMsg}>{error}</p>}
    </div>
  );
}

const inputStyle = (hasError) => ({
  width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '14px',
  border: `1.5px solid ${hasError ? '#e53935' : '#ddd'}`,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color 0.2s',
});

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '16px',
  },
  modal: {
    background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px',
    maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: {
    background: 'linear-gradient(135deg, #c9a96e, #8b5e3c)',
    padding: '18px 24px', display: 'flex', alignItems: 'center',
    gap: '12px', position: 'sticky', top: 0, zIndex: 1,
  },
  title: { flex: 1, color: '#fff', fontSize: '18px', fontWeight: 700, margin: 0 },
  closeBtn: {
    background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
    width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px',
  },
  body: { padding: '20px 24px' },
  summaryBox: {
    background: '#fdf8f0', borderRadius: '12px', padding: '14px',
    marginBottom: '18px', border: '1px solid #ede0c8',
  },
  summaryTitle: { margin: '0 0 10px', color: '#8b5e3c', fontSize: '14px', fontWeight: 700 },
  itemRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  itemName: { color: '#555', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' },
  itemPrice: { color: '#333', fontSize: '13px', fontWeight: 600 },
  customTag: {
    background: '#c9a96e', color: '#fff', fontSize: '10px',
    padding: '2px 6px', borderRadius: '4px', fontWeight: 700,
  },
  totalRow: {
    display: 'flex', justifyContent: 'space-between',
    borderTop: '1px solid #ede0c8', paddingTop: '10px', marginTop: '8px',
    fontSize: '14px', color: '#555',
  },
  totalAmt: { color: '#8b5e3c', fontSize: '18px' },
  fieldLabel: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '5px' },
  errorMsg: { color: '#e53935', fontSize: '12px', margin: '4px 0 0' },
  infoBox: {
    background: '#fff8e1', borderLeft: '4px solid #ffa000',
    borderRadius: '8px', padding: '12px', marginBottom: '16px',
  },
  infoText: { margin: 0, color: '#5d4037', fontSize: '14px', lineHeight: '1.6' },
  chooseText: { fontSize: '14px', fontWeight: 700, color: '#444', marginBottom: '12px' },
  socialRow: { display: 'flex', gap: '12px', marginBottom: '8px' },
  socialBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', padding: '14px', borderRadius: '12px', border: 'none',
    cursor: 'pointer', fontSize: '15px', fontWeight: 700,
  },
  waBtn: { background: '#25D366', color: '#fff' },
  igBtn: {
    background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    color: '#fff',
  },
  socialIcon: { width: '22px', height: '22px', borderRadius: '4px' },
  noteText: { color: '#aaa', fontSize: '12px', textAlign: 'center', lineHeight: '1.5', marginTop: '8px' },
  payOption: {
    display: 'flex', alignItems: 'center', gap: '12px',
    border: '2px solid #eee', borderRadius: '10px', padding: '12px 14px',
    cursor: 'pointer', marginBottom: '8px', transition: 'all 0.2s',
  },
  paySelected: { borderColor: '#c9a96e', background: '#fffbf3' },
  payRadio: { fontSize: '18px' },
  payLabel: { fontWeight: 600, color: '#333', fontSize: '14px' },
  paySub: { color: '#888', fontSize: '12px', marginTop: '2px' },
  totalConfirm: {
    textAlign: 'right', fontSize: '16px', color: '#555',
    margin: '12px 0', paddingTop: '12px', borderTop: '1px solid #eee',
  },
  primaryBtn: {
    width: '100%', padding: '14px', background: 'linear-gradient(135deg, #c9a96e, #8b5e3c)',
    color: '#fff', border: 'none', borderRadius: '10px',
    fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginTop: '4px',
  },
  backBtn: {
    width: '100%', padding: '10px', background: 'none', border: '1.5px solid #ddd',
    borderRadius: '10px', color: '#888', fontSize: '14px', cursor: 'pointer', marginTop: '8px',
  },
  successIcon: { fontSize: '60px', marginBottom: '12px' },
  successTitle: { color: '#2e7d32', fontSize: '22px', fontWeight: 700, margin: '0 0 10px' },
  successMsg: { color: '#555', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px' },
  trackingBox: {
    background: '#f0f7ff', borderRadius: '12px', padding: '16px',
    border: '2px dashed #90caf9', marginBottom: '20px',
  },
  trackingLabel: { color: '#666', fontSize: '13px', margin: '0 0 8px' },
  trackingId: {
    display: 'block', fontSize: '20px', fontWeight: 700,
    color: '#1565c0', letterSpacing: '2px', margin: '0 0 8px',
  },
  trackingSub: { color: '#999', fontSize: '12px', margin: 0 },
};
