Markdown
<div align="center">

# ✨ Custom Pearl

### A Production-Ready Full Stack E-Commerce Platform for Handmade Pearl & Crochet Bags

Design • Customize • Order • Track — All in One Platform

<p>

<img src="https://img.shields.io/badge/React-19-blue?logo=react">
<img src="https://img.shields.io/badge/Node.js-Express-green?logo=node.js">
<img src="https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase">
<img src="https://img.shields.io/badge/Cloudinary-Media-blue?logo=cloudinary">
<img src="https://img.shields.io/badge/TailwindCSS-Styled-06B6D4?logo=tailwindcss">
<img src="https://img.shields.io/badge/Netlify-Deployed-00C7B7?logo=netlify">
<img src="https://img.shields.io/badge/Render-Backend-46E3B7?logo=render">
<img src="https://img.shields.io/badge/License-MIT-success">

</p>

---

![Custom Pearl Preview](./custom-pearl-preview.png)

### 🌐 Live Website

**Frontend:** https://custompearl.netlify.app

**Backend API:** https://custom-pearl-backend.onrender.com

---

</div>

# 📖 Overview

**Custom Pearl** is a modern Full Stack E-Commerce platform developed for selling **handmade Pearl and Crochet Bags** with complete customization support.

Unlike a traditional online store, customers can design their own bags by selecting categories, bag types, colours, sizes, dimensions and even uploading inspiration images before placing an order.

The platform also includes an **Admin Dashboard** for managing products and customer orders, an **Order Tracking System**, **WhatsApp & Instagram order confirmation**, secure authentication, and cloud-based media storage.

The application was initially built using **Microsoft SQL Server** before being migrated to **Firebase Firestore**, making deployment simpler while improving scalability and cloud integration.

---

# 🚀 Key Highlights

✅ Production Ready Full Stack Application

✅ Responsive Modern UI

✅ Admin Dashboard

✅ Firebase Authentication

✅ Firebase Firestore Database

✅ Cloudinary Image Upload

✅ Custom Bag Builder

✅ Shopping Cart

✅ Checkout System

✅ Order Tracking

✅ WhatsApp Integration

✅ Instagram Integration

✅ REST API Architecture

✅ Mobile Friendly

✅ Dark Mode Support

---

# 🎯 Main Features

| Module | Status |
|---------|:------:|
| Product Catalog | ✅ |
| Product Details | ✅ |
| Shopping Cart | ✅ |
| Checkout | ✅ |
| Custom Bag Ordering | ✅ |
| Order Tracking | ✅ |
| Admin Dashboard | ✅ |
| Product Management | ✅ |
| Cloudinary Upload | ✅ |
| Firebase Authentication | ✅ |
| WhatsApp Confirmation | ✅ |
| Instagram Confirmation | ✅ |
| Responsive Design | ✅ |
| Dark Mode | ✅ |

---

# 🏗 System Architecture

```text
                 Customer
                     │
                     ▼
            React Frontend
                     │
             Axios REST API
                     │
                     ▼
          Node.js + Express Server
                     │
     ┌───────────────┼────────────────┐
     │               │                │
     ▼               ▼                ▼
 Firebase        Cloudinary       WhatsApp
 Firestore      Image Storage    Integration
     │
     ▼
 Admin Dashboard
📸 Project Preview
🏠 Home Page
🛍 Products
🎨 Custom Bag Builder
🛒 Checkout
📦 Order Tracking
👨‍💼 Admin Dashboard
💡 Why Custom Pearl?
Most handmade bag businesses rely on manual communication through social media, making order management slow and difficult.

Custom Pearl digitizes this entire workflow by providing:

A professional online storefront

Product management system

Customer order management

Personalized bag customization

Secure admin dashboard

Real-time order tracking

Social media order confirmation

Cloud-based image storage

The result is a smoother shopping experience for customers and a more efficient management system for business owners.

🛍 Customer Features
Custom Pearl provides a complete shopping experience designed specifically for handmade Pearl and Crochet bags.

🏠 Beautiful Home Page
Modern Landing Page

Featured Products

Best Sellers

Responsive Design

Dark Mode Support

👜 Product Catalog
Customers can

Browse Pearl Bags

Browse Crochet Bags

Search Products

Filter by Category

View Product Details

🎨 Custom Bag Builder
Instead of purchasing a predefined bag, customers can design their own custom bag.

Features include

Select Category

Select Bag Type

Select Size

Choose Colour

Add Custom Description

Upload Inspiration Image

Enter Contact Information

Generate Tracking ID

🛒 Shopping Cart
The shopping cart allows customers to

Add Products

Remove Products

Update Quantity

Calculate Total Price

Continue Shopping

Proceed to Checkout

💳 Checkout System
Customers can place orders using

Cash on Delivery

Checkout includes

Customer Details

Shipping Address

Contact Information

Order Summary

Tracking ID Generation

📦 Order Tracking
Every order automatically receives a unique Tracking ID.

Example

PRL-5H72KX

or

CPO-9F41LM
Customers can

Track Current Status

View Order Progress

Verify Tracking ID

💬 WhatsApp Confirmation
After placing an order,

Customers can instantly

Open WhatsApp

Send Order Details

Share Tracking ID

Confirm Purchase

📸 Instagram Confirmation
Customers may also

Open Instagram

Copy Order Details

Paste Message

Send DM

👨‍💼 Admin Dashboard
The Admin Dashboard provides complete business management tools.

📦 Product Management
Admin can

Add Products

Edit Products

Delete Products

Upload Images

Manage Categories

Update Prices

🛍 Checkout Orders
Admin can

View Orders

Change Order Status

Search Orders

Track Customers

View Payment Information

🎨 Custom Orders
Admin can

View Custom Requests

View Uploaded Inspiration Images

Read Customer Notes

Accept Orders

Reject Orders

Update Status

🔒 Secure Authentication
Only authenticated administrators can access

Dashboard

Product Management

Order Management

Customer Information

Powered by

✅ Firebase Authentication

☁ Cloudinary Integration
Instead of storing files locally,

Custom Pearl uploads customer images directly to Cloudinary.

Benefits

Faster Loading

Cloud Storage

Automatic CDN

Better Performance

Optimized Images

🔥 Firebase Integration
Firebase powers multiple services inside the application.

Authentication
Admin Login

Secure Sessions

Firestore
Stores

Products

Checkout Orders

Custom Orders

Tracking Information

Benefits

Real-time Database

Cloud Hosted

Scalable

No Local Database Required

📂 Database Collections
The project currently uses the following Firestore collections.

Collection	Purpose
Products	Store all products
CheckoutOrders	Customer purchases
CustomOrders	Custom bag requests
Admins	Admin authentication
Users	Registered users
🔄 Order Workflow
Plaintext
Customer

↓

Browse Products

↓

Add to Cart

↓

Checkout

↓

Tracking ID Generated

↓

Firestore

↓

Admin Dashboard

↓

Order Status Updated

↓

Customer Tracks Order
🎨 Custom Order Workflow
Plaintext
Customer

↓

Custom Bag Form

↓

Upload Image

↓

Enter Details

↓

Generate Tracking ID

↓

Firestore

↓

Admin Reviews Request

↓

Order Confirmed
📈 Performance Highlights
✔ Responsive Layout

✔ Fast Firestore Queries

✔ Cloudinary Optimized Images

✔ REST API Architecture

✔ Mobile Friendly

✔ Clean UI

✔ Component Based React Architecture

✔ Production Ready Backend

✔ Secure Admin Access

✔ Modular Project Structure

🛠 Technology Stack
Frontend
Technology	Purpose
React.js	User Interface
React Router	Routing
Axios	API Communication
Tailwind CSS	Styling
Context API	State Management
Backend
Technology	Purpose
Node.js	Runtime Environment
Express.js	REST API
Multer	File Upload
Cloudinary	Image Storage
CORS	Cross-Origin Requests
dotenv	Environment Variables
Database
Technology	Purpose
Firebase Firestore	NoSQL Cloud Database
Firebase Authentication	Secure Admin Login
Deployment
Service	Purpose
Netlify	Frontend Hosting
Render	Backend Hosting
GitHub	Version Control
📂 Project Structure
Custom-Pearl/
│
├── client/
│   ├── public/
│   ├── src/
│   │
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── config/
│   └── App.jsx
│
├── server/
│   ├── middleware/
│   ├── services/
│   ├── uploads/
│   ├── db.js
│   ├── firebase.js
│   ├── server.js
│   └── package.json
│
└── README.md
🚀 Getting Started
1 Clone Repository
Bash
git clone [https://github.com/abdulqadeersikandar-pixel/Custom-Pearl.git](https://github.com/abdulqadeersikandar-pixel/Custom-Pearl.git)
2 Move into Project
Bash
cd Custom-Pearl
3 Install Frontend
Bash
cd client

npm install
4 Install Backend
Bash
cd ../server

npm install
5 Start Backend
Bash
npm start
6 Start Frontend
Bash
npm run dev
⚙ Environment Variables
Server (.env)
Code snippet
PORT=5000

FIREBASE_PROJECT_ID=

FIREBASE_PRIVATE_KEY=

FIREBASE_CLIENT_EMAIL=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

JWT_SECRET=

EMAIL_USER=

EMAIL_PASS=
📡 REST API
Products
HTTP
GET /api/products
Get all products

HTTP
POST /api/products
Create Product

HTTP
PUT /api/products/:id
Update Product

HTTP
DELETE /api/products/:id
Delete Product

Checkout
HTTP
POST /api/checkout-orders
Place Checkout Order

HTTP
GET /api/checkout-orders
Admin Orders

HTTP
PUT /api/checkout-orders/:id/status
Update Checkout Status

Custom Orders
HTTP
POST /api/custom-orders
Create Custom Order

HTTP
GET /api/custom-orders
Get Custom Orders

HTTP
PUT /api/custom-orders/:id/status
Update Custom Order Status

Tracking
HTTP
GET /api/track/:trackingId
Track Customer Order

🔄 Database Migration
Initial Version
The first version of Custom Pearl was built using Microsoft SQL Server.

The database included:

Products

Customers

Checkout Orders

Custom Orders

Although SQL Server worked well during development, deploying it on free cloud hosting introduced additional complexity.

Migration to Firebase Firestore
To improve scalability and simplify deployment, the backend was migrated to Firebase Firestore.

The migration included:

Product Collection

Checkout Orders

Custom Orders

Tracking System

Authentication

Admin Dashboard

Why Firebase?
Cloud Hosted

No Database Server Required

Easy Deployment

Real-Time Updates

Better Scalability

Reduced Backend Complexity

Production Ready

🌍 Deployment
Frontend
Hosted on Netlify

Backend
Hosted on Render

Database
Hosted on Firebase Firestore

Media Storage
Hosted on Cloudinary

🔐 Security Features
Firebase Authentication

Protected Admin Routes

REST API Architecture

Environment Variables

Cloud Image Storage

Secure Admin Dashboard

📈 Future Improvements
Stripe Payments

JazzCash Integration

EasyPaisa Integration

Email Notifications

Customer Accounts

Wishlist

Product Reviews

Coupons

Inventory Analytics

Sales Dashboard

Admin Reports

Multi-language Support

🤝 Contributing
Contributions are always welcome.

If you would like to improve this project, feel free to

Fork the repository

Create a new feature branch

Commit your changes

Push your branch

Open a Pull Request

Example

Bash
git checkout -b feature/new-feature

git commit -m "Add new feature"

git push origin feature/new-feature
⭐ Roadmap
The following improvements are planned for future releases.

Version 2.0
Stripe Payment Gateway

JazzCash Integration

EasyPaisa Integration

Customer Login

Customer Dashboard

Wishlist

Product Reviews

Coupons

Discount System

Order Invoice PDF

Version 3.0
Email Notifications

SMS Notifications

Inventory Management

Analytics Dashboard

Sales Reports

AI Product Recommendation

Multiple Admin Roles

Multi-language Support

💻 Development Journey
Custom Pearl was developed in multiple stages.

Phase 1
UI Design

Product Pages

Shopping Cart

Phase 2
Checkout System

Admin Dashboard

Product Management

Phase 3
Custom Bag Builder

Tracking System

WhatsApp Integration

Instagram Confirmation

Phase 4
Database Migration

Microsoft SQL Server
            │
            ▼
 Firebase Firestore
This migration significantly simplified deployment while improving scalability and maintainability.

Phase 5
Deployment

Frontend → Netlify

Backend → Render

Images → Cloudinary

Database → Firebase

🏆 Project Achievements
✅ Full Stack Architecture

✅ Production Ready Backend

✅ Responsive User Interface

✅ Secure Admin Dashboard

✅ Cloud Database

✅ Cloud Image Storage

✅ Order Tracking

✅ Custom Product Builder

✅ REST API

✅ Firebase Authentication

✅ Firestore Database

✅ Cloudinary Uploads

✅ GitHub Version Control

📊 Project Statistics
Category	Details
Architecture	Full Stack
Frontend	React
Backend	Node.js + Express
Database	Firebase Firestore
Authentication	Firebase Auth
Storage	Cloudinary
Deployment	Netlify + Render
Version Control	Git & GitHub
Status	Production Ready
👨‍💻 Author
Abdul Qadeer Sikandar
Software Engineering Student

University of Gujrat

Full Stack Web Developer

Connect With Me
💼 LinkedIn: https://www.linkedin.com/in/abdulqadeersikandar

💻 GitHub: https://github.com/abdulqadeersikandar-pixel


🌟 Support
If you found this project useful,

please consider

⭐ Starring the repository

🍴 Forking the project

📢 Sharing it with others

Your support motivates further development.

📜 License
This project is licensed under the MIT License.

You are free to use, modify and distribute this project for educational purposes.

🙏 Acknowledgements
Special thanks to the technologies that made this project possible.

React

Node.js

Express.js

Firebase

Firestore

Firebase Authentication

Cloudinary

Tailwind CSS

Axios

Netlify

Render

⭐ Thank You for Visiting ⭐
If you like this project,

please consider giving it a ⭐ on GitHub.

Made with ❤️ by

Abdul Qadeer Sikandar
