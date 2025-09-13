import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style/CitizenDashboard.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons to match the screenshot
const createPurpleMarker = () => {
  return L.divIcon({
    className: 'custom-purple-marker',
    html: `<div style="
      background: #7c3aed;
      width: 20px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative;
    "><div style="
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
      position: absolute;
      top: 4px;
      left: 4px;
    "></div></div>`,
    iconSize: [20, 30],
    iconAnchor: [10, 30],
  });
};

const createRedMarker = () => {
  return L.divIcon({
    className: 'custom-red-marker',
    html: `<div style="
      background: #dc2626;
      width: 20px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative;
    "><div style="
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
      position: absolute;
      top: 4px;
      left: 4px;
    "></div></div>`,
    iconSize: [20, 30],
    iconAnchor: [10, 30],
  });
};

// Component to handle location detection
function LocationMarker({ position, setPosition }) {
  const map = useMap();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const newPos = [location.coords.latitude, location.coords.longitude];
          setPosition(newPos);
          map.setView(newPos, 10);
        },
        (error) => {
          console.log("Location access denied:", error);
          // Default to India center if location denied
          const defaultPos = [20.5937, 78.9629];
          setPosition(defaultPos);
          map.setView(defaultPos, 5);
        }
      );
    }
  }, [map, setPosition]);

  return position ? (
    <Marker position={position} icon={createPurpleMarker()}>
      <Popup>
        <div style={{ textAlign: 'center' }}>
          <strong>📍 Your Location</strong><br/>
          <small>Lat: {position[0].toFixed(4)}°</small><br/>
          <small>Lng: {position[1].toFixed(4)}°</small>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

export default function CitizenDashboard() {
  const [hazardDescription, setHazardDescription] = useState('');
  const [userLocation, setUserLocation] = useState([20.5937, 78.9629]); // Default center of India
  const [currentView, setCurrentView] = useState('report'); // 'report', 'myReports', 'alerts'

  // Sample data to match the screenshot
  const myReports = [
    { id: 1, title: 'Fallen Tree', status: 'Verified', icon: '✅' },
    { id: 2, title: 'Oil Spill', status: 'Pending', icon: '⏳' },
    { id: 3, title: 'Landslide', status: 'Rejected', icon: '❌' }
  ];

  // Sample hazard markers for the map
  const hazardMarkers = [
    { id: 1, position: [19.0760, 72.8777], type: 'flood', color: 'purple' }, // Mumbai
    { id: 2, position: [13.0827, 80.2707], type: 'storm', color: 'red' }, // Chennai
    { id: 3, position: [22.5726, 88.3639], type: 'cyclone', color: 'purple' }, // Kolkata
    { id: 4, position: [28.6139, 77.2090], type: 'pollution', color: 'purple' }, // Delhi
  ];

  const handleHazardSubmit = (e) => {
    e.preventDefault();
    if (!hazardDescription.trim()) return;
    
    alert('Hazard report submitted successfully!');
    setHazardDescription('');
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'verified': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Animated Background Elements */}
      <div className="bg-element-1"></div>
      <div className="bg-element-2"></div>

      {/* Header with Glass Effect */}
      <header className="glass-header">
        <h1 className="header-title">
          Samudra Suraksha
        </h1>
        <h2 className="header-subtitle">
          Citizen Dashboard
        </h2>
        <div className="user-profile">
          <span style={{ fontWeight: '500' }}>User Name</span>
          <div className="user-avatar">
            👤
          </div>
        </div>
      </header>

      <div className="main-content">
        {/* Left Sidebar with Glass Effect */}
        <div className="glass-sidebar">
          {/* Navigation Tabs with Glass Effect */}
          <div className="nav-tabs">
            <button
              onClick={() => setCurrentView('report')}
              className={`nav-button ${currentView === 'report' ? 'active' : ''}`}
            >
              Report Hazard
            </button>
            <button
              onClick={() => setCurrentView('myReports')}
              className={`nav-button ${currentView === 'myReports' ? 'active' : ''}`}
            >
              Show My Reports
            </button>
            <button
              onClick={() => setCurrentView('alerts')}
              className={`nav-button ${currentView === 'alerts' ? 'active' : ''}`}
            >
              Show Alerts
            </button>
          </div>

          {/* Report Hazard Section */}
          {currentView === 'report' && (
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginBottom: '1rem' 
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  background: 'rgba(124, 58, 237, 0.8)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
                }}>
                  ⚠️
                </div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '1.125rem', 
                  fontWeight: '600',
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  Report Hazard
                </h3>
              </div>

              <form onSubmit={handleHazardSubmit} style={{ marginBottom: '2rem' }}>
                <textarea
                  value={hazardDescription}
                  onChange={(e) => setHazardDescription(e.target.value)}
                  placeholder="Describe hazard"
                  className="glass-textarea"
                  required
                />

                <div className="location-indicator">
                  <span>📍</span>
                  <span>Auto-detected location</span>
                </div>

                <button
                  type="submit"
                  className="glass-button"
                >
                  Upload
                </button>
              </form>
            </div>
          )}

          {/* My Reports Section */}
          {(currentView === 'myReports' || currentView === 'report') && (
            <div>
              <div className="section-header">
                <div className="section-icon">
                  📋
                </div>
                <h3 className="section-title">
                  My Reports
                </h3>
              </div>              <div>
                {myReports.map((report) => (
                  <div key={report.id} className="report-card">
                    <span className="report-title">
                      {report.title}
                    </span>
                    <span
                      className="report-status"
                      style={{ color: getStatusColor(report.status) }}
                    >
                      {report.icon} {report.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Map Area with Glass Container */}
        <div className="map-container">
          <MapContainer
            center={userLocation}
            zoom={5}
            className="leaflet-container"
            scrollWheelZoom={true}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* User Location Marker */}
            <LocationMarker position={userLocation} setPosition={setUserLocation} />
            
            {/* Hazard Markers */}
            {hazardMarkers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                icon={marker.color === 'purple' ? createPurpleMarker() : createRedMarker()}
              >
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <strong>{marker.type.toUpperCase()} Alert</strong><br/>
                    <small>Lat: {marker.position[0].toFixed(4)}°</small><br/>
                    <small>Lng: {marker.position[1].toFixed(4)}°</small>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Enhanced Glass Map Controls */}
          <div className="map-controls">
            <button className="map-control-btn">
              +
            </button>
            <button className="map-control-btn">
              −
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}