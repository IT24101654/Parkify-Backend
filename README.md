# 🚗 Parkify - Smart Parking & Service Management System

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20Native-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=nodedotjs" />
  <img src="https://img.shields.io/badge/Framework-Express.js-black?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/Database-MongoDB-brightgreen?style=for-the-badge&logo=mongodb" />
</p>

---

## 📌 Project Overview
[cite_start]The **Parkify** system is a full-stack mobile solution developed to modernize parking space discovery, booking, and vehicle service management.[cite: 10, 11]. [cite_start]Originally conceptualized as a web application, this version is specifically engineered for mobile platforms using the **MERN** (React Native focus) stack for the **Web and Mobile Technologies (SE2020)** assignment.[cite: 5, 12].

---

## 🎯 Objectives
- **Efficiency:** Reduce time spent searching for parking spots.
- **Real-time Access:** Provide live updates on slot availability.
- [cite_start]**Convenience:** Enable easy mobile-based reservations and payments.[cite: 41].
- **Service Integration:** Manage vehicle service center appointments alongside parking.

---

## 🛠️ Technology Stack
| Category | Technology |
|----------|------------|
| **Frontend** | [cite_start]React Native (Expo) [cite: 12] |
| **Backend** | [cite_start]Node.js + Express.js [cite: 13] |
| **Database** | [cite_start]MongoDB (Atlas) [cite: 14] |
| **Auth** | [cite_start]JWT with Password Hashing (Bcrypt) [cite: 21, 22] |
| **Hosting** | [cite_start]Deployed on Render/Railway [cite: 15, 27] |

---

## 👥 Team Members & Responsibilities
[cite_start]Each member is responsible for a complete module, including **Full CRUD backend**, **Mobile UI**, and **API integration**.[cite: 31, 32, 38, 39, 41].

| Registration Number | Student Name | Assigned Module |
| :--- | :--- | :--- |
| **IT24101654** | **HASARINDA W.D.Y.L. (Leader)** | **User Management + AI Assistant** |
| IT24102636 | DISSANAYAKE R.P.Y.R. | Parking Place Management |
| IT24101671 | MUNTHAS F.M. | Reservation Management |
| IT24101820 | VIKIRUTHAN P. | Payment Management |
| IT24100902 | CHANDANAYAKE M.W.H.A. | Inventory Management |
| IT24100036 | SURENTHIRAN K. | Vehicle Service Center Management |

---

## ⚙️ Core System Modules

### 1. User Management & AI (Member 3 - Leader)
- [cite_start]**Auth:** Registration and Login with JWT authentication.[cite: 19, 20, 22, 34, 35].
- [cite_start]**Security:** Bcrypt password hashing and protected routes.[cite: 21, 23, 36, 37].
- **AI:** Integrated Chatbot for user guidance and profile support.

### 2. Parking Place Management (Member 1)
- [cite_start]**Control:** CRUD operations for parking facilities and slots.[cite: 39].
- [cite_start]**Media:** Image uploads for parking locations using Multer.[cite: 40, 151, 152].

### 3. Reservation Management (Member 2)
- [cite_start]**Booking:** Logic for driver-based slot reservations.[cite: 121].
- [cite_start]**History:** Tracking past and upcoming booking details.[cite: 122].

### 4. Payment Management (Member 4)
- **Billing:** Secure transaction record management.
- **Reporting:** Generation of digital transaction histories.

### 5. Inventory Management (Member 5)
- **Supplies:** Management of service center tools and spare parts.
- **Tracking:** Real-time stock updates for oil, parts, and equipment.

### 6. Service Center Management (Member 6)
- **Appointments:** Scheduling for vehicle repairs and car washes.
- [cite_start]**Deployment:** Responsibility for server hosting and cloud database connection.[cite: 158, 159, 161].

---

## 📂 Project Structure (Backend)
```text
├── config/         # Database and Environment config [cite: 50]
├── controllers/    # Module-specific logic [cite: 43, 50]
├── middleware/     # Auth & Error handling [cite: 51]
├── models/         # MongoDB Schemas [cite: 66]
├── routes/         # API Endpoints (RESTful) [cite: 42, 49, 50]
├── utils/          # Helper functions (JWT, Hashing)
└── index.js        # Server entry point
