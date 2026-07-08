const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

let client = null;

// Sirf local machine par WhatsApp initialize karo
if (process.env.NODE_ENV !== "production") {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
    },
  });

  client.on("qr", (qr) => {
    console.log("\n🔴 Scan this QR Code:");
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("✅ WhatsApp Bot is Ready!");
  });

  client.initialize();
} else {
  console.log("ℹ️ Production mode: WhatsApp Bot disabled.");
}

const sendWhatsAppMessage = async (customerNumber, orderDetails) => {
  if (!client) {
    console.log("⚠️ WhatsApp Bot disabled in production.");
    return;
  }

  try {
    let formattedNumber = customerNumber.trim();

    if (formattedNumber.startsWith("0")) {
      formattedNumber = "92" + formattedNumber.slice(1);
    }

    const chatId = formattedNumber + "@c.us";

    const message = `🎉 Hello ${orderDetails.name}

Your order has been placed successfully.

Tracking ID: ${orderDetails.trackingId}`;

    await client.sendMessage(chatId, message);

    console.log("✅ WhatsApp message sent.");
  } catch (err) {
    console.error(err);
  }
};

module.exports = { sendWhatsAppMessage };