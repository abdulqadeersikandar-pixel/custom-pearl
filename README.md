# Custom Pearl

Custom Pearl is a modern full-stack e-commerce platform developed for handcrafted pearl and crochet bags. The application enables customers to browse products, customize bag designs, place orders, track order status, and interact with an AI-powered customer support assistant.

The project follows a scalable client-server architecture using React for the frontend, Node.js and Express for the backend, Firebase Firestore for cloud database services, Firebase Authentication for secure user management, and Groq AI for intelligent customer support.

---

## Project Overview

Custom Pearl was built to provide a seamless online shopping experience for handcrafted fashion products while demonstrating modern full-stack web development practices.

The platform focuses on:

- Responsive user experience
- Product customization
- Secure authentication
- Cloud database integration
- AI-powered customer support
- Scalable architecture

---

## Key Features

### Customer

- User Registration & Login
- Firebase Authentication
- Browse Products
- Product Customization
- Shopping Cart
- Checkout
- Order Tracking
- Order History
- AI Customer Support Chatbot
- WhatsApp Support

### Administrator

- Admin Dashboard
- Product Management
- Order Management
- Customer Management

---

## Technology Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios

### Backend

- Node.js
- Express.js

### Database

- Firebase Firestore

### Authentication

- Firebase Authentication

### Artificial Intelligence

- Groq API

### Other Services

- WhatsApp Integration

---

## System Architecture

```
                React Frontend
                       │
                       ▼
             Node.js + Express API
                       │
      ┌────────────────┼────────────────┐
      ▼                ▼                ▼
Firebase Auth   Firebase Firestore    Groq AI
```

---

## Project Structure

```
Custom Pearl
│
├── backend
│   ├── services
│   ├── routes
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── custom-pearl
│   ├── public
│   ├── src
│   ├── package.json
│   └── vite.config.js
│
├── custom-pearl-preview.png
├── README.md
└── .gitignore
```

---

## Installation

Clone the repository.

```bash
git clone https://github.com/abdulqadeersikandar-pixel/custom-pearl.git
```

### Frontend

```bash
cd custom-pearl
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm start
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000

GROQ_API_KEY=YOUR_GROQ_API_KEY

FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
```

Never commit your `.env` file or API keys to GitHub.

---

## Database Migration

The initial version of Custom Pearl was developed using Microsoft SQL Server as the primary database.

To improve scalability, cloud deployment, and maintenance, the project was migrated to Firebase Firestore. The migration preserved the application's business logic while enabling a cloud-native architecture with simplified deployment and better integration with Firebase services.

---

## AI Customer Support

The integrated AI assistant provides:

- Frequently Asked Questions
- AI-generated customer support
- Roman Urdu & English responses
- WhatsApp fallback support
- Fast response generation using Groq AI

---

## Future Improvements

- Online Payment Gateway Integration
- Email Notifications
- Product Reviews & Ratings
- Wishlist
- Admin Analytics Dashboard
- AI Product Recommendations
- Multi-language Support

---

## Preview

Project screenshots will be added in future updates.

---

## Development Status

Current Version: Phase 2

Completed

- Firebase Authentication
- Firebase Firestore Migration
- Product Customization
- Shopping Cart
- Order Tracking
- AI Chatbot
- WhatsApp Integration

Planned

- Online Payments
- Analytics Dashboard
- Email Notifications
- Product Reviews

---

## Author

**Abdul Qadeer Sikandar**

BS Software Engineering  
University of Gujrat

GitHub

https://github.com/abdulqadeersikandar-pixel

LinkedIn

https://www.linkedin.com/in/abdulqadeersikandar


---

## License

This project is released under the MIT License.