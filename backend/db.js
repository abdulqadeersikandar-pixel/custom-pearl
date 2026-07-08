const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10),
    options: { encrypt: false, trustServerCertificate: true }
};

const connectDB = async () => {
    try {
        await sql.connect(dbConfig);
        console.log('✅ Custom Pearl Database Connected!');

        // ── CheckoutOrders ─────────────────────────────────────────────────
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CheckoutOrders' AND xtype='U')
            CREATE TABLE CheckoutOrders (
                Id              INT IDENTITY(1,1) PRIMARY KEY,
                CustomerName    NVARCHAR(200),
                CustomerPhone   NVARCHAR(20),
                ShippingAddress NVARCHAR(500),
                TotalAmount     DECIMAL(10,2) DEFAULT 0,
                CartItems       NVARCHAR(MAX),
                OrderChannel    NVARCHAR(50)  DEFAULT 'Website',
                PaymentMethod   NVARCHAR(50)  DEFAULT 'cod',
                TransactionId   NVARCHAR(200),
                TrackingId      NVARCHAR(50),
                OrderStatus     NVARCHAR(50)  DEFAULT 'Pending',
                WhatsAppNotified BIT DEFAULT 0,
                OrderDate       DATETIME      DEFAULT GETDATE()
            )
        `);

        // ── PaymentSettings ────────────────────────────────────────────────
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PaymentSettings' AND xtype='U')
            CREATE TABLE PaymentSettings (
                Id            INT IDENTITY(1,1) PRIMARY KEY,
                MethodKey     NVARCHAR(50)  NOT NULL UNIQUE,
                MethodLabel   NVARCHAR(100),
                AccountTitle  NVARCHAR(200),
                AccountNumber NVARCHAR(200),
                BankName      NVARCHAR(100),
                IsActive      BIT DEFAULT 1,
                UpdatedAt     DATETIME DEFAULT GETDATE()
            )
        `);

        // Seed payment methods if empty
        const { recordset } = await sql.query(`SELECT COUNT(*) AS cnt FROM PaymentSettings`);
        if (recordset[0].cnt === 0) {
            await sql.query(`
                INSERT INTO PaymentSettings (MethodKey,MethodLabel,AccountTitle,AccountNumber,BankName,IsActive)
                VALUES
                  ('jazzcash',  'JazzCash',     'Custom Pearl','03000000000',NULL,1),
                  ('easypaisa', 'EasyPaisa',    'Custom Pearl','03000000000',NULL,1),
                  ('bank',      'Bank Transfer','Custom Pearl','PK00XXXX0000000000000000','HBL',1)
            `);
        }

        // ── Add missing columns safely ─────────────────────────────────────
        const alter = [
            // CustomOrders
            `IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('CustomOrders') AND name='OrderChannel')
             ALTER TABLE CustomOrders ADD OrderChannel NVARCHAR(50) DEFAULT 'Website'`,
            `IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('CustomOrders') AND name='TrackingId')
             ALTER TABLE CustomOrders ADD TrackingId NVARCHAR(50)`,
            `IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('CustomOrders') AND name='SelectedCategory')
             ALTER TABLE CustomOrders ADD SelectedCategory NVARCHAR(50)`,
            `IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('CustomOrders') AND name='Dimensions')
             ALTER TABLE CustomOrders ADD Dimensions NVARCHAR(200)`,
            `IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('CustomOrders') AND name='WhatsAppNotified')
             ALTER TABLE CustomOrders ADD WhatsAppNotified BIT DEFAULT 0`,
             
            // CheckoutOrders
            `IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('CheckoutOrders') AND name='PaymentMethod')
             ALTER TABLE CheckoutOrders ADD PaymentMethod NVARCHAR(50) DEFAULT 'cod'`,
            `IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('CheckoutOrders') AND name='TransactionId')
             ALTER TABLE CheckoutOrders ADD TransactionId NVARCHAR(200)`,
            `IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('CheckoutOrders') AND name='WhatsAppNotified')
             ALTER TABLE CheckoutOrders ADD WhatsAppNotified BIT DEFAULT 0`,
             
            // Products
            `IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('Products') AND name='Category')
             ALTER TABLE Products ADD Category NVARCHAR(50) DEFAULT 'Pearls'`,
            `IF NOT EXISTS(SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('Products') AND name='SubCategory')
             ALTER TABLE Products ADD SubCategory NVARCHAR(100) DEFAULT 'Shoulder Bag'`,
        ];
        for (const q of alter) await sql.query(q);

        console.log('✅ Database schema verified and ready.');
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
};

module.exports = { sql, connectDB };