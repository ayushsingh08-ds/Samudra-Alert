# 🌊 Samudra Alert - Coastal Hazard Early Warning System

A comprehensive early warning system for coastal hazards in India, leveraging crowdsourced data, AI verification, and real-time alert dissemination to protect coastal communities.

## 🎯 Project Overview

Samudra Alert is a multi-role dashboard system designed to monitor, verify, and respond to coastal hazards such as high tides, marine pollution, and coastal erosion. The system combines citizen reporting, analyst verification, and administrative alert broadcasting into a unified platform.

## ✨ Features

### 🏠 Citizen Dashboard

- **Real-time Reporting**: Submit geo-tagged photos, videos, and voice notes of coastal hazards
- **Interactive Coastal Map**: View current hazard conditions and active alerts
- **Emergency Alerts**: Receive push notifications and SMS alerts for nearby hazards
- **Community Gallery**: Browse verified hazard reports from other citizens

### 🔍 Analyst Dashboard

- **Verification Hub**: Process and verify incoming citizen reports
- **AI-Powered Insights**: Automated hazard severity scoring and misinformation detection
- **Data Corroboration**: Cross-reference reports with social media and other sources
- **Report Management**: Verify, reject, or escalate reports to administrators

### ⚡ Admin Dashboard

- **Command Center**: High-level overview of verified hazard events
- **Alert Composer**: Create and broadcast official alerts with geofencing
- **User Management**: Manage analyst and citizen user accounts
- **System Analytics**: Performance metrics and operational insights
- **Configuration**: Manage alert templates, API keys, and system settings

## 🛠️ Technology Stack

### Frontend

- **React.js** with TypeScript
- **Leaflet.js** for interactive maps
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Lucide React** for icons

### Planned Backend (Not implemented yet)

- **Node.js** with Express
- **PostgreSQL** with PostGIS for spatial data
- **Firebase** for push notifications
- **AI/ML** models for content verification
- **SMS Gateway** integration

### External APIs

- **INCOIS** (Indian National Centre for Ocean Information Services)
- **Weather APIs** for meteorological data
- **Social Media APIs** for corroboration

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/samudra-alert.git
   cd samudra-alert
   ```

2. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Usage

1. **Citizen Dashboard**: Report coastal hazards and view community reports
2. **Analyst Dashboard**: Verify and process incoming reports
3. **Admin Dashboard**: Manage system operations and broadcast alerts

Use the navigation bar to switch between different dashboards.

## 📁 Project Structure

```
samudra-alert/
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── CameraView.tsx
│   │   │   ├── CoastalMap.tsx
│   │   │   ├── Gallery.tsx
│   │   │   └── PostPreview.tsx
│   │   ├── pages/               # Main dashboard pages
│   │   │   ├── admin.tsx        # Admin dashboard
│   │   │   ├── analyst.tsx      # Analyst dashboard
│   │   │   ├── user.tsx         # Citizen dashboard
│   │   │   ├── SamudraAlertDashboard.tsx
│   │   │   └── PageStyle/       # Page-specific styles
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useAudioRecorder.ts
│   │   │   ├── useCamera.ts
│   │   │   └── useGeolocation.ts
│   │   ├── types/               # TypeScript type definitions
│   │   └── App.tsx              # Main application component
│   ├── public/
│   └── package.json
└── README.md
```

## 🎨 Dashboard Features

### Admin Dashboard Components

#### 📊 Overview Dashboard

- Real-time statistics and system health monitoring
- Interactive map showing verified events
- Key performance indicators

#### 🚨 Verified Events Queue

- Prioritized list of analyst-verified hazard events
- Event details with severity scoring and citizen report counts
- Quick action buttons for alert creation

#### 📢 Alert Composer & Broadcaster

- Geofenced alert targeting with interactive map
- Multi-channel alert distribution (Push, SMS, Social Media)
- Pre-defined alert templates for different hazard types
- Alert delivery tracking and history

#### 👥 User Management

- Add, edit, and manage analyst and citizen accounts
- Role-based access control
- User activity monitoring

#### 📈 Analytics & Reporting

- System performance metrics
- Event response statistics
- Monthly trend analysis
- Exportable reports

#### ⚙️ System Configuration

- Alert template management
- API key configuration
- AI model threshold settings
- System health monitoring

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 TODO / Roadmap

- [ ] Backend API development
- [ ] Database schema implementation
- [ ] AI/ML model integration
- [ ] Push notification system
- [ ] SMS gateway integration
- [ ] Social media API integration
- [ ] Mobile app development
- [ ] Real-time WebSocket connections
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

## 🐛 Known Issues

- TypeScript compilation warnings for unused imports
- Backend integration pending
- Real data connections not yet implemented

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **INCOIS** for oceanographic data
- **OpenStreetMap** for map tiles
- **Leaflet.js** community for mapping solutions
- **React.js** team for the excellent framework

## 📞 Contact

For questions or support, please open an issue in this repository.

---

**Note**: This is currently a frontend-only implementation. Backend development is planned for future releases.
