const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Client initialize kar rahe hain (LocalAuth session save rakhega taake bar bar QR scan na karna pare)
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

// Jab server chale toh QR code terminal mein show ho
client.on('qr', (qr) => {
    console.log('\n🔴 WHATSAPP SE YEH QR CODE SCAN KAREIN (Linked Devices mein ja kar):');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp Bot is Ready and Connected!');
});

client.initialize();

// Message send karne ka function
const sendWhatsAppMessage = async (customerNumber, orderDetails) => {
    try {
        // Number ko WhatsApp format mein convert karna (e.g., 03001234567 -> 923001234567@c.us)
        let formattedNumber = customerNumber.trim();
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '92' + formattedNumber.slice(1);
        }
        const chatId = formattedNumber + '@c.us';

        // 🟢 Professional English Message Template
        const message = `🎉 *Hello ${orderDetails.name},*

Your order from *Custom Pearl* has been successfully placed! 

📦 *Order Summary:*
• Total Amount: Rs. ${orderDetails.amount}
• Tracking ID: *${orderDetails.trackingId}*

🚚 *Track your order here:*
http://localhost:5173/track-order

Thank you for choosing us! ✨`;

        // Message Bhejna
        await client.sendMessage(chatId, message);
        console.log(`✅ Message successfully sent to ${customerNumber}`);
    } catch (error) {
        console.error('❌ Failed to send WhatsApp message:', error);
    }
};

module.exports = { sendWhatsAppMessage };