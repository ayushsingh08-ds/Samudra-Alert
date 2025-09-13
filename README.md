# 🌊 Samudra Alert – Coastal Hazard Reporting Platform  

## 📌 Overview  
Samudra Suraksha is an **integrated platform** for **citizen-powered ocean hazard reporting and social media analytics**, built for **Smart India Hackathon 2025**.  

The system empowers **coastal residents** to report hazards via a mobile app or chatbot (text, photo, video, GPS), which are then processed by the backend, analyzed using AI/NLP, and displayed on a **real-time dashboard** for analysts and officials. Verified alerts are pushed back to citizens, ensuring a **closed feedback loop**.  

---

## 🚀 Project Flow  

### 1️⃣ Citizen Side (Mobile App / Telegram Bot)  
- Citizens submit hazard reports (text, photo, video, voice).  
- Reports are automatically **geo-tagged** (GPS).  
- Works **offline-first**: data is stored locally and synced when online.  
- Citizens receive **alerts and report status updates** (Pending → Verified → Used).  

### 2️⃣ Backend & Processing  
- **Node.js + Express API** handles all requests.  
- **PostgreSQL + PostGIS** stores reports & geospatial data.  
- **NLP Engine (Hugging Face)** classifies hazard type & analyzes sentiment.  
- **Clustering** identifies hotspots of hazards.  
- Integrates with **official INCOIS bulletins** for validation (future scope).  

### 3️⃣ Analyst Dashboard (Web App)  
- Built in **React.js + Leaflet.js**.  
- Displays citizen + social media reports on an **interactive map**.  
- Analysts can **filter, validate, and cluster reports**.  
- Provides charts, stats, and trend analysis.  

### 4️⃣ Admin Panel  
- Officials manage **users, reports, and alerts**.  
- Approve verified hazards → trigger **public alerts**.  
- Escalate to **disaster management authorities** if needed.  

### 5️⃣ Alert & Feedback Loop  
- Citizens get **push notifications/Telegram broadcasts** for verified alerts.  
- Multilingual support (English + regional languages).  
- Status updates build **trust and transparency**.  

---

## 📂 File Structure  

```
ocean-hazard-platform/
│
├── frontend/                     # React (Citizen + Dashboard)
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── api/                  # API calls to backend
│   │   ├── components/           # Reusable UI (cards, map, charts)
│   │   ├── context/              # Global state (Auth, Alerts, Reports)
│   │   ├── hooks/                # Custom hooks (auth, offline sync)
│   │   ├── layouts/              # Citizen & Admin layouts
│   │   ├── pages/                # Citizen / Analyst / Admin pages
│   │   ├── store/                # Redux/Zustand slices (optional)
│   │   ├── styles/               # Tailwind + custom CSS
│   │   ├── utils/                # Helpers (geoUtils, validators)
│   │   ├── App.jsx               # Routes + providers
│   │   ├── main.jsx              # React entry point
│   │   └── routes.js             # Centralized routes
│   └── package.json
│
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── config/               # DB, environment configs
│   │   ├── controllers/          # Business logic (Reports, Alerts, Auth)
│   │   ├── middleware/           # JWT Auth, role-based access
│   │   ├── models/               # Database models (PostgreSQL + PostGIS)
│   │   ├── routes/               # API routes
│   │   ├── services/             # External APIs (Firebase, Hugging Face)
│   │   ├── utils/                # Helpers (clustering, validators)
│   │   └── app.js                # Express app setup
│   ├── package.json
│   └── .env                      # Environment variables
│
├── docs/                         # Docs, diagrams, PPT assets
│   └── architecture.png
│
└── README.md                     # Root project overview
```

---

## 🛠️ Tech Stack  

**Frontend**  
- React.js (Dashboard & Admin)  
- Flutter (Mobile App – future)  
- Leaflet.js (Maps), Chart.js (Visualizations)  
- TailwindCSS + shadcn/ui  

**Backend**  
- Node.js + Express.js (REST APIs)  
- PostgreSQL + PostGIS (Geo-data storage)  
- Firebase / Cloudinary (Media storage)  
- Hugging Face (NLP models for classification, sentiment)  

**Notifications**  
- Firebase Cloud Messaging (Push alerts)  
- Telegram Bot API (2-way reporting & alerts)  

**Hosting**  
- Vercel (Frontend), Render/Heroku (Backend), Firebase (Storage/Notifications)  

---

## 🌟 Unique Value Propositions  
- **Offline-first with sync & mesh fallback** → reports even in dead zones.  
- **Multilingual & voice support** → accessible for Indian coastal communities.  
- **Role-based dashboards** → Citizens, Analysts, and Officials get relevant access.  
- **Crowdsourced + social media fusion** → better situational awareness.  
- **Feedback loop** → citizens see their reports verified, building trust.  
