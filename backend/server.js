const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const express = require('express');
const cors    = require('cors');
const multer  = require('multer');
const path    = require('path');
require('dotenv').config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const { getAuth } = require('firebase-admin/auth'); // 🟢 LATEST FIREBASE IMPORT
const db = require('./db'); 

const { sendWhatsAppNotification, getWhatsAppStatus } = require('./services/whatsappService'); 

const app = express();
app.use(cors());
app.use(express.json());


// ── SECURITY MIDDLEWARE ──────────────────────
const verifyAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Access Denied: Admin Token is missing!' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await getAuth().verifyIdToken(token); // 🟢 LATEST AUTH
        req.user = decodedToken; 
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Access Denied: Invalid or Expired Token!' });
    }
};

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'custom-pearl',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
});

const upload = multer({ storage });

function generateTrackingId(prefix = 'PRL') {
    const ts   = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${ts}-${rand}`;
}

app.get('/', (req, res) => res.send('Custom Pearl API (Secure Firebase) is running!'));

app.get('/api/whatsapp-status', (req, res) => {
    try { res.json(getWhatsAppStatus()); } catch { res.json({status: 'offline'}) }
});

app.get('/api/products', async (req, res) => { 
    try {
        const snapshot = await db.collection('Products').where('IsActive', '==', 1).get();
        let products = [];
        snapshot.forEach(doc => {
            let p = doc.data();
            products.push({ ...p, Id: doc.id, Images: p.Images ? JSON.parse(p.Images) : [] });
        });
        res.json(products);
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/products', verifyAdmin, upload.single('image'), async (req, res) => { 
    try {
        const { name, price, description, category, subCategory } = req.body;
        const images = req.file ? JSON.stringify([req.file.path]) : JSON.stringify([]);
        
        await db.collection('Products').add({
            Name: name, Price: Number(price), Description: description || '', Images: images,
            Stock: 10, IsActive: 1, Category: category || 'Pearls', SubCategory: subCategory || 'Shoulder Bag',
            CreatedAt: new Date().toISOString()
        });
        res.status(201).json({ message: 'Product added!' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/products/:id', verifyAdmin, upload.single('image'), async (req, res) => { 
    try {
        const { name, price, description, category, subCategory } = req.body;
        const updateData = {
            Name: name, Price: Number(price), Description: description || '',
            Category: category || 'Pearls', SubCategory: subCategory || 'Shoulder Bag',
            UpdatedAt: new Date().toISOString()
        };
        if (req.file) updateData.Images = JSON.stringify([req.file.path]);
        
        await db.collection('Products').doc(req.params.id).update(updateData);
        res.json({ message: 'Product updated!' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/products/:id', verifyAdmin, async (req, res) => { 
    try {
        await db.collection('Products').doc(req.params.id).delete();
        res.json({ message: 'Deleted!' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/custom-orders', upload.single('image'), async (req, res) => { 
    try {
        const { customerName, phone, customerPhone, email, customerEmail, bagType, color, pearlColor, size, bagSize, dimensions, orderDescription, orderChannel, selectedCategory } = req.body;
        const resolvedPhone = (phone || customerPhone || '').trim();
        const resolvedEmail = (email || customerEmail || '').trim(); 
        const imageUrl      = req.file ? req.file.path : '';
        const trackingId    = generateTrackingId('CPO');

        await db.collection('CustomOrders').add({
            CustomerName: customerName || '', CustomerPhone: resolvedPhone, CustomerEmail: resolvedEmail, 
            InspirationImage: imageUrl, BagType: bagType || '', PearlColor: (color || pearlColor || '').trim(),
            BagSize: (size || bagSize || '').trim(), Dimensions: (dimensions || '').trim(), EstimatedPrice: 0,
            OrderDescription: orderDescription || '', OrderChannel: orderChannel || 'Website', TrackingId: trackingId,
            SelectedCategory: selectedCategory || '', WhatsAppNotified: 1, OrderStatus: 'Pending', OrderDate: new Date().toISOString()
        });

        try { await sendWhatsAppNotification(customerName, resolvedPhone, `Custom-${trackingId}`, trackingId); } catch(e){}
        res.status(201).json({ success: true, message: 'Custom order placed!', trackingId, imageUrl });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/custom-orders', verifyAdmin, async (req, res) => { 
    try {
        const snapshot = await db.collection('CustomOrders').orderBy('OrderDate', 'desc').get();
        let orders = [];
        snapshot.forEach(doc => orders.push({ Id: doc.id, ...doc.data() }));
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/custom-orders/:id/status', verifyAdmin, async (req, res) => { 
    try {
        await db.collection('CustomOrders').doc(req.params.id).update({ OrderStatus: req.body.status });
        res.json({ message: 'Status updated!' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/checkout-orders', async (req, res) => { 
    try {
        const { customerName, customerPhone, customerEmail, shippingAddress, totalAmount, cartItems, orderChannel, paymentMethod, transactionId } = req.body;
        const trackingId = generateTrackingId('PRL');

        await db.collection('CheckoutOrders').add({
            CustomerName: customerName || '', CustomerPhone: customerPhone || '', CustomerEmail: customerEmail || '',
            ShippingAddress: shippingAddress || '', TotalAmount: Number(totalAmount) || 0, CartItems: JSON.stringify(cartItems || []),
            OrderChannel: orderChannel || 'Website', PaymentMethod: paymentMethod || 'cod', TransactionId: transactionId || '',
            TrackingId: trackingId, WhatsAppNotified: 1, OrderStatus: 'Pending', OrderDate: new Date().toISOString()
        });

        try { await sendWhatsAppNotification(customerName, customerPhone, `Web-${trackingId}`, trackingId); } catch(e){}
        res.status(201).json({ success: true, message: 'Order confirmed!', trackingId });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/checkout-orders', verifyAdmin, async (req, res) => { 
    try {
        const snapshot = await db.collection('CheckoutOrders').orderBy('OrderDate', 'desc').get();
        let orders = [];
        snapshot.forEach(doc => {
            let o = doc.data();
            orders.push({ ...o, Id: doc.id, CartItems: o.CartItems ? JSON.parse(o.CartItems) : [] });
        });
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/checkout-orders/:id/status', verifyAdmin, async (req, res) => { 
    try {
        await db.collection('CheckoutOrders').doc(req.params.id).update({ OrderStatus: req.body.status });
        res.json({ message: 'Status updated!' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/track/:trackingId', async (req, res) => { 
    try {
        const tid = req.params.trackingId.trim().toUpperCase();
        const customSnap = await db.collection('CustomOrders').where('TrackingId', '==', tid).get();
        if (!customSnap.empty) {
            let data = customSnap.docs[0].data();
            return res.json({ success: true, data: { Id: customSnap.docs[0].id, OrderType: 'custom', ...data } });
        }
        const checkoutSnap = await db.collection('CheckoutOrders').where('TrackingId', '==', tid).get();
        if (!checkoutSnap.empty) {
            let data = checkoutSnap.docs[0].data();
            try { data.CartItems = JSON.parse(data.CartItems); } catch { data.CartItems = []; }
            return res.json({ success: true, data: { Id: checkoutSnap.docs[0].id, OrderType: 'checkout', ...data } });
        }
        res.status(404).json({ success: false, message: 'No order found with this Tracking ID.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/my-orders/search', async (req, res) => { 
    try {
        const phone = req.body.phone?.trim();
        const email = req.body.email?.trim().toLowerCase();
        if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required.' });

        let allOrders = [];
        const checkoutSnap = await db.collection('CheckoutOrders').where('CustomerPhone', '==', phone).get();
        checkoutSnap.forEach(doc => {
            let data = doc.data();
            if (data.OrderStatus !== 'Cancelled' && data.OrderStatus !== 'Failed') {
                if (data.CustomerEmail && email && data.CustomerEmail.toLowerCase() !== email) return; 
                try { data.CartItems = JSON.parse(data.CartItems); } catch {}
                allOrders.push({ Id: doc.id, OrderType: 'checkout', ...data });
            }
        });

        const customSnap = await db.collection('CustomOrders').where('CustomerPhone', '==', phone).get();
        customSnap.forEach(doc => {
            let data = doc.data();
            if (data.OrderStatus !== 'Cancelled' && data.OrderStatus !== 'Failed') {
                if (data.CustomerEmail && email && data.CustomerEmail.toLowerCase() !== email) return;
                data.TotalAmount = data.EstimatedPrice; 
                allOrders.push({ Id: doc.id, OrderType: 'custom', ...data });
            }
        });

        allOrders.sort((a, b) => new Date(b.OrderDate) - new Date(a.OrderDate));
        if (allOrders.length === 0) return res.status(404).json({ success: false, message: 'Incorrect Phone/Email or no orders found.' });
        res.json({ success: true, data: allOrders, total: allOrders.length });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/payment-settings', async (req, res) => { 
    try {
        const snapshot = await db.collection('PaymentSettings').get();
        let settings = [];
        snapshot.forEach(doc => settings.push({ Id: doc.id, ...doc.data() }));
        res.json(settings);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/payment-settings/:key', verifyAdmin, async (req, res) => { 
    try {
        const { accountTitle, accountNumber, bankName, isActive } = req.body;
        const snapshot = await db.collection('PaymentSettings').where('MethodKey', '==', req.params.key).get();
        
        const updateData = {
            MethodKey: req.params.key, AccountTitle: accountTitle || '', AccountNumber: accountNumber || '',
            BankName: bankName || '', IsActive: isActive !== undefined ? (isActive ? 1 : 0) : 1, UpdatedAt: new Date().toISOString()
        };
        if (!snapshot.empty) await db.collection('PaymentSettings').doc(snapshot.docs[0].id).update(updateData);
        else await db.collection('PaymentSettings').add(updateData);
        res.json({ message: 'Payment settings updated!' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/reviews', async (req, res) => { 
    try {
        const snapshot = await db.collection('Reviews').where('IsPublished', '==', 1).get();
        let reviews = [];
        snapshot.forEach(doc => reviews.push({ Id: doc.id, ...doc.data() }));
        reviews.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
        res.json(reviews);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/reviews/all', verifyAdmin, async (req, res) => { 
    try {
        const snapshot = await db.collection('Reviews').get();
        let reviews = [];
        snapshot.forEach(doc => reviews.push({ Id: doc.id, ...doc.data() }));
        reviews.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
        res.json(reviews);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/reviews', upload.single('image'), async (req, res) => { 
    try {
        const { customerName, reviewText, rating } = req.body;
        const photoUrl = req.file ? req.file.path : '';
        await db.collection('Reviews').add({
            CustomerName: customerName || '', ReviewText: reviewText || '', CustomerPhotoUrl: photoUrl,
            Rating: Number(rating) || 5, IsPublished: 0, CreatedAt: new Date().toISOString()
        });
        res.status(201).json({ message: 'Review submitted!' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/reviews/:id/publish', verifyAdmin, async (req, res) => { 
    try {
        await db.collection('Reviews').doc(req.params.id).update({ IsPublished: req.body.isPublished ? 1 : 0 });
        res.json({ message: 'Review updated!' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/reviews/:id', verifyAdmin, async (req, res) => { 
    try {
        await db.collection('Reviews').doc(req.params.id).delete();
        res.json({ message: 'Review deleted!' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Secure Firebase Server running on port ${PORT}`));