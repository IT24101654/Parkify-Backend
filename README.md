# 🚗 Parkify - Smart Parking & Service Management System

Parkify is a comprehensive full-stack mobile application designed to streamline parking space management, reservations, and vehicle service center operations. This project is developed as part of the **Web and Mobile Technologies (SE2020)** group assignment at SLIIT.

## 🚀 Tech Stack

- **Frontend:** React Native (Expo)
- **Backend:** Node.js & Express.js
- **Database:** MongoDB (Atlas)
- **Authentication:** JWT (JSON Web Tokens) with Bcryptjs Password Hashing
- **Hosting:** Deployed on Render / Railway

## 📋 Core System Requirements
* [cite_start]**User Authentication:** Secure Registration and Login system[cite: 18, 19, 20].
* [cite_start]**Data Security:** Implementation of Password hashing and JWT-based protected routes[cite: 21, 22, 23].
* [cite_start]**Cloud Hosting:** Backend hosted online to ensure real-time mobile app interaction[cite: 27, 28].
* [cite_start]**RESTful API:** Properly structured controllers, routes, and middleware[cite: 49, 50, 51].

## 👥 Team Members & Responsibilities

| Registration Number | Student Name | Assigned Module |
| :--- | :--- | :--- |
| **IT24101654** | **HASARINDA W.D.Y.L.** | **User Management + AI Assistant** |
| IT24102636 | DISSANAYAKE R.P.Y.R. | Parking Place Management |
| IT24101671 | MUNTHAS F.M. | Reservation Management |
| IT24101820 | VIKIRUTHAN P. | Payment Management |
| IT24100902 | CHANDANAYAKE M.W.H.A. | Inventory Management |
| IT24100036 | SURENTHIRAN K. | Vehicle Service Center Management |

## 🛠️ Module Breakdown

### 1. User Management + AI Assistant (Lead: IT24101654)
- [cite_start]**Authentication:** Core login and registration API using JWT[cite: 34, 35].
- [cite_start]**Security:** Implementation of password hashing and route protection[cite: 36, 37].
- **AI Integration:** Smart chatbot/assistant integration for user support and profile management.

### 2. Parking Place Management (Lead: IT24102636)
- [cite_start]**CRUD:** Full management (Add/Update/Delete) of parking locations and slots.
- [cite_start]**Media:** Image upload functionality for parking areas using Multer[cite: 40].

### 3. Reservation Management (Lead: IT24101671)
- **Booking:** Backend logic for reserving parking slots and tracking history.
- **Integration:** Ensuring real-time updates on slot availability upon reservation.

### 4. Payment Management (Lead: IT24101820)
- **Transactions:** Handling secure payment details and financial transaction records.
- **Reporting:** Generating digital invoices and maintaining transaction history.

### 5. Inventory Management (Lead: IT24100902)
- **Stock Tracking:** Managing spare parts, oil, and service tools for the service center.
- **CRUD:** Adding, updating, and removing inventory items from the database.

### 6. Vehicle Service Center Management (Lead: IT24100036)
- **Schedules:** Appointment booking for vehicle services like car washes and repairs.
- **Management:** Tracking service status and labor task allocation.

## ⚙️ Project Structure
```text
├── config/         # Database connection and environment variables
├── controllers/    # Business logic for each module (CRUD)
├── middleware/     # Auth (JWT) and error handling middleware
├── models/         # MongoDB Schemas for each entity
├── routes/         # API Endpoint definitions
├── utils/          # Helper functions (hashing, JWT helpers)
└── index.js        # Main entry point of the server
