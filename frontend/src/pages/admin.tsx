import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import {
  Bell,
  Search,
  User,
  LogOut,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  Settings,
  Users,
  Activity,
  BarChart3,
  Eye,
  MapPin,
  Calendar,
  Filter,
  Download,
  Clock,
  Shield,
  Waves,
  AlertCircle,
  Trash2,
  Edit,
  Plus,
  RefreshCw
} from 'lucide-react';
import './PageStyle/admin.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [alertMode, setAlertMode] = useState(false);
  const [geofenceArea, setGeofenceArea] = useState(null);
  const [systemHealth, setSystemHealth] = useState({
    apiStatus: 'healthy',
    dbStatus: 'healthy',
    aiModels: 'healthy',
    dataIngestion: 142
  });

  // Mock data for verified events
  const [verifiedEvents, setVerifiedEvents] = useState([
    {
      id: 'EVT001',
      type: 'High Tide',
      location: 'Marina Beach, Chennai',
      coordinates: [13.0475, 80.2824],
      severity: 8,
      reportsCount: 15,
      timestamp: '2025-09-19T10:30:00Z',
      status: 'pending',
      description: 'Unusually high tide levels reported with potential flooding risk',
      analystNotes: 'Verified through multiple sources. Weather data confirms unusual tidal patterns.',
      citizenReports: 15,
      aiConfidence: 92
    },
    {
      id: 'EVT002',
      type: 'Debris/Pollution',
      location: 'Juhu Beach, Mumbai',
      coordinates: [19.0990, 72.8265],
      severity: 6,
      reportsCount: 8,
      timestamp: '2025-09-19T09:15:00Z',
      status: 'escalated',
      description: 'Large amount of plastic debris washed ashore',
      analystNotes: 'Confirmed pollution event. Local authorities notified.',
      citizenReports: 8,
      aiConfidence: 87
    },
    {
      id: 'EVT003',
      type: 'Coastal Erosion',
      location: 'Puri Beach, Odisha',
      coordinates: [19.8135, 85.8312],
      severity: 9,
      reportsCount: 23,
      timestamp: '2025-09-19T08:45:00Z',
      status: 'critical',
      description: 'Severe coastal erosion threatening nearby structures',
      analystNotes: 'Critical situation. Immediate evacuation may be required.',
      citizenReports: 23,
      aiConfidence: 95
    }
  ]);

  const [users, setUsers] = useState([
    { id: 1, name: 'Dr. Priya Sharma', role: 'analyst', email: 'priya@samudra.gov.in', status: 'active', lastActive: '2 hours ago' },
    { id: 2, name: 'Raj Kumar', role: 'analyst', email: 'raj@samudra.gov.in', status: 'active', lastActive: '30 minutes ago' },
    { id: 3, name: 'Admin User', role: 'admin', email: 'admin@samudra.gov.in', status: 'active', lastActive: 'now' }
  ]);

  const [analytics, setAnalytics] = useState({
    totalReports: 1247,
    verifiedEvents: 89,
    alertsSent: 45,
    avgResponseTime: '12 minutes',
    monthlyTrends: [
      { month: 'May', reports: 89, alerts: 12 },
      { month: 'Jun', reports: 156, alerts: 18 },
      { month: 'Jul', reports: 203, alerts: 25 },
      { month: 'Aug', reports: 298, alerts: 31 },
      { month: 'Sep', reports: 501, alerts: 42 }
    ]
  });

  // Header Component
  const Header = () => (
    <header className="admin-header">
      <div className="header-left">
        <div className="logo">
          <Waves className="logo-icon" />
          <span className="logo-text">Samudra Alert</span>
          <span className="admin-badge">Admin</span>
        </div>
        <div className="search-bar">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search events, locations, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="header-right">
        <button className="notification-btn">
          <Bell />
          {notifications > 0 && <span className="notification-count">{notifications}</span>}
        </button>
        <div className="user-menu">
          <User />
          <span>Admin</span>
          <LogOut className="logout-icon" />
        </div>
      </div>
    </header>
  );

  // Navigation Sidebar
  const Sidebar = () => (
    <nav className="sidebar">
      <div className="nav-items">
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Activity />
          <span>Dashboard</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <AlertTriangle />
          <span>Verified Events</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <Send />
          <span>Alert Composer</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users />
          <span>User Management</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 />
          <span>Analytics</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings />
          <span>Settings</span>
        </button>
      </div>
    </nav>
  );

  // Dashboard Overview
  const DashboardOverview = () => (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card urgent">
          <div className="stat-icon">
            <AlertCircle />
          </div>
          <div className="stat-info">
            <h3>Critical Events</h3>
            <div className="stat-number">3</div>
            <div className="stat-change">+1 from yesterday</div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">
            <AlertTriangle />
          </div>
          <div className="stat-info">
            <h3>Pending Events</h3>
            <div className="stat-number">12</div>
            <div className="stat-change">-2 from yesterday</div>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">
            <CheckCircle />
          </div>
          <div className="stat-info">
            <h3>Alerts Sent Today</h3>
            <div className="stat-number">8</div>
            <div className="stat-change">+3 from yesterday</div>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">
            <Activity />
          </div>
          <div className="stat-info">
            <h3>System Health</h3>
            <div className="stat-number">98%</div>
            <div className="stat-change">All systems operational</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section map-section">
          <h2>Real-time Coastal Monitoring</h2>
          <div className="map-container">
            <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '400px', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {verifiedEvents.map(event => (
                <Marker key={event.id} position={event.coordinates}>
                  <Popup>
                    <div className="popup-content">
                      <h3>{event.type}</h3>
                      <p>{event.location}</p>
                      <div className={`severity-badge severity-${event.severity >= 8 ? 'high' : event.severity >= 6 ? 'medium' : 'low'}`}>
                        Severity: {event.severity}/10
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="dashboard-section system-health">
          <h2>System Health Monitor</h2>
          <div className="health-indicators">
            <div className="health-item">
              <div className="health-status healthy"></div>
              <span>API Services</span>
              <span className="health-value">Operational</span>
            </div>
            <div className="health-item">
              <div className="health-status healthy"></div>
              <span>Database</span>
              <span className="health-value">Connected</span>
            </div>
            <div className="health-item">
              <div className="health-status healthy"></div>
              <span>AI Models</span>
              <span className="health-value">Active</span>
            </div>
            <div className="health-item">
              <div className="health-status warning"></div>
              <span>Data Ingestion</span>
              <span className="health-value">142/min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Verified Events Queue
  const VerifiedEventsQueue = () => (
    <div className="events-content">
      <div className="events-header">
        <h2>Verified Events Queue</h2>
        <div className="events-controls">
          <div className="filter-controls">
            <select className="filter-select">
              <option>All Types</option>
              <option>High Tide</option>
              <option>Debris/Pollution</option>
              <option>Coastal Erosion</option>
            </select>
            <select className="filter-select">
              <option>All Severities</option>
              <option>Critical (8-10)</option>
              <option>High (6-8)</option>
              <option>Medium (4-6)</option>
              <option>Low (1-4)</option>
            </select>
          </div>
          <button className="refresh-btn">
            <RefreshCw />
            Refresh
          </button>
        </div>
      </div>

      <div className="events-list">
        {verifiedEvents.map(event => (
          <div
            key={event.id}
            className={`event-card ${event.status} ${selectedEvent?.id === event.id ? 'selected' : ''}`}
            onClick={() => setSelectedEvent(event)}
          >
            <div className="event-header">
              <div className="event-type">
                <AlertTriangle className={`type-icon ${event.severity >= 8 ? 'critical' : event.severity >= 6 ? 'high' : 'medium'}`} />
                <span className="type-text">{event.type}</span>
              </div>
              <div className="event-time">
                <Clock />
                {new Date(event.timestamp).toLocaleString()}
              </div>
            </div>

            <div className="event-location">
              <MapPin />
              {event.location}
            </div>

            <div className="event-metrics">
              <div className="metric">
                <span className="metric-label">Severity</span>
                <div className={`severity-score severity-${event.severity >= 8 ? 'high' : event.severity >= 6 ? 'medium' : 'low'}`}>
                  {event.severity}/10
                </div>
              </div>
              <div className="metric">
                <span className="metric-label">Reports</span>
                <span className="metric-value">{event.citizenReports}</span>
              </div>
              <div className="metric">
                <span className="metric-label">AI Confidence</span>
                <span className="metric-value">{event.aiConfidence}%</span>
              </div>
            </div>

            <div className="event-description">
              {event.description}
            </div>

            <div className="event-actions">
              <button className="action-btn primary" onClick={(e) => {
                e.stopPropagation();
                setSelectedEvent(event);
                setActiveTab('alerts');
              }}>
                <Send />
                Create Alert
              </button>
              <button className="action-btn secondary">
                <Eye />
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Alert Composer
  const AlertComposer = () => {
    const [alertData, setAlertData] = useState({
      title: '',
      message: '',
      severity: 'medium',
      channels: ['push'],
      targetArea: null,
      template: ''
    });

    const alertTemplates = {
      highTide: 'HIGH TIDE ALERT: Unusually high tide levels detected at {location}. Avoid coastal areas and move to higher ground if necessary.',
      pollution: 'POLLUTION ALERT: Marine pollution detected at {location}. Avoid water contact and report any health concerns.',
      erosion: 'COASTAL EROSION WARNING: Severe erosion reported at {location}. Evacuate coastal structures immediately.'
    };

    return (
      <div className="alerts-content">
        <div className="alerts-header">
          <h2>Alert Composer & Broadcaster</h2>
          {selectedEvent && (
            <div className="selected-event-info">
              <span>Creating alert for: <strong>{selectedEvent.type}</strong> at <strong>{selectedEvent.location}</strong></span>
            </div>
          )}
        </div>

        <div className="alert-composer-grid">
          <div className="composer-section">
            <h3>Alert Details</h3>
            
            <div className="form-group">
              <label>Alert Template</label>
              <select 
                value={alertData.template}
                onChange={(e) => setAlertData({...alertData, template: e.target.value})}
              >
                <option value="">Custom Message</option>
                <option value="highTide">High Tide Warning</option>
                <option value="pollution">Pollution Alert</option>
                <option value="erosion">Coastal Erosion Warning</option>
              </select>
            </div>

            <div className="form-group">
              <label>Alert Title</label>
              <input
                type="text"
                value={alertData.title}
                onChange={(e) => setAlertData({...alertData, title: e.target.value})}
                placeholder="Enter alert title..."
              />
            </div>

            <div className="form-group">
              <label>Alert Message</label>
              <textarea
                value={alertData.message}
                onChange={(e) => setAlertData({...alertData, message: e.target.value})}
                placeholder="Enter alert message..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Severity Level</label>
              <select 
                value={alertData.severity}
                onChange={(e) => setAlertData({...alertData, severity: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Distribution Channels</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={alertData.channels.includes('push')} />
                  Push Notifications
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={alertData.channels.includes('sms')} />
                  SMS Alerts
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={alertData.channels.includes('social')} />
                  Social Media
                </label>
              </div>
            </div>
          </div>

          <div className="map-section">
            <h3>Target Area Selection</h3>
            <div className="geofence-map">
              <MapContainer center={selectedEvent ? selectedEvent.coordinates : [20.5937, 78.9629]} zoom={8} style={{ height: '300px', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {selectedEvent && (
                  <Marker position={selectedEvent.coordinates}>
                    <Popup>Event Location</Popup>
                  </Marker>
                )}
                {geofenceArea && (
                  <Circle
                    center={geofenceArea.center}
                    radius={geofenceArea.radius}
                    color="red"
                    fillColor="red"
                    fillOpacity={0.2}
                  />
                )}
              </MapContainer>
            </div>
            <div className="geofence-controls">
              <button className="geofence-btn">
                <MapPin />
                Draw Alert Zone
              </button>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                placeholder="Radius (meters)"
              />
            </div>
          </div>
        </div>

        <div className="alert-actions">
          <button className="preview-btn">
            <Eye />
            Preview Alert
          </button>
          <button className="send-btn primary">
            <Send />
            Send Alert Now
          </button>
          <button className="schedule-btn">
            <Calendar />
            Schedule for Later
          </button>
        </div>

        <div className="dissemination-log">
          <h3>Recent Alert History</h3>
          <div className="log-entries">
            <div className="log-entry">
              <div className="log-time">2025-09-19 14:30</div>
              <div className="log-content">High Tide Alert sent to Marina Beach area (2,450 recipients)</div>
              <div className="log-status success">Delivered</div>
            </div>
            <div className="log-entry">
              <div className="log-time">2025-09-19 12:15</div>
              <div className="log-content">Pollution Alert sent to Juhu Beach area (1,200 recipients)</div>
              <div className="log-status success">Delivered</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // User Management
  const UserManagement = () => (
    <div className="users-content">
      <div className="users-header">
        <h2>User Management</h2>
        <button className="add-user-btn">
          <Plus />
          Add New User
        </button>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <User className="user-avatar" />
                    {user.name}
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge ${user.status}`}>{user.status}</span>
                </td>
                <td>{user.lastActive}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn">
                      <Edit />
                    </button>
                    <button className="action-btn danger">
                      <Trash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Analytics Dashboard
  const AnalyticsDashboard = () => (
    <div className="analytics-content">
      <div className="analytics-header">
        <h2>Analytics & Reporting</h2>
        <div className="analytics-controls">
          <select className="time-range">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Last Year</option>
          </select>
          <button className="export-btn">
            <Download />
            Export Report
          </button>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Event Response Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-number">{analytics.totalReports}</div>
              <div className="metric-label">Total Reports</div>
            </div>
            <div className="metric-item">
              <div className="metric-number">{analytics.verifiedEvents}</div>
              <div className="metric-label">Verified Events</div>
            </div>
            <div className="metric-item">
              <div className="metric-number">{analytics.alertsSent}</div>
              <div className="metric-label">Alerts Sent</div>
            </div>
            <div className="metric-item">
              <div className="metric-number">{analytics.avgResponseTime}</div>
              <div className="metric-label">Avg Response Time</div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Monthly Trends</h3>
          <div className="trend-chart">
            {analytics.monthlyTrends.map(trend => (
              <div key={trend.month} className="trend-bar">
                <div className="bar-label">{trend.month}</div>
                <div className="bar-container">
                  <div 
                    className="bar reports" 
                    style={{ height: `${(trend.reports / 500) * 100}%` }}
                  ></div>
                  <div 
                    className="bar alerts" 
                    style={{ height: `${(trend.alerts / 50) * 100}%` }}
                  ></div>
                </div>
                <div className="bar-values">
                  <span>R: {trend.reports}</span>
                  <span>A: {trend.alerts}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>System Performance</h3>
          <div className="performance-metrics">
            <div className="perf-item">
              <div className="perf-label">AI Model Accuracy</div>
              <div className="perf-bar">
                <div className="perf-fill" style={{ width: '94%' }}></div>
              </div>
              <div className="perf-value">94%</div>
            </div>
            <div className="perf-item">
              <div className="perf-label">Alert Delivery Rate</div>
              <div className="perf-bar">
                <div className="perf-fill" style={{ width: '98%' }}></div>
              </div>
              <div className="perf-value">98%</div>
            </div>
            <div className="perf-item">
              <div className="perf-label">System Uptime</div>
              <div className="perf-bar">
                <div className="perf-fill" style={{ width: '99.8%' }}></div>
              </div>
              <div className="perf-value">99.8%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Settings Panel
  const SettingsPanel = () => (
    <div className="settings-content">
      <div className="settings-header">
        <h2>System Configuration</h2>
      </div>

      <div className="settings-sections">
        <div className="settings-section">
          <h3>Alert Templates</h3>
          <div className="template-list">
            {Object.entries(alertTemplates).map(([key, template]) => (
              <div key={key} className="template-item">
                <div className="template-name">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                <div className="template-text">{template}</div>
                <button className="edit-template-btn">
                  <Edit />
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h3>API Configuration</h3>
          <div className="config-items">
            <div className="config-item">
              <label>INCOIS API Key</label>
              <input type="password" placeholder="Enter API key..." />
            </div>
            <div className="config-item">
              <label>Firebase Server Key</label>
              <input type="password" placeholder="Enter server key..." />
            </div>
            <div className="config-item">
              <label>SMS Gateway Config</label>
              <input type="text" placeholder="Gateway URL..." />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>AI Model Thresholds</h3>
          <div className="threshold-controls">
            <div className="threshold-item">
              <label>Minimum Confidence Score</label>
              <input type="range" min="0" max="100" defaultValue="80" />
              <span>80%</span>
            </div>
            <div className="threshold-item">
              <label>Auto-escalation Threshold</label>
              <input type="range" min="0" max="10" defaultValue="7" />
              <span>7/10</span>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="save-settings-btn">
          <CheckCircle />
          Save Configuration
        </button>
        <button className="reset-settings-btn">
          <RefreshCw />
          Reset to Defaults
        </button>
      </div>
    </div>
  );

  // Main render
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'events':
        return <VerifiedEventsQueue />;
      case 'alerts':
        return <AlertComposer />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="admin-dashboard">
      <Header />
      <div className="dashboard-body">
        <Sidebar />
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
