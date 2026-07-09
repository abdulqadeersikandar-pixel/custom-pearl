// components/CustomOrderConfirmModal.jsx
import { useState } from "react";
import { API_URL } from "../config";
const WHATSAPP_NUMBER = "923094677278"; // international format

export default function CustomOrderConfirmModal({ orderData, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState(null);

  // Build WhatsApp message
  const buildWhatsAppMessage = () => {
    return encodeURIComponent(
      `Assalam o Alaikum! 🌸 Mujhe ek Custom Pearl Order deni hai:\n\n` +
      `👤 Naam: ${orderData.CustomerName}\n` +
      `📞 Phone: ${orderData.CustomerPhone}\n` +
      `👜 Bag Type: ${orderData.BagType}\n` +
      `🔮 Pearl Color: ${orderData.PearlColor}\n` +
      `📐 Bag Size: ${orderData.BagSize}\n` +
      (orderData.Dimensions ? `📏 Dimensions: ${orderData.Dimensions}\n` : '') +
      (orderData.SelectedItemName ? `🛍️ Item: ${orderData.SelectedItemName}\n` : '') +
      (orderData.OrderDescription ? `📝 Details: ${orderData.OrderDescription}\n` : '') +
      `\nKindly quote kar dain price aur availability. Shukriya! 🙏`
    );
  };

  const buildInstagramMessage = () => {
    return (
      `Custom Pearl Order:\n` +
      `Naam: ${orderData.CustomerName}\n` +
      `Phone: ${orderData.CustomerPhone}\n` +
      `Bag: ${orderData.BagType} | Color: ${orderData.PearlColor} | Size: ${orderData.BagSize}\n` +
      (orderData.OrderDescription ? `Details: ${orderData.OrderDescription}` : '')
    );
  };

  // Log order to DB then open social link
  const handleSocialConfirm = async (channel) => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders/custom/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...orderData, OrderChannel: channel }),
      });
      const data = await response.json();

      if (data.success) {
        setTrackingInfo(data.data);
        setConfirmed(true);

        // Open social app
        if (channel === 'WhatsApp') {
          window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`, '_blank');
        } else {
          // Copy message to clipboard then open Instagram DM
          try {
            await navigator.clipboard.writeText(buildInstagramMessage());
          } catch {}
          window.open('https://www.instagram.com/direct/new/', '_blank');
        }
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
          <span style={styles.pearl}>🌸</span>
          <h2 style={styles.title}>Custom Order Confirm Karen</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {!confirmed ? (
          <>
            {/* Info message */}
            <div style={styles.infoBox}>
              <p style={styles.infoText}>
                ✨ <strong>Custom orders ke liye exact price</strong> humari team personally quote karti hai.
                Apna order in mein se kisi ek channel se confirm karein — hum jald hi aapko price bata denge!
              </p>
            </div>

            {/* Order Summary */}
            <div style={styles.summaryBox}>
              <h4 style={styles.summaryTitle}>📋 Aapka Order Summary</h4>
              <div style={styles.summaryGrid}>
                <span style={styles.label}>Naam:</span>
                <span style={styles.value}>{orderData.CustomerName}</span>
                <span style={styles.label}>Phone:</span>
                <span style={styles.value}>{orderData.CustomerPhone}</span>
                <span style={styles.label}>Bag Type:</span>
                <span style={styles.value}>{orderData.BagType}</span>
                <span style={styles.label}>Pearl Color:</span>
                <span style={styles.value}>{orderData.PearlColor}</span>
                <span style={styles.label}>Size:</span>
                <span style={styles.value}>{orderData.BagSize}</span>
                {orderData.Dimensions && <>
                  <span style={styles.label}>Dimensions:</span>
                  <span style={styles.value}>{orderData.Dimensions}</span>
                </>}
                {orderData.OrderDescription && <>
                  <span style={styles.label}>Details:</span>
                  <span style={styles.value}>{orderData.OrderDescription}</span>
                </>}
              </div>
            </div>

            {/* Action Buttons */}
            <p style={styles.chooseText}>Confirm karne ka tarika chunein:</p>
            <div style={styles.btnRow}>
              <button
                onClick={() => handleSocialConfirm('WhatsApp')}
                disabled={loading}
                style={{ ...styles.socialBtn, ...styles.waBtn }}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp"
                  style={styles.socialIcon}
                />
                {loading ? 'Saving...' : 'WhatsApp se Confirm'}
              </button>

              <button
                onClick={() => handleSocialConfirm('Instagram')}
                disabled={loading}
                style={{ ...styles.socialBtn, ...styles.igBtn }}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                  alt="Instagram"
                  style={styles.socialIcon}
                />
                {loading ? 'Saving...' : 'Instagram se Confirm'}
              </button>
            </div>
            <p style={styles.noteText}>
              📌 WhatsApp mein message automatically fill ho jata hai. Instagram ke liye message clipboard mein copy ho jata hai.
            </p>
          </>
        ) : (
          /* Success Screen */
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✅</div>
            <h3 style={styles.successTitle}>Order Log Ho Gaya!</h3>
            <p style={styles.successMsg}>
              Aapka order humari team ko mil gaya. Hum jald hi <strong>{orderData.CustomerPhone}</strong> pe price quote karenge.
            </p>
            <div style={styles.trackingBox}>
              <p style={styles.trackingLabel}>🔖 Aapki Tracking ID:</p>
              <code style={styles.trackingId}>{trackingInfo?.trackingId}</code>
              <p style={styles.trackingSub}>Yeh ID save kar lein — "Track Order" mein use kar sakte hain</p>
            </div>
            <button onClick={onClose} style={styles.doneBtn}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '16px',
  },
  modal: {
    background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '480px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #c9a96e, #8b5e3c)',
    padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px',
  },
  pearl: { fontSize: '28px' },
  title: { flex: 1, color: '#fff', fontSize: '20px', fontWeight: 700, margin: 0 },
  closeBtn: {
    background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
    width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
    fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  infoBox: {
    background: '#fffbf0', borderLeft: '4px solid #c9a96e',
    margin: '20px 24px 0', borderRadius: '8px', padding: '14px',
  },
  infoText: { margin: 0, color: '#6b4c2a', fontSize: '14px', lineHeight: '1.6' },
  summaryBox: {
    margin: '16px 24px', background: '#f9f5ef', borderRadius: '12px', padding: '16px',
  },
  summaryTitle: { margin: '0 0 12px', color: '#8b5e3c', fontSize: '15px' },
  summaryGrid: {
    display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px',
  },
  label: { color: '#999', fontSize: '13px', fontWeight: 600 },
  value: { color: '#333', fontSize: '13px' },
  chooseText: {
    textAlign: 'center', color: '#666', fontSize: '14px',
    margin: '16px 24px 12px', fontWeight: 600,
  },
  btnRow: {
    display: 'flex', gap: '12px', padding: '0 24px',
  },
  socialBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', padding: '14px 16px', borderRadius: '12px', border: 'none',
    cursor: 'pointer', fontSize: '14px', fontWeight: 700, transition: 'all 0.2s',
  },
  waBtn: { background: '#25D366', color: '#fff' },
  igBtn: {
    background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    color: '#fff',
  },
  socialIcon: { width: '22px', height: '22px', borderRadius: '4px' },
  noteText: {
    textAlign: 'center', color: '#aaa', fontSize: '12px',
    margin: '12px 24px 20px', lineHeight: '1.5',
  },
  successBox: {
    padding: '32px 24px', textAlign: 'center',
  },
  successIcon: { fontSize: '56px', marginBottom: '12px' },
  successTitle: { color: '#2e7d32', fontSize: '22px', fontWeight: 700, margin: '0 0 10px' },
  successMsg: { color: '#555', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px' },
  trackingBox: {
    background: '#f0f7ff', borderRadius: '12px', padding: '16px',
    border: '2px dashed #90caf9', marginBottom: '20px',
  },
  trackingLabel: { color: '#666', fontSize: '13px', margin: '0 0 8px' },
  trackingId: {
    display: 'block', fontSize: '20px', fontWeight: 700, color: '#1565c0',
    letterSpacing: '2px', margin: '0 0 8px',
  },
  trackingSub: { color: '#999', fontSize: '12px', margin: 0 },
  doneBtn: {
    background: 'linear-gradient(135deg, #c9a96e, #8b5e3c)',
    color: '#fff', border: 'none', borderRadius: '10px',
    padding: '12px 40px', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
  },
};
