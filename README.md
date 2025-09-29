# 🏨 Wild Wave Smart Hotel Management System
A full‑stack, AI‑powered hotel management platform that combines **Node/Express**, **React 19 + Vite**, **MongoDB**, Machine‑Learning micro‑services and **IoT** hardware to deliver contact‑less check‑in, smart‑room automation and dynamic pricing for **Wild Waves Kumana Safari Surf Resort**.

---

## ✨ Core Features
| Area | Feature |
|------|---------|
| **Guest** | 🔐 Face‑recognition room access • 🌡️ AC & 💡 Light control via phone • 🍽️ In‑room food ordering |
| **Admin** | 📊 Real‑time guest & room dashboards • 🏷️ Dynamic pricing engine • 👥 Role & sub‑user management |
| **AI / ML** | CNN‑based face recognition • LSTM/ARIMA/Random Forest for revenue‑optimised room pricing |
| **IoT** | ESP32‑powered door locks (solenoid + RFID backup), IR‑blaster AC control, relay‑driven lighting |

---

## 🖥️ Tech Stack

### Frontend _(📁 `frontend/`)_
- React 19, Vite 6, React Router 7  
- Tailwind CSS 4 + Material‑Tailwind, Heroicons & React‑Icons  
- Axios, jwt‑decode  
- ESLint, Prettier

### Backend _(📁 `backend/`)_
- Node.js 18+, Express 5.1  
- MongoDB 7 + Mongoose 8.15  
- JWT, bcryptjs, cors, dotenv, nodemon

### Machine Learning _(📁 `ml-services/`)_  <!-- hypothetical folder -->
- Python 3.11, TensorFlow, scikit‑learn, OpenCV  
- REST &/or MQTT bridges to Node API

### Hardware / Firmware _(📁 `firmware/`)_  
- ESP32, Arduino C++, MQTT

---

## 📁 Repository Structure

```text
Wild-Waves-Internal/
├── backend/           # Node / Express API
│   ├── server.js
│   └── package.json
├── frontend/          # React + Vite web app
│   ├── vite.config.js
│   └── package.json
├── ml-services/       # Python ML micro-services (models & endpoints)
│   ├── app.py
│   └── requirements.txt
├── firmware/          # ESP32 sketches and Arduino code
│   └── (your .ino/.cpp files)
└── Readme.md          # ← you are here
```

---

## ⚙️ Prerequisites
- **Node.js** ≥ 18.x & **npm** ≥ 9  
- **MongoDB** instance (local or Atlas)  
- **Python** ≥ 3.10 (for ML services)  
- **ESP32** boards & sensors (for IoT layer)  

---

## 🔧 Local Installation

### 1. Clone the repo
```bash
git clone https://github.com/chathuradissanayake/Wild-Waves-Internal.git
cd Wild-Waves-Internal
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env        # or create manually
# .env keys
# PORT=5000
# MONGO_URI=your_mongodb_uri
# JWT_SECRET=super_secret_key

npm start                   # launches nodemon on http://localhost:5000
```

### 3. Frontend Setup (new terminal)
```bash
cd frontend
npm install

# Frontend env file
echo "VITE_API_BASE_URL=/api" > .env

npm run dev                # opens Vite dev server on http://localhost:5173
```

### 4. (Optional) ML Services
```bash
cd ml-services
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py              # serves ML endpoints on http://localhost:8000
```

---

## 🧪 Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| `backend/` | `npm start` | Start API with nodemon |
| | `npm test` | (add Jest tests) |
| `frontend/` | `npm run dev` | Vite dev server |
| | `npm run build` | Production build to `dist/` |
| | `npm run preview` | Preview prod build |
| `ml-services/` | `pytest` | Unit tests for ML models |

---

## 🌍 Deployment

| Layer | Suggestion |
|-------|------------|
| **Backend** | Render, Railway, DigitalOcean, or Docker on VPS |
| **Frontend** | Vercel, Netlify, or static bucket |
| **Database** | MongoDB Atlas cluster |
| **ML** | GPU VM, AWS SageMaker, or containerised micro‑service |
| **CI/CD** | GitHub Actions → Docker build / push → host |

---

## 📜 License
[MIT](LICENSE)

---

## 👥 Authors
- D.K.R.C.K. Dissanayake  
- W.M.N.S. Weerasekara  
- L.W.S.T. Weerasinghe  
- W.D.M. Wickramage  

> Final‑year undergraduate project – Department of Electrical & Information Engineering, **University of Ruhuna**, Sri Lanka
