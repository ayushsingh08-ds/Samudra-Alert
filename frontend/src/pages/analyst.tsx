import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Clock,
  MapPin,
  Eye,
  CheckCircle,
  XCircle,
  ArrowUp,
  MessageSquare,
  Image,
  Mic,
  Video,
  RefreshCw,
  Search,
  Users,
  TrendingUp,
  Shield,
  Brain,
  Zap,
} from "lucide-react";
import "./PageStyle/analyst.css";

// TypeScript Interfaces
interface Report {
  id: string;
  type: "photo" | "video" | "audio" | "text";
  hazardType: string;
  location: {
    coordinates: string;
    address: string;
  };
  timestamp: Date;
  citizen: {
    name: string;
    credibilityScore: number;
  };
  media?: {
    url: string;
    thumbnail?: string;
  };
  description?: string;
  status: "pending" | "verified" | "rejected" | "escalated";
  priority: "low" | "medium" | "high" | "critical";
  aiAnalysis: {
    severityScore: number;
    misinformationScore: number;
    sentimentScore: number;
    confidence: number;
  };
  corroboration: {
    socialMediaMentions: number;
    duplicateReports: number;
    officialSources: number;
  };
}

interface VerificationAction {
  type: "verify" | "reject" | "escalate" | "cluster";
  reportId: string;
  notes?: string;
  clusterId?: string;
}

const AnalystDashboard: React.FC = () => {
  // State Management
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock Data - In production, this would come from an API
  useEffect(() => {
    const mockReports: Report[] = [
      {
        id: "1",
        type: "photo",
        hazardType: "High Waves",
        location: {
          coordinates: "19.0760, 72.8777",
          address: "Marine Drive, Mumbai",
        },
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        citizen: {
          name: "Rajesh Kumar",
          credibilityScore: 8.5,
        },
        media: {
          url: "/api/media/report1.jpg",
          thumbnail: "/api/thumbnails/report1_thumb.jpg",
        },
        description: "Massive waves hitting the seawall, people evacuating",
        status: "pending",
        priority: "high",
        aiAnalysis: {
          severityScore: 8.2,
          misinformationScore: 1.1,
          sentimentScore: 7.8,
          confidence: 0.92,
        },
        corroboration: {
          socialMediaMentions: 23,
          duplicateReports: 3,
          officialSources: 1,
        },
      },
      {
        id: "2",
        type: "video",
        hazardType: "Oil Spill",
        location: {
          coordinates: "18.9388, 72.8354",
          address: "Juhu Beach, Mumbai",
        },
        timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
        citizen: {
          name: "Priya Sharma",
          credibilityScore: 9.2,
        },
        media: {
          url: "/api/media/report2.mp4",
          thumbnail: "/api/thumbnails/report2_thumb.jpg",
        },
        description: "Black substance washing ashore, strong smell",
        status: "pending",
        priority: "critical",
        aiAnalysis: {
          severityScore: 9.1,
          misinformationScore: 0.8,
          sentimentScore: 8.9,
          confidence: 0.95,
        },
        corroboration: {
          socialMediaMentions: 45,
          duplicateReports: 7,
          officialSources: 2,
        },
      },
      {
        id: "3",
        type: "audio",
        hazardType: "Strong Currents",
        location: {
          coordinates: "19.1136, 72.9083",
          address: "Versova Beach, Mumbai",
        },
        timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
        citizen: {
          name: "Mohammed Ali",
          credibilityScore: 7.8,
        },
        media: {
          url: "/api/media/report3.mp3",
        },
        description: "Fishermen reporting dangerous currents, boats struggling",
        status: "verified",
        priority: "medium",
        aiAnalysis: {
          severityScore: 6.5,
          misinformationScore: 2.1,
          sentimentScore: 6.2,
          confidence: 0.87,
        },
        corroboration: {
          socialMediaMentions: 12,
          duplicateReports: 2,
          officialSources: 1,
        },
      },
    ];
    setReports(mockReports);
    setSelectedReport(mockReports[0]);
  }, []);

  // Filter and Search Logic
  const filteredReports = reports.filter((report) => {
    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || report.priority === filterPriority;
    const matchesSearch =
      searchTerm === "" ||
      report.hazardType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.address
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      report.citizen.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Action Handlers
  const handleVerificationAction = (action: VerificationAction) => {
    setReports((prev) =>
      prev.map((report) => {
        if (report.id === action.reportId) {
          let newStatus: Report["status"];
          switch (action.type) {
            case "verify":
              newStatus = "verified";
              break;
            case "reject":
              newStatus = "rejected";
              break;
            case "escalate":
              newStatus = "escalated";
              break;
            default:
              newStatus = report.status;
          }
          return { ...report, status: newStatus };
        }
        return report;
      })
    );

    // Show success message
    alert(`Report ${action.type}d successfully!`);
  };

  const getStatusColor = (status: Report["status"]) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "verified":
        return "status-verified";
      case "rejected":
        return "status-rejected";
      case "escalated":
        return "status-escalated";
      default:
        return "status-pending";
    }
  };

  const getPriorityColor = (priority: Report["priority"]) => {
    switch (priority) {
      case "low":
        return "priority-low";
      case "medium":
        return "priority-medium";
      case "high":
        return "priority-high";
      case "critical":
        return "priority-critical";
      default:
        return "priority-medium";
    }
  };

  const getMediaIcon = (type: Report["type"]) => {
    switch (type) {
      case "photo":
        return <Image size={16} />;
      case "video":
        return <Video size={16} />;
      case "audio":
        return <Mic size={16} />;
      case "text":
        return <MessageSquare size={16} />;
      default:
        return <MessageSquare size={16} />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="analyst-dashboard">
      {/* Header */}
      <header className="analyst-header">
        <div className="header-content">
          <div className="header-title">
            <Shield className="header-icon" size={28} />
            <div>
              <h1>Analyst Dashboard</h1>
              <p>Verification & Assessment Hub</p>
            </div>
          </div>

          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-number">
                {reports.filter((r) => r.status === "pending").length}
              </div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {reports.filter((r) => r.status === "verified").length}
              </div>
              <div className="stat-label">Verified</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {reports.filter((r) => r.priority === "critical").length}
              </div>
              <div className="stat-label">Critical</div>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Live Report Feed */}
        <div className="report-feed">
          <div className="feed-header">
            <div className="feed-title">
              <RefreshCw size={20} />
              <h2>Live Report Feed</h2>
            </div>

            {/* Filters and Search */}
            <div className="feed-controls">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="escalated">Escalated</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Report List */}
          <div className="report-list">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className={`report-item ${
                  selectedReport?.id === report.id ? "selected" : ""
                } ${report.status === "pending" ? "unread" : ""}`}
                onClick={() => setSelectedReport(report)}
              >
                <div className="report-media">
                  {report.media?.thumbnail ? (
                    <img src={report.media.thumbnail} alt="Report thumbnail" />
                  ) : (
                    <div className="media-placeholder">
                      {getMediaIcon(report.type)}
                    </div>
                  )}
                </div>

                <div className="report-content">
                  <div className="report-header">
                    <span
                      className={`hazard-type ${getPriorityColor(
                        report.priority
                      )}`}
                    >
                      {report.hazardType}
                    </span>
                    <span
                      className={`status-badge ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <div className="report-location">
                    <MapPin size={12} />
                    {report.location.address}
                  </div>

                  <div className="report-meta">
                    <span className="citizen-name">
                      <Users size={12} />
                      {report.citizen.name}
                    </span>
                    <span className="timestamp">
                      <Clock size={12} />
                      {formatTimeAgo(report.timestamp)}
                    </span>
                  </div>

                  <div className="ai-scores">
                    <div className="score">
                      <TrendingUp size={12} />
                      Severity: {report.aiAnalysis.severityScore}/10
                    </div>
                    <div className="score">
                      <Brain size={12} />
                      Confidence:{" "}
                      {Math.round(report.aiAnalysis.confidence * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Panel */}
        <div className="verification-panel">
          {selectedReport ? (
            <>
              <div className="panel-header">
                <h2>Verification Panel</h2>
                <div className="report-id">ID: {selectedReport.id}</div>
              </div>

              {/* Media Viewer */}
              <div className="media-viewer">
                <h3>Media Content</h3>
                <div className="media-container">
                  {selectedReport.type === "photo" &&
                    selectedReport.media?.url && (
                      <img
                        src={selectedReport.media.url}
                        alt="Report content"
                        className="media-content"
                      />
                    )}
                  {selectedReport.type === "video" &&
                    selectedReport.media?.url && (
                      <video
                        src={selectedReport.media.url}
                        controls
                        className="media-content"
                      />
                    )}
                  {selectedReport.type === "audio" &&
                    selectedReport.media?.url && (
                      <audio
                        src={selectedReport.media.url}
                        controls
                        className="media-content"
                      />
                    )}
                  {selectedReport.type === "text" && (
                    <div className="text-content">
                      <MessageSquare size={24} />
                      <p>{selectedReport.description}</p>
                    </div>
                  )}
                </div>

                <div className="media-metadata">
                  <div className="metadata-item">
                    <MapPin size={16} />
                    <div>
                      <strong>Location:</strong>
                      <p>{selectedReport.location.address}</p>
                      <p className="coordinates">
                        {selectedReport.location.coordinates}
                      </p>
                    </div>
                  </div>
                  <div className="metadata-item">
                    <Clock size={16} />
                    <div>
                      <strong>Timestamp:</strong>
                      <p>{selectedReport.timestamp.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="metadata-item">
                    <Users size={16} />
                    <div>
                      <strong>Reported by:</strong>
                      <p>{selectedReport.citizen.name}</p>
                      <p className="credibility">
                        Credibility: {selectedReport.citizen.credibilityScore}
                        /10
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI-Powered Insights */}
              <div className="ai-insights">
                <h3>
                  <Brain size={20} />
                  AI-Powered Insights
                </h3>

                <div className="insights-grid">
                  <div className="insight-card">
                    <div className="insight-header">
                      <AlertTriangle size={16} />
                      <span>Hazard Severity Score</span>
                    </div>
                    <div className="insight-score severity">
                      {selectedReport.aiAnalysis.severityScore}/10
                    </div>
                    <div className="insight-bar">
                      <div
                        className="insight-fill severity"
                        style={{
                          width: `${
                            selectedReport.aiAnalysis.severityScore * 10
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="insight-card">
                    <div className="insight-header">
                      <Shield size={16} />
                      <span>Misinformation Risk</span>
                    </div>
                    <div className="insight-score misinformation">
                      {selectedReport.aiAnalysis.misinformationScore}/10
                    </div>
                    <div className="insight-bar">
                      <div
                        className="insight-fill misinformation"
                        style={{
                          width: `${
                            selectedReport.aiAnalysis.misinformationScore * 10
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="insight-card">
                    <div className="insight-header">
                      <Zap size={16} />
                      <span>Public Sentiment</span>
                    </div>
                    <div className="insight-score sentiment">
                      {selectedReport.aiAnalysis.sentimentScore}/10
                    </div>
                    <div className="insight-bar">
                      <div
                        className="insight-fill sentiment"
                        style={{
                          width: `${
                            selectedReport.aiAnalysis.sentimentScore * 10
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="insight-card">
                    <div className="insight-header">
                      <Eye size={16} />
                      <span>AI Confidence</span>
                    </div>
                    <div className="insight-score confidence">
                      {Math.round(selectedReport.aiAnalysis.confidence * 100)}%
                    </div>
                    <div className="insight-bar">
                      <div
                        className="insight-fill confidence"
                        style={{
                          width: `${
                            selectedReport.aiAnalysis.confidence * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Corroboration Data */}
              <div className="corroboration-data">
                <h3>Corroboration Data</h3>
                <div className="corroboration-stats">
                  <div className="corr-stat">
                    <MessageSquare size={16} />
                    <div>
                      <strong>
                        {selectedReport.corroboration.socialMediaMentions}
                      </strong>
                      <span>Social Media Mentions</span>
                    </div>
                  </div>
                  <div className="corr-stat">
                    <Users size={16} />
                    <div>
                      <strong>
                        {selectedReport.corroboration.duplicateReports}
                      </strong>
                      <span>Duplicate Reports</span>
                    </div>
                  </div>
                  <div className="corr-stat">
                    <Shield size={16} />
                    <div>
                      <strong>
                        {selectedReport.corroboration.officialSources}
                      </strong>
                      <span>Official Sources</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  className="action-btn verify"
                  onClick={() =>
                    handleVerificationAction({
                      type: "verify",
                      reportId: selectedReport.id,
                    })
                  }
                  disabled={selectedReport.status !== "pending"}
                >
                  <CheckCircle size={16} />
                  Verify Report
                </button>

                <button
                  className="action-btn reject"
                  onClick={() =>
                    handleVerificationAction({
                      type: "reject",
                      reportId: selectedReport.id,
                    })
                  }
                  disabled={selectedReport.status !== "pending"}
                >
                  <XCircle size={16} />
                  Mark as False Alarm
                </button>

                <button
                  className="action-btn cluster"
                  onClick={() =>
                    handleVerificationAction({
                      type: "cluster",
                      reportId: selectedReport.id,
                    })
                  }
                >
                  <Users size={16} />
                  Cluster/Merge
                </button>

                <button
                  className="action-btn escalate"
                  onClick={() =>
                    handleVerificationAction({
                      type: "escalate",
                      reportId: selectedReport.id,
                    })
                  }
                  disabled={selectedReport.status === "rejected"}
                >
                  <ArrowUp size={16} />
                  Escalate to Admin
                </button>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <Eye size={48} />
              <h3>Select a report to verify</h3>
              <p>
                Choose a report from the feed to start the verification process
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalystDashboard;
