// WhatsApp service disabled for production deployment

const getWhatsAppStatus = () => {
    return {
        status: "DISABLED",
        qrCodeUrl: ""
    };
};

const sendWhatsAppNotification = async () => {
    console.log("WhatsApp notifications are disabled.");
    return true;
};

module.exports = {
    sendWhatsAppNotification,
    getWhatsAppStatus
};