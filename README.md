# 🛠️ Service Desk Ticketing System

A modern, full-featured **Service Desk Ticketing System** built with **React**, **Firebase**, and **Razorpay** integration. This full-stack web application allows users to create support tickets with different priority levels, make secure payments for premium support, and track real-time ticket progress.

---

## 🎯 Project Overview

This application is designed to streamline customer support through a powerful dual-role system:

- 🧑‍💻 **Regular Users:** Submit support tickets, track ticket progress, communicate with admins, and pay for priority support.
- 👨‍💼 **Admins:** Manage tickets, assign agents, update statuses, and monitor activity across the platform.

---

## 🏗️ Architecture & Technology Stack

### 🔹 Frontend
- **React 18** (with Hooks & Functional Components)
- **Tailwind CSS** for responsive UI
- **React Router DOM** for navigation
- **Vite** as the build tool for lightning-fast dev environment
- **JavaScript (ES6+)**

### 🔹 Backend & Services
- **Firebase Authentication** – Secure user login & session management
- **Cloud Firestore** – Real-time NoSQL database for tickets & comments
- **Razorpay Gateway** – Priority-based secure payment system

---
 Application Screenshots

### Userpage
![Userpage](https://github.com/adityachandra512/ServiceDA/blob/master/src/assets/images/Screenshot%20(28).png)

### Tickets page
![Tickets](https://github.com/adityachandra512/ServiceDA/blob/master/src/assets/images/Screenshot%20(29).png)

### Admin Dashboard
![Admin Dashboard](https://github.com/adityachandra512/ServiceDA/blob/master/src/assets/images/Screenshot%20(32).png)

![Admin Managament](https://github.com/adityachandra512/ServiceDA/blob/master/src/assets/images/Screenshot%20(33).png)

###  Tickets Generator
![Form](https://github.com/adityachandra512/ServiceDA/blob/master/src/assets/images/Screenshot%20(30).png)

![Payment Gateway](https://github.com/adityachandra512/ServiceDA/blob/master/src/assets/images/Screenshot%20(31).png)


## 🚀 Core Features

### 1️⃣ Dual-Role System
- **Regular Users:**  
  - Submit new tickets (title, description, category, priority)
  - Pay based on ticket priority
  - View and track ticket status & history
  - Add comments and view admin responses

- **Admins:**  
  - View & filter all tickets  
  - Assign tickets to support agents  
  - Change ticket status: `Open → In Progress → Resolved`  
  - Internal notes, admin-only comments  

### 2️⃣ Authentication
- Firebase-secured login/register
- Role-based access control (admin emails: `admin@servicedesk.com`, `aditya@admin.com`, etc.)
- Protected routing with session management

### 3️⃣ Ticket Management Workflow
- Real-time ticket creation, update, and tracking
- Comments between users and admins
- Admin dashboard with filters and assignment options

### 4️⃣ Payment Integration
- Razorpay integration with priority-based pricing:
  - 🟢 Low: ₹99 (48-hour response)
  - 🟡 Medium: ₹199 (24-hour response)
  - 🟠 High: ₹299 (4-hour response)
  - 🔴 Urgent: ₹499 (1-hour response)
- Secure payment flow with test mode support
- Transaction tracking and payment history

### 5️⃣ Real-time Features
- Live updates on ticket status and comments
- Comment threading with timestamps
- Dashboard statistics (active tickets, resolved, etc.)
- Audit logs and activity records

---

## 📊 Application Flow

### 🔸 User Journey
1. Register/Login (Firebase Auth)
2. Create Ticket → Select priority → Make Payment (Razorpay)
3. Track progress & communicate via threaded comments

### 🔸 Admin Journey
1. Admin Login → Admin Panel
2. View, assign & manage tickets
3. Monitor all activities and respond in real time

---

## 🎨 UI/UX Highlights

- Gradient backgrounds, hover effects, and animated transitions
- Responsive design for mobile, tablet, and desktop
- Card-based layouts with color-coded statuses
- Seamless payment flow integration
- Role-based dynamic navigation (admin/user)

---

## 📁 Component Architecture

```

/components
├── Auth/         # Login, Register
├── Dashboard/    # User dashboard with ticket statistics
├── Tickets/      # TicketList, TicketDetail, CreateTicket
├── Admin/        # AdminPanel and management views
└── Layout/       # Navbar, AdminNavbar, etc.

````

---

## 🔐 Security & Payment Implementation

### ✅ Current Demo Setup
- Razorpay frontend integration with test keys
- Basic payment verification

### 🔒 For Production
- Razorpay **Order API** integration
- Secure **Webhook** verification
- Backend-encrypted payment validation

---

## 📌 Data Models

### 🎟️ Ticket
```json
{
  "userId": "uid123",
  "title": "Bug in login",
  "description": "App crashes on login",
  "priority": "High",
  "status": "Open",
  "paymentStatus": "Success",
  "createdAt": "timestamp"
}
````

### 💬 Comment

```json
{
  "ticketId": "ticket123",
  "sender": "admin/user",
  "message": "We're looking into this issue.",
  "timestamp": "timestamp"
}
```

### 📜 Activity Log

```json
{
  "ticketId": "ticket123",
  "action": "Status changed to In Progress",
  "timestamp": "timestamp"
}
```

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/adityachandra512/ServiceDA
cd ServiceDA
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

* Create a Firebase project
* Add your Firebase config in `firebase.js`

### 4. Razorpay Integration (Test Mode)

* Use test keys from [Razorpay Dashboard](https://razorpay.com)

### 5. Run Locally

```bash
npm run dev
```

---

## 🌐 Deployment

* Easily deploy on **Vercel**, **Firebase Hosting**, or **Netlify**
* Ensure secure handling of Razorpay webhook in production
* Add environment variables for Firebase & Razorpay credentials

---

## 📌 Future Improvements

* Backend for secure Razorpay payment verification
* Agent management dashboard
* Email notifications on ticket updates
* Ticket file attachments

---

## 🧑‍💻 Developer

**Aditya Chandan**
📧 [adityachandra419@gmail.com](mailto:adityachandra419@gmail.com)
🔗 [LinkedIn](https://www.linkedin.com/in/aditya-ch/) | [Portfolio](https://adityachport.tech/) | [GitHub](https://github.com/adityachandra512)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
