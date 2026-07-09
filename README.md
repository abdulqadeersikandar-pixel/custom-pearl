# ✨ Custom Pearl

A modern full-stack e-commerce platform for **custom handmade Pearl and Crochet bags**, allowing customers to personalize their bags, place orders, track them, and communicate directly with the seller.

---

## 🌐 Live Demo

Frontend:
https://custompearl.netlify.app

Backend:
https://custom-pearl-backend.onrender.com

---

# 📸 Preview

(Add screenshots here)

| Home | Products |
|------|----------|
| Screenshot | Screenshot |

| Custom Order | Admin Dashboard |
|--------------|----------------|
| Screenshot | Screenshot |

---

# 🚀 Features

## 🛍 Customer Features

- Browse handmade Pearl & Crochet bags
- Product Categories
- Product Details
- Search Products
- Responsive Design
- Dark / Light Mode
- Shopping Cart
- Quantity Management
- Checkout System
- Cash on Delivery
- Order Tracking
- Custom Bag Ordering
- Image Upload for Custom Design
- Size Selection
- Colour Selection
- Custom Description
- WhatsApp Order Confirmation
- Instagram Order Confirmation
- Tracking ID Generation
- Contact Page
- FAQ
- About Page

---

## 🎨 Custom Bag Features

Customers can fully customize their own bags.

### Available Options

- Pearl Bags
- Crochet Bags

Users can select

- Bag Type
- Size
- Dimensions
- Colour
- Description
- Inspiration Image

Every order receives a unique tracking ID.

Example

```
CPO-924613
```

---

# 📦 Order Tracking

Customers can track orders using the generated Tracking ID.

Example

```
PRL-482641
```

Shows

- Pending
- Processing
- Completed

---

# 👨‍💼 Admin Dashboard

Secure Admin Panel with Firebase Authentication.

Admin can

- Login
- Manage Products
- Add Products
- Edit Products
- Delete Products
- View Checkout Orders
- View Custom Orders
- Update Order Status
- View Customer Details
- Upload Product Images
- Dashboard Analytics

---

# 🛒 Checkout System

Supports

- Customer Information
- Shipping Address
- Order Summary
- Payment Method (Cash on Delivery)

Automatically generates

- Tracking ID

---

# ☁ Image Upload

Images are uploaded using

- Cloudinary

Customers can upload custom bag inspiration images.

---

# 📱 WhatsApp Integration

Customers can confirm orders directly through WhatsApp.

Automatically includes

- Customer Name
- Bag Type
- Size
- Colour
- Description
- Tracking ID

---

# 📸 Instagram Integration

Customers can also confirm orders through Instagram DM.

---

# 🔥 Firebase

Used for

- Authentication
- Firestore Database

---

# 🗄 Database Collections

## Products

Stores

- Product Name
- Price
- Category
- Images
- Stock

---

## CheckoutOrders

Stores

- Customer Information
- Shipping Address
- Order Status
- Tracking ID
- Payment Method

---

## CustomOrders

Stores

- Customer Details
- Bag Information
- Colour
- Size
- Description
- Uploaded Image
- Tracking ID

---

# ⚙ Tech Stack

## Frontend

- React.js
- React Router
- Axios
- Tailwind CSS

## Backend

- Node.js
- Express.js

## Database

- Firebase Firestore

## Storage

- Cloudinary

## Authentication

- Firebase Authentication

## Deployment

Frontend

- Netlify

Backend

- Render

---

# 📁 Project Structure

```
CustomPearl
│
├── client
│   ├── src
│   ├── components
│   ├── pages
│   ├── context
│   ├── hooks
│   └── assets
│
├── server
│   ├── routes
│   ├── services
│   ├── middleware
│   ├── firebase
│   ├── uploads
│   └── db.js
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/abdulqadeersikandar-pixel/CustomPearl.git
```

Move into project

```bash
cd CustomPearl
```

Install frontend

```bash
cd client
npm install
```

Install backend

```bash
cd ../server
npm install
```

---

# ▶ Run Project

Frontend

```bash
npm start
```

Backend

```bash
node server.js
```

---

# 🔑 Environment Variables

Create

```
.env
```

Add

```env
PORT=

FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
```

---

# 📈 Future Improvements

- Online Payments
- Email Notifications
- Wishlist
- Reviews & Ratings
- Coupons
- Product Filtering
- Sales Dashboard
- Inventory Alerts
- Multiple Admin Accounts
- Customer Accounts
- Order History
- Notifications

---

# 📱 Responsive

Works on

- Desktop
- Laptop
- Tablet
- Mobile

---

# 👨‍💻 Author

**Abdul Qadeer Sikandar**

Software Engineering Student

Frontend Developer

Full Stack Web Developer

LinkedIn

https://www.linkedin.com/in/abdulqadeersikandar

Portfolio

https://abdulqadeer-44.netlify.app

GitHub

https://github.com/abdulqadeersikandar-pixel

---

# ⭐ Support

If you like this project,

⭐ Star the repository

🍴 Fork it

Share your feedback.

---

# 📄 License

This project is developed for educational and portfolio purposes.
