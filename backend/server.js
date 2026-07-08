const express = require('express');
const cors    = require('cors');
const multer  = require('multer');
const path    = require('path');
require('dotenv').config();
const { sql, connectDB } = require('./db');

// 🟢 NAYA: getWhatsAppStatus bhi import kiya hai
const { sendWhatsAppNotification, getWhatsAppStatus } = require('./services/whatsappService'); 

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

// ── Multer ────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ── Tracking ID Generator ─────────────────────────────────
function generateTrackingId(prefix = 'PRL') {
    const ts   = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${ts}-${rand}`;
}

app.get('/', (req, res) => res.send('Custom Pearl API is running!'));

// 🟢 NAYA ROUTE: WhatsApp Bot ka Status aur QR Code React ko bhejne ke liye
app.get('/api/whatsapp-status', (req, res) => {
    res.json(getWhatsAppStatus());
});

// ════════════════════════════════════════════════════════
//  PRODUCTS
// ════════════════════════════════════════════════════════

app.get('/api/products', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Products WHERE IsActive = 1');
        res.json(result.recordset.map(p => ({
            ...p,
            Images: p.Images ? JSON.parse(p.Images) : [],
        })));
    } catch (err) {
        console.error('GET products:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { name, price, description, category, subCategory } = req.body;
        const images = req.file ? JSON.stringify([`/uploads/${req.file.filename}`]) : JSON.stringify([]);
        const r = new sql.Request();
        r.input('name',  sql.NVarChar, name);
        r.input('price', sql.Decimal,  price);
        r.input('desc',  sql.NVarChar, description  || '');
        r.input('imgs',  sql.NVarChar, images);
        r.input('cat',   sql.NVarChar, category     || 'Pearls');
        r.input('sub',   sql.NVarChar, subCategory  || 'Shoulder Bag');
        await r.query(`INSERT INTO Products(Name,Price,Description,Images,Stock,IsActive,Category,SubCategory)
                       VALUES(@name,@price,@desc,@imgs,10,1,@cat,@sub)`);
        res.status(201).json({ message: 'Product added!' });
    } catch (err) {
        console.error('POST product:', err.message);
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/products/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, price, description, category, subCategory } = req.body;
        const r = new sql.Request();
        r.input('id',    sql.Int,      req.params.id);
        r.input('name',  sql.NVarChar, name);
        r.input('price', sql.Decimal,  price);
        r.input('desc',  sql.NVarChar, description  || '');
        r.input('cat',   sql.NVarChar, category     || 'Pearls');
        r.input('sub',   sql.NVarChar, subCategory  || 'Shoulder Bag');
        let q = `UPDATE Products SET Name=@name,Price=@price,Description=@desc,Category=@cat,SubCategory=@sub`;
        if (req.file) {
            r.input('imgs', sql.NVarChar, JSON.stringify([`/uploads/${req.file.filename}`]));
            q += ',Images=@imgs';
        }
        await r.query(q + ' WHERE Id=@id');
        res.json({ message: 'Product updated!' });
    } catch (err) {
        console.error('PUT product:', err.message);
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const r = new sql.Request();
        r.input('id', sql.Int, req.params.id);
        await r.query('DELETE FROM Products WHERE Id=@id');
        res.json({ message: 'Deleted!' });
    } catch (err) {
        console.error('DELETE product:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// ════════════════════════════════════════════════════════
//  CUSTOM ORDERS
// ════════════════════════════════════════════════════════

app.post('/api/custom-orders', upload.single('image'), async (req, res) => {
    try {
        const {
            customerName, phone, customerPhone, bagType, color, pearlColor,
            size, bagSize, dimensions, orderDescription, orderChannel, selectedCategory,
        } = req.body;

        const resolvedPhone = (phone       || customerPhone || '').trim();
        const resolvedColor = (color       || pearlColor    || '').trim();
        const resolvedSize  = (size        || bagSize       || '').trim();
        const resolvedDims  = (dimensions  || '').trim();
        const imageUrl      = req.file ? `/uploads/${req.file.filename}` : '';
        const trackingId    = generateTrackingId('CPO');

        const r = new sql.Request();
        r.input('name',       sql.NVarChar, customerName     || '');
        r.input('phone',      sql.NVarChar, resolvedPhone);
        r.input('image',      sql.NVarChar, imageUrl);
        r.input('type',       sql.NVarChar, bagType          || '');
        r.input('color',      sql.NVarChar, resolvedColor);
        r.input('size',       sql.NVarChar, resolvedSize);
        r.input('dims',       sql.NVarChar, resolvedDims);
        r.input('desc',       sql.NVarChar, orderDescription || '');
        r.input('channel',    sql.NVarChar, orderChannel     || 'Website');
        r.input('trackingId', sql.NVarChar, trackingId);
        r.input('category',   sql.NVarChar, selectedCategory || '');
        r.input('price',      sql.Decimal,  0);

        await r.query(`
            INSERT INTO CustomOrders
              (CustomerName,CustomerPhone,InspirationImage,BagType,PearlColor,BagSize,
               EstimatedPrice,OrderDescription,OrderChannel,TrackingId,SelectedCategory,Dimensions,WhatsAppNotified)
            VALUES
              (@name,@phone,@image,@type,@color,@size,
               @price,@desc,@channel,@trackingId,@category,@dims, 1)
        `);

        // WhatsApp Notification Trigger
        await sendWhatsAppNotification(customerName, resolvedPhone, `Custom-${trackingId}`, trackingId);

        res.status(201).json({ success: true, message: 'Custom order placed!', trackingId, imageUrl });
    } catch (err) {
        console.error('POST custom-order:', err.message);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

app.get('/api/custom-orders', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM CustomOrders ORDER BY OrderDate DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error('GET custom-orders:', err.message);
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/custom-orders/:id/status', async (req, res) => {
    try {
        const r = new sql.Request();
        r.input('id',     sql.Int,      req.params.id);
        r.input('status', sql.NVarChar, req.body.status);
        await r.query('UPDATE CustomOrders SET OrderStatus=@status WHERE Id=@id');
        res.json({ message: 'Status updated!' });
    } catch (err) {
        console.error('PUT custom-order status:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// ════════════════════════════════════════════════════════
//  CHECKOUT ORDERS
// ════════════════════════════════════════════════════════

app.post('/api/checkout-orders', async (req, res) => {
    try {
        const {
            customerName, customerPhone, shippingAddress, totalAmount, cartItems, 
            orderChannel, paymentMethod, transactionId,
        } = req.body;

        const trackingId = generateTrackingId('PRL');
        const r = new sql.Request();
        r.input('name',       sql.NVarChar, customerName    || '');
        r.input('phone',      sql.NVarChar, customerPhone   || '');
        r.input('address',    sql.NVarChar, shippingAddress || '');
        r.input('amount',     sql.Decimal,  totalAmount     || 0);
        r.input('items',      sql.NVarChar, JSON.stringify(cartItems || []));
        r.input('channel',    sql.NVarChar, orderChannel    || 'Website');
        r.input('payment',    sql.NVarChar, paymentMethod   || 'cod');
        r.input('txnId',      sql.NVarChar, transactionId   || '');
        r.input('trackingId', sql.NVarChar, trackingId);

        await r.query(`
            INSERT INTO CheckoutOrders
              (CustomerName,CustomerPhone,ShippingAddress,TotalAmount,CartItems,
               OrderChannel,PaymentMethod,TransactionId,TrackingId,WhatsAppNotified)
            VALUES
              (@name,@phone,@address,@amount,@items,
               @channel,@payment,@txnId,@trackingId, 1)
        `);

        // WhatsApp Notification Trigger
        await sendWhatsAppNotification(customerName, customerPhone, `Web-${trackingId}`, trackingId);

        res.status(201).json({ success: true, message: 'Order confirmed!', trackingId });
    } catch (err) {
        console.error('POST checkout-order:', err.message);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

app.get('/api/checkout-orders', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM CheckoutOrders ORDER BY OrderDate DESC');
        res.json(result.recordset.map(o => ({
            ...o,
            CartItems: o.CartItems ? JSON.parse(o.CartItems) : [],
        })));
    } catch (err) {
        console.error('GET checkout-orders:', err.message);
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/checkout-orders/:id/status', async (req, res) => {
    try {
        const r = new sql.Request();
        r.input('id',     sql.Int,      req.params.id);
        r.input('status', sql.NVarChar, req.body.status);
        await r.query('UPDATE CheckoutOrders SET OrderStatus=@status WHERE Id=@id');
        res.json({ message: 'Status updated!' });
    } catch (err) {
        console.error('PUT checkout status:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// ════════════════════════════════════════════════════════
//  ORDER TRACKING — by Tracking ID
// ════════════════════════════════════════════════════════

app.get('/api/track/:trackingId', async (req, res) => {
    try {
        const tid = req.params.trackingId.trim().toUpperCase();

        const r1 = new sql.Request();
        r1.input('tid', sql.NVarChar, tid);
        const cust = await r1.query(`
            SELECT Id,CustomerName,CustomerPhone,BagType,PearlColor,BagSize,Dimensions,
                   EstimatedPrice,OrderDescription,InspirationImage,OrderChannel,TrackingId,
                   SelectedCategory,SelectedItemName,OrderStatus,OrderDate,'custom' AS OrderType
            FROM CustomOrders WHERE TrackingId=@tid
        `);

        if (cust.recordset.length > 0) {
            return res.json({ success: true, data: cust.recordset[0] });
        }

        const r2 = new sql.Request();
        r2.input('tid', sql.NVarChar, tid);
        const chk = await r2.query(`
            SELECT Id,CustomerName,CustomerPhone,ShippingAddress,TotalAmount,
                   CartItems,OrderChannel,PaymentMethod,TransactionId,TrackingId,
                   OrderStatus,OrderDate,'checkout' AS OrderType
            FROM CheckoutOrders WHERE TrackingId=@tid
        `);

        if (chk.recordset.length > 0) {
            const order = chk.recordset[0];
            try { order.CartItems = JSON.parse(order.CartItems); } catch { order.CartItems = []; }
            return res.json({ success: true, data: order });
        }

        res.status(404).json({ success: false, message: 'No order found with this Tracking ID.' });
    } catch (err) {
        console.error('GET track:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// ════════════════════════════════════════════════════════
//  MY ORDERS — by Phone Number
// ════════════════════════════════════════════════════════

app.get('/api/my-orders/:phone', async (req, res) => {
    try {
        const phone = req.params.phone.trim();

        const r1 = new sql.Request();
        r1.input('phone', sql.NVarChar, phone);
        const checkout = await r1.query(`
            SELECT Id, CustomerName, CustomerPhone, ShippingAddress, TotalAmount,
                   CartItems, OrderStatus, OrderDate, TrackingId, PaymentMethod,
                   OrderChannel, 'checkout' AS OrderType
            FROM CheckoutOrders
            WHERE CustomerPhone = @phone AND OrderStatus NOT IN ('Cancelled', 'Failed')
            ORDER BY OrderDate DESC
        `);

        const r2 = new sql.Request();
        r2.input('phone', sql.NVarChar, phone);
        const custom = await r2.query(`
            SELECT Id, CustomerName, CustomerPhone, BagType, PearlColor, BagSize,
                   EstimatedPrice AS TotalAmount, OrderStatus, OrderDate, TrackingId,
                   OrderDescription, SelectedItemName, Dimensions, OrderChannel, 'custom' AS OrderType
            FROM CustomOrders
            WHERE CustomerPhone = @phone AND OrderStatus NOT IN ('Cancelled', 'Failed')
            ORDER BY OrderDate DESC
        `);

        const parsedCheckout = checkout.recordset.map(o => {
            try { o.CartItems = JSON.parse(o.CartItems); } catch {}
            return o;
        });

        const allOrders = [...parsedCheckout, ...custom.recordset]
            .sort((a, b) => new Date(b.OrderDate) - new Date(a.OrderDate));

        if (allOrders.length === 0) {
            return res.status(404).json({ success: false, message: 'Is number pe koi confirmed order nahi mila.' });
        }

        res.json({ success: true, data: allOrders, total: allOrders.length });
    } catch (err) {
        console.error('GET my-orders:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// ════════════════════════════════════════════════════════
//  PAYMENT SETTINGS & REVIEWS 
// ════════════════════════════════════════════════════════

app.get('/api/payment-settings', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM PaymentSettings ORDER BY Id');
        res.json(result.recordset);
    } catch (err) {
        console.error('GET payment-settings:', err.message);
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/payment-settings/:key', async (req, res) => {
    try {
        const { accountTitle, accountNumber, bankName, isActive } = req.body;
        const r = new sql.Request();
        r.input('key',    sql.NVarChar, req.params.key);
        r.input('title',  sql.NVarChar, accountTitle  || '');
        r.input('number', sql.NVarChar, accountNumber || '');
        r.input('bank',   sql.NVarChar, bankName      || '');
        r.input('active', sql.Bit,      isActive !== undefined ? (isActive ? 1 : 0) : 1);
        await r.query(`
            UPDATE PaymentSettings
            SET AccountTitle=@title, AccountNumber=@number,
                BankName=@bank, IsActive=@active, UpdatedAt=GETDATE()
            WHERE MethodKey=@key
        `);
        res.json({ message: 'Payment settings updated!' });
    } catch (err) {
        console.error('PUT payment-settings:', err.message);
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/reviews', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Reviews WHERE IsPublished = 1 ORDER BY Id DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error('GET reviews:', err.message);
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/reviews/all', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Reviews ORDER BY Id DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error('GET all reviews:', err.message);
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/reviews', upload.single('image'), async (req, res) => {
    try {
        const { customerName, reviewText, rating } = req.body;
        const photoUrl = req.file ? `/uploads/${req.file.filename}` : '';
        const r = new sql.Request();
        r.input('name',     sql.NVarChar, customerName || '');
        r.input('text',     sql.NVarChar, reviewText   || '');
        r.input('photo',    sql.NVarChar, photoUrl);
        r.input('rating',   sql.Int,      rating       || 5);
        await r.query(`
            INSERT INTO Reviews (CustomerName, ReviewText, CustomerPhotoUrl, Rating, IsPublished)
            VALUES (@name, @text, @photo, @rating, 0)
        `);
        res.status(201).json({ message: 'Review submitted!' });
    } catch (err) {
        console.error('POST review:', err.message);
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/reviews/:id/publish', async (req, res) => {
    try {
        const r = new sql.Request();
        r.input('id',        sql.Int, req.params.id);
        r.input('published', sql.Bit, req.body.isPublished ? 1 : 0);
        await r.query('UPDATE Reviews SET IsPublished=@published WHERE Id=@id');
        res.json({ message: 'Review updated!' });
    } catch (err) {
        console.error('PUT review publish:', err.message);
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/reviews/:id', async (req, res) => {
    try {
        const r = new sql.Request();
        r.input('id', sql.Int, req.params.id);
        await r.query('DELETE FROM Reviews WHERE Id=@id');
        res.json({ message: 'Review deleted!' });
    } catch (err) {
        console.error('DELETE review:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// ════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))