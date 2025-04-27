# EasyQueue 🍽️

EasyQueue is a full-stack web-based restaurant queue management system built using **React.js**, **Node.js**, **Express.js**, and **Firebase Firestore**. It helps restaurants efficiently manage customer waitlists, provide live queue updates, send SMS notifications, and offer menu browsing before seating.

---

## 🚀 Features

### ✅ Restaurant Management
- Restaurant Registration with logo upload and max seat configuration
- Login for restaurant managers
- Settings dashboard for updating name, logo, and max seats
- Analytics dashboard for queue data insights

### ✅ Queue Management
- Join queue via QR code or link
- Real-time queue position tracking
- Take a Step Back (push oneself back in queue)
- Leave queue
- Edit seat count
- SMS notifications for join, seat, remove, re-add

### ✅ Menu System
- Admin Menu Dashboard to add/delete food items
- Public Menu Browser to view categories and items

### ✅ QR Code Support
- Generate, print, save, and share restaurant QR codes

---

## 🛠️ Tech Stack

| Layer        | Tech Stack                 |
|-------------|----------------------------|
| Frontend     | React.js, TailwindCSS     |
| Backend      | Node.js, Express.js       |
| Database     | Firebase Firestore        |
| Authentication | Custom email + password login |
| File Uploads | Multer for logo uploads   |
| SMS Gateway  | Twilio (via `sendSms.js`) |
| QR Generation| `qrcode` NPM package      |

---

## ⚙️ Setup Instructions

### 📦 Prerequisites
- Node.js v18+
- Firebase project with Firestore enabled
- Twilio account (for SMS)

### 🔧 Backend Setup
```bash
cd server
npm install
touch .env
```

### Starting the Backend
```bash
node index.js
```

## 💻 Frontend Setup
```bash
cd client
npm install
npm start
```

## 📱 API Endpoints
### Restaurant Routes
- POST /api/restaurants – Register
- POST /api/restaurants/login – Login
- PATCH /api/restaurants/:id/logo – Update logo
- PATCH /api/restaurants/:id – Update name and seats
- PATCH /api/restaurants/:id/qr – Update QR code

### Queue Routes
- POST /api/queues – Join queue
- PATCH /api/queues/:id – Update seat count
- PATCH /api/queues/:id/status – Change status
- PATCH /api/queues/step-back – Take a Step Back
- DELETE /api/queues/:id – Leave queue
- GET /api/queues/restaurant/:id – Get queue by restaurant

### Menu Routes
- POST /api/menu – Add item
- GET /api/menu/restaurant/:id – Get items
- DELETE /api/menu/:id – Delete item