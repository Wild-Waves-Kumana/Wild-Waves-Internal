# 💻 Frontend – Smart Hotel Management System

This is the frontend of the **Smart Hotel Management System with Integrated Machine Learning and IoT**, built using **React 19**, **Vite**, and **Tailwind CSS**. It offers web-based interfaces for both hotel guests and administrators with responsive design and role-based features.

---

## 🌐 Live Preview

_Deploy your project on platforms like Vercel or Netlify and add the link here._

---

## ✨ Features

### 👤 Guest Panel
- 🔐 Face recognition login (via backend API)
- 🌡️ IoT-powered room controls for AC (IR blaster) and lights (relay switches)
- 🍽️ Mobile-responsive food ordering system
- 📱 Web-based interface – no app installation required

### 🛠 Admin Panel
- 📊 Real-time room access tracking
- 🧑‍💼 User and sub-user management
- 🏷️ AI-based Dynamic Pricing dashboard
- 🏨 Room access control and food order management

---

## 🛠 Tech Stack

- **React 19**
- **Vite** – fast dev server & build tool
- **Tailwind CSS 4** + Material Tailwind
- **React Router v7** – for routing
- **Axios** – for HTTP requests
- **jwt-decode** – for handling JWTs
- **Heroicons & React Icons** – for UI icons

---

## 📦 Installation

### ⚙️ Prerequisites
- Node.js ≥ 18.x
- Backend server running on `http://localhost:5000` (or your configured URL)

### 🚀 Steps

```bash
# Clone the project
git clone https://github.com/your-username/shms-frontend.git
cd shms-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

## 🧾 Project Structure

```bash
src/
├── components/        # Reusable UI components
├── pages/             # Route pages (Dashboard, Login, Admin, etc.)
├── context/           # Auth context & role-based access
├── hooks/             # Custom hooks
├── assets/            # Images and static files
├── App.jsx            # Main app entry
├── main.jsx           # Renders the app
└── index.css          # TailwindCSS & base styles
```

---

## 📋 Environment Variables

Create a `.env` file at the root of your frontend folder:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Make sure this matches your backend's base URL.

---

## 🧪 Testing

_Not included yet, but the following are recommended:_
- **React Testing Library** for component tests
- **Cypress** or **Playwright** for end-to-end tests

---

## 📦 Build for Production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **D.K.R.C.K. Dissanayake**
- **W.M.N.S. Weerasekara**
- **L.W.S.T. Weerasinghe**
- **W.D.M. Wickramage**

> University of Ruhuna – Department of Electrical and Information Engineering
