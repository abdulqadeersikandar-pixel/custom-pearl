const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const qrcode = require('qrcode'); // 🟢 Naya package import kiya

// Status track karne ke liye variables
let botStatus = 'INITIALIZING'; // Status: INITIALIZING, QR_READY, CONNECTED, DISCONNECTED
let currentQRDataUrl = ''; // Yahan QR image save hogi

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    }
});

// 🟢 Jab QR Code generate ho (Terminal aur Frontend dono ke liye)
client.on('qr', async (qr) => {
    console.log('\n🔴 TERMINAL SCANNER:');
    qrcodeTerminal.generate(qr, { small: true });
    
    // Frontend ke liye QR ko Image URL mein convert karein
    try {
        currentQRDataUrl = await qrcode.toDataURL(qr);
        botStatus = 'QR_READY';
    } catch (err) {
        console.error('QR Image banane mein masla:', err);
    }
});

client.on('ready', () => {
    console.log('✅ WhatsApp Bot is Ready and Connected!');
    botStatus = 'CONNECTED';
    currentQRDataUrl = ''; // Scan ho gaya toh QR clear kar dein
});

client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp Bot Disconnected:', reason);
    botStatus = 'DISCONNECTED';
    client.initialize(); // Dobara start karne ki koshish karein
});

client.initialize();

// 🟢 Frontend ko status bhejne ka function
const getWhatsAppStatus = () => {
    return {
        status: botStatus,
        qrCodeUrl: currentQRDataUrl
    };
};

// Message send karne ka main function (Purana wala hi hai)
const sendWhatsAppNotification = async (customerName, phone, orderNumber, trackingId) => {
    try {
        if (!phone) return false;

        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '92' + formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith('92')) {
            formattedPhone = '92' + formattedPhone; 
        }

        const chatId = formattedPhone + '@c.us';
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const trackingUrl = `${frontendUrl}/track-order`;
        
        const message = `🎉 *Hello ${customerName || 'Customer'},*

Your order from *Custom Pearl* has been successfully placed! 

📦 *Order Details:*
• Order Ref: *${orderNumber}*
• Tracking ID: *${trackingId}*

🚚 *Track your order here:*
${trackingUrl}

Thank you for shopping with us! ✨`;

        await client.sendMessage(chatId, message);
        console.log(`✅ Message sent to ${formattedPhone}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed message:`, error.message);
        return false;
    }
};

module.exports = { sendWhatsAppNotification, getWhatsAppStatus };