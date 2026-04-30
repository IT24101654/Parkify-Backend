# 🚗 Parkify - Smart Parking & Service Management System

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20Native-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=nodedotjs" />
  <img src="https://img.shields.io/badge/Framework-Express.js-black?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/Database-MongoDB-brightgreen?style=for-the-badge&logo=mongodb" />
</p>

---

## 📌 Project Overview

**Parkify** is a full-stack smart parking and vehicle service management system designed to modernize parking space discovery, booking, payments, and vehicle service operations.

It is developed using the **MERN-style architecture (React Native + Node.js + Express + MongoDB)** and is optimized for mobile-first usage.

---

## 🎯 Objectives

* 🚗 Reduce time spent searching for parking spaces
* 📡 Provide real-time parking slot availability
* 📱 Enable mobile-based booking and payments
* 🧭 Improve navigation using map integration
* 🔧 Integrate vehicle service management features

---

## 🛠️ Technology Stack

| Category       | Technology              |
| -------------- | ----------------------- |
| Frontend       | React Native (Expo)     |
| Backend        | Node.js + Express.js    |
| Database       | MongoDB (Atlas / Local) |
| Authentication | JWT + bcrypt            |
| Scheduler      | node-cron               |
| API Testing    | Postman                 |
| Tools          | Git, GitHub, VS Code    |
| Deployment     | Render / Railway        |

---

## 👥 Team Members & Responsibilities

Each member is responsible for a complete module including backend APIs, mobile UI, and integration.

| Registration Number | Student Name                | Assigned Module                   |
| ------------------- | --------------------------- | --------------------------------- |
| IT24101654          | HASARINDA W.D.Y.L. (Leader) | User Management + AI Assistant    |
| IT24102636          | DISSANAYAKE R.P.Y.R.        | Parking Place Management          |
| IT24101671          | MUNTHAS F.M.                | Reservation Management            |
| IT24101820          | VIKIRUTHAN P.               | Payment Management                |
| IT24100902          | CHANDANAYAKE M.W.H.A.       | Inventory Management              |
| IT24100036          | SURENTHIRAN K.              | Vehicle Service Center Management |

---

## ⚙️ System Modules

### 1️⃣ User Management & AI Assistant

* User registration and login system
* JWT-based authentication
* Password hashing using bcrypt
* AI chatbot assistant for user support

---

### 2️⃣ Parking Place Management

* Create, update, delete parking locations
* Manage parking slots
* Image upload support for locations

---

### 3️⃣ Reservation Management

**Developer:** MUNTHAS F.M. (IT24101671)

#### 🚗 Driver Capabilities

| Action | Description |
| ------ | ----------- |
| **Create** | Book a parking slot — reservation is auto-confirmed instantly |
| **Read** | View all reservations, active bookings, and full booking history |
| **Update** | Extend booking duration or switch to a different parking location |
| **Delete** | Cancel a reservation (with optional cancellation reason) |

#### 🏢 Parking Owner Capabilities

| Action | Description |
| ------ | ----------- |
| **Create** | Add new parking locations with full details (slots, pricing, hours, amenities) |
| **Read** | View all owned locations and their real-time reservation details |
| **Update** | Modify slot count, pricing, operating hours, amenities, or active status |
| **Delete** | Remove a parking location (blocked if active reservations exist) |

#### ⚙️ Auto Status Progression

Reservation statuses automatically advance without any manual action:

```
CONFIRMED  ──(startTime reached)──▶  ACTIVE  ──(endTime reached)──▶  COMPLETED
    │
    └──(driver cancels)──▶  CANCELLED
```

* Status transitions are handled by a **background cron job** (runs every minute)
* `availableSlots` is **decremented** when confirmed, **incremented** when cancelled or completed

#### 📡 API Endpoints

**Parking Locations** — Base URL: `/api/parking-locations`

| Method | Endpoint | Role | Description |
| ------ | -------- | ---- | ----------- |
| `POST` | `/` | PARKING_OWNER | Create a new parking location |
| `GET` | `/` | Any (authenticated) | Browse all active parking locations |
| `GET` | `/my` | PARKING_OWNER | Get all my parking locations |
| `GET` | `/:id` | Any (authenticated) | Get a single location's details |
| `PUT` | `/:id` | PARKING_OWNER | Update a parking location |
| `DELETE` | `/:id` | PARKING_OWNER | Delete a parking location |
| `GET` | `/:id/reservations` | PARKING_OWNER | View all reservations at my location |

**Reservations** — Base URL: `/api/reservations`

| Method | Endpoint | Role | Description |
| ------ | -------- | ---- | ----------- |
| `POST` | `/` | DRIVER | Create and confirm a reservation |
| `GET` | `/` | DRIVER | Get all reservations (full history) |
| `GET` | `/active` | DRIVER | Get active (CONFIRMED + ACTIVE) reservations |
| `GET` | `/history` | DRIVER | Get completed and cancelled reservations |
| `GET` | `/:id` | DRIVER | Get a single reservation's full details |
| `PUT` | `/:id` | DRIVER | Extend duration or change parking location |
| `DELETE` | `/:id` | DRIVER | Cancel a reservation |

#### 🗄️ Database Schemas

**ParkingLocation**
```
{
  name, address, city, latitude, longitude, description,
  totalSlots, availableSlots, pricePerHour,
  operatingHours: { open, close },
  amenities: [],
  isActive,
  owner → User
}
```

**Reservation**
```
{
  driver → User,
  vehicle → Vehicle,
  parkingLocation → ParkingLocation,
  startTime, endTime, totalAmount,
  status: PENDING | CONFIRMED | ACTIVE | COMPLETED | CANCELLED,
  cancelledAt, cancellationReason
}
```

---

### 4️⃣ Payment Management

* Secure transaction handling
* Payment history tracking
* Invoice generation

---

### 5️⃣ Inventory Management

* Manage spare parts and supplies
* Track stock availability
* Update inventory records

---

### 6️⃣ Vehicle Service Center Management

* Service appointment scheduling
* Maintenance tracking
* Service history records

---

## 📱 Mobile Application Features

* Secure login & registration system
* Real-time API integration
* Dynamic UI (no hardcoded data)
* Smooth navigation between modules
* Form validation for better UX
* AI assistant integration

---

## 🏗️ Backend Architecture

```
Parkify-Backend/
 ├── config/
 │   └── db.js                        # MongoDB connection
 ├── controllers/
 │   ├── authController.js            # Registration, Login, OTP, Password Reset
 │   ├── notificationController.js    # Admin notifications
 │   ├── vehicleController.js         # Vehicle CRUD
 │   ├── parkingLocationController.js # Parking location CRUD (Module 3)
 │   └── reservationController.js     # Reservation CRUD (Module 3)
 ├── middleware/
 │   ├── authMiddleware.js            # JWT protect + role authorize
 │   └── validateReservation.js       # Request body validation (Module 3)
 ├── models/
 │   ├── User.js                      # User schema (3 roles)
 │   ├── Vehicle.js                   # Vehicle schema
 │   ├── Notification.js              # Admin notification schema
 │   ├── Otp.js                       # OTP schema (auto-expire)
 │   ├── PendingUser.js               # Temp user before OTP verify
 │   ├── ParkingLocation.js           # Parking location schema (Module 3)
 │   └── Reservation.js               # Reservation schema (Module 3)
 ├── routes/
 │   ├── authRoutes.js                # /api/auth/*
 │   ├── notificationRoutes.js        # /api/notifications/*
 │   ├── vehicleRoutes.js             # /api/vehicles/*
 │   ├── parkingLocationRoutes.js     # /api/parking-locations/* (Module 3)
 │   └── reservationRoutes.js         # /api/reservations/* (Module 3)
 ├── utils/
 │   ├── emailService.js              # Nodemailer email sender
 │   ├── seeder.js                    # Super admin seeder
 │   └── reservationScheduler.js      # Cron auto-status progression (Module 3)
 ├── uploads/
 │   └── vehicle-docs/                # Multer upload destination
 └── index.js                         # Server entry point
```

---

## 🔐 Authentication Flow

* User registers → password encrypted (bcrypt)
* Login request → JWT token generated
* Protected routes → JWT middleware validation

---

## 🚀 Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/parkify.git
cd parkify
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Start Backend Server

```bash
npm run dev
```

Server runs at:

```
http://localhost:5000
```

### 4️⃣ Run Mobile App

```bash
npx expo start
```

Scan QR code using **Expo Go** app.

---

## 🗄️ Database Setup (MongoDB)

```js
mongoose.connect("mongodb://localhost:27017/parkify");
```

Or use MongoDB Atlas cloud database for production.

---

## 📊 Future Enhancements

* 📱 Native Android/iOS builds
* 🔔 Real-time notifications
* 📍 Live slot tracking system
* 🤖 AI-based parking prediction
* 💳 Payment gateway integration (Stripe)
* 📷 Camera-based parking detection

---

## 🎓 Academic Information

Faculty of Computing - SLIIT 2026

---

## ⭐ Support

If you like this project:

* ⭐ Star this repository
* 🍴 Fork and contribute

---

## 📄 License

This project is developed for **academic purposes only**.
