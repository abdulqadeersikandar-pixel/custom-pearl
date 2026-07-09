const nodemailer = require("nodemailer");

console.log("✅ Email Service Loaded");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOrderEmail = async ({
    customerEmail,
    customerName,
    trackingId,
    bagType,
    bagSize,
    pearlColor,
    orderStatus = "Pending",
}) => {

    console.log("📧 Email Function Called");

    console.log({
        customerEmail,
        customerName,
        trackingId,
        bagType,
        bagSize,
        pearlColor,
    });

    if (!customerEmail) {
        console.log("❌ Customer email is empty.");
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"Custom Pearl" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: "🎉 Your Custom Pearl Order has been received!",

            html: `
            <div style="font-family:Arial,sans-serif;padding:25px">

                <h2 style="color:#E91E63">
                    Thank you for your order ❤️
                </h2>

                <p>Dear <b>${customerName}</b>,</p>

                <p>We have successfully received your custom order.</p>

                <hr>

                <h3>Order Details</h3>

                <table cellpadding="8">
                    <tr>
                        <td><b>Tracking ID</b></td>
                        <td>${trackingId}</td>
                    </tr>

                    <tr>
                        <td><b>Bag Type</b></td>
                        <td>${bagType || "-"}</td>
                    </tr>

                    <tr>
                        <td><b>Size</b></td>
                        <td>${bagSize || "-"}</td>
                    </tr>

                    <tr>
                        <td><b>Colour</b></td>
                        <td>${pearlColor || "-"}</td>
                    </tr>

                    <tr>
                        <td><b>Status</b></td>
                        <td>${orderStatus}</td>
                    </tr>
                </table>

                <br>

                <h3 style="color:#E91E63">
                    Tracking ID
                </h3>

                <h2>${trackingId}</h2>

                <p>Please keep this Tracking ID safe.</p>

                <br>

                <p>Thank you for choosing <b>Custom Pearl</b>.</p>

            </div>
            `,
        });

        console.log("✅ Email Sent Successfully");
        console.log(info.response);

    } catch (err) {
        console.error("❌ Email Sending Failed");
        console.error(err);
    }
};

module.exports = { sendOrderEmail };