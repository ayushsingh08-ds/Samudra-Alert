import React, { useState, useRef } from "react";
import {
  AlertTriangle,
  Waves,
  MapPin,
  Clock,
  User,
  X,
  Bell,
  Compass,
  Camera,
  Mic,
  Keyboard,
  StopCircle,
} from "lucide-react";
import CoastalMap from "../components/CoastalMap";
import { useGeolocation } from "../hooks/useGeolocation";
import "./PageStyle/SamudraAlertDashboard.css";

// TypeScript Interfaces
interface Alert {
  id: string;
  type: "information" | "warning" | "danger";
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
  severity: "low" | "medium" | "high";
}

interface Report {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  status: "pending" | "verified" | "resolved";
  location: string;
}

const SamudraAlertDashboard: React.FC = () => {
  // Hooks
  const location = useGeolocation();

  // Extended coastal disaster alerts with real coordinates
  const allCoastalAlerts = [
    {
      id: "1",
      type: "danger" as const,
      title: "High Tide Warning",
      lat: 19.076,
      lng: 72.8777,
    },
    {
      id: "2",
      type: "warning" as const,
      title: "Strong Current Alert",
      lat: 18.9388,
      lng: 72.8354,
    },
    {
      id: "3",
      type: "information" as const,
      title: "Weather Update",
      lat: 19.1136,
      lng: 72.9083,
    },
    {
      id: "4",
      type: "danger" as const,
      title: "Cyclone Warning",
      lat: 19.0176,
      lng: 72.8562,
    },
    {
      id: "5",
      type: "warning" as const,
      title: "Rough Sea Conditions",
      lat: 18.922,
      lng: 72.8347,
    },
    {
      id: "6",
      type: "information" as const,
      title: "Marine Life Alert",
      lat: 19.0896,
      lng: 72.8656,
    },
    {
      id: "7",
      type: "danger" as const,
      title: "Tsunami Watch",
      lat: 18.9467,
      lng: 72.8258,
    },
    {
      id: "8",
      type: "warning" as const,
      title: "Oil Spill Detected",
      lat: 19.0521,
      lng: 72.8698,
    },
  ];

  // Function to calculate distance between two coordinates
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter alerts within 50km radius when user location is available
  const mapAlerts = location.hasLocation
    ? allCoastalAlerts.filter((alert) => {
        const distance = calculateDistance(
          location.latitude!,
          location.longitude!,
          alert.lat,
          alert.lng
        );
        return distance <= 50; // 50km radius
      })
    : allCoastalAlerts;

  // State
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportMethodSelection, setShowReportMethodSelection] =
    useState(false);
  const [reportMethod, setReportMethod] = useState<
    "camera" | "audio" | "text" | null
  >(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [reportForm, setReportForm] = useState({
    type: "",
    description: "",
    photo: null as File | null,
    location: "",
  });

  // Auto-populate location coordinates when GPS data becomes available
  React.useEffect(() => {
    if (location.hasLocation) {
      const coordinates = `${location.latitude?.toFixed(
        6
      )}, ${location.longitude?.toFixed(6)}`;
      setReportForm((prev) => ({
        ...prev,
        location: coordinates,
      }));
    }
  }, [location.hasLocation, location.latitude, location.longitude]);

  // Mock Data - Official Alerts
  const [officialAlerts] = useState<Alert[]>([
    {
      id: "1",
      type: "warning",
      title: "High Tide Warning",
      description:
        "Expect unusual coastal activity. Avoid beachfront areas during high tide periods.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: <AlertTriangle size={20} />,
      severity: "medium",
    },
    {
      id: "2",
      type: "danger",
      title: "Coastal Flooding Alert",
      description:
        "Immediate evacuation recommended for low-lying coastal areas. Emergency services on standby.",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      icon: <Waves size={20} />,
      severity: "high",
    },
    {
      id: "3",
      type: "information",
      title: "Moderate Sea Conditions",
      description:
        "Normal weather conditions expected. Safe for recreational activities with standard precautions.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      icon: <MapPin size={20} />,
      severity: "low",
    },
  ]);

  // Mock Data - User Reports
  const [userReports] = useState<Report[]>([
    {
      id: "1",
      type: "Rip Current",
      description: "Strong rip current observed near the main beach entrance",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: "verified",
      location: "Main Beach, Sector 7",
    },
    {
      id: "2",
      type: "Beach Debris",
      description: "Large debris blocking beach access after storm",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      status: "pending",
      location: "North Shore Access",
    },
  ]);

  const hazardTypes = [
    "Rip Current",
    "High Waves",
    "Coastal Flooding",
    "Beach Erosion",
    "Marine Wildlife",
    "Water Pollution",
    "Beach Debris",
    "Dangerous Weather",
    "Other",
  ];

  // Helper Functions
  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Media handling functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoDataUrl = canvas.toDataURL("image/jpeg");
        setCapturedPhoto(photoDataUrl);

        // Convert to blob and save
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Here you would typically upload to your backend
              console.log("Photo captured, blob size:", blob.size);
              // For now, we'll store it locally
            }
          },
          "image/jpeg",
          0.8
        );

        // Stop camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Unable to access microphone. Please check permissions.");
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleReportButtonClick = () => {
    // Auto-populate location coordinates when starting the report process
    if (location.hasLocation) {
      const coordinates = `${location.latitude?.toFixed(
        6
      )}, ${location.longitude?.toFixed(6)}`;
      setReportForm((prev) => ({
        ...prev,
        location: coordinates,
      }));
    }
    setShowReportMethodSelection(true);
  };

  const handleReportMethodSelect = (method: "camera" | "audio" | "text") => {
    setReportMethod(method);
    setShowReportMethodSelection(false);

    // Ensure location coordinates are populated (in case they weren't already)
    if (location.hasLocation && !reportForm.location) {
      const coordinates = `${location.latitude?.toFixed(
        6
      )}, ${location.longitude?.toFixed(6)}`;
      setReportForm((prev) => ({
        ...prev,
        location: coordinates,
      }));
    }

    if (method === "camera") {
      startCamera();
    } else if (method === "audio") {
      startAudioRecording();
    }

    setShowReportModal(true);
  };

  // Event Handlers
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields based on report method
    const isValid =
      reportForm.type &&
      (reportMethod === "camera"
        ? capturedPhoto
        : reportMethod === "audio"
        ? audioBlob
        : reportMethod === "text"
        ? reportForm.description
        : false);

    if (!isValid) {
      alert("Please fill in all required fields");
      return;
    }

    // Automatically include GPS coordinates if available
    const reportWithLocation = {
      ...reportForm,
      location: location.hasLocation
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            timestamp: location.timestamp,
          }
        : null,
      reportMethod,
      capturedMedia: {
        photo: capturedPhoto,
        audioBlob: null, // TODO: Add audio blob handling
      },
    };

    // Mock submission
    console.log("Report submitted with location:", reportWithLocation);

    const locationText = location.hasLocation
      ? `\nLocation: ${location.latitude?.toFixed(
          6
        )}, ${location.longitude?.toFixed(6)}`
      : "\nLocation: Not available";

    alert(
      `Report submitted successfully! Authorities have been notified.${locationText}`
    );

    // Reset form and close modal
    setReportForm({
      type: "",
      description: "",
      photo: null,
      location: location.hasLocation
        ? `${location.latitude?.toFixed(6)}, ${location.longitude?.toFixed(6)}`
        : "",
    });
    setShowReportModal(false);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-title">
          <Waves className="dashboard-title-icon" size={24} />
          Samudra Alert
        </div>

        {/* Location Status Indicator */}
        <div className="location-status">
          {location.isLoading ? (
            <div className="location-indicator loading">
              <MapPin size={16} />
              <span>Getting location...</span>
            </div>
          ) : location.hasLocation ? (
            <div className="location-indicator active">
              <MapPin size={16} />
              <span>Location active</span>
            </div>
          ) : location.error ? (
            <div className="location-indicator error">
              <MapPin size={16} />
              <span>Location unavailable</span>
            </div>
          ) : null}
        </div>

        <div className="header-profile">
          <button className="notification-btn">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          <div className="profile-avatar">
            <User size={20} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Left Sidebar */}
        <div className="dashboard-sidebar">
          {/* Report Button */}
          <button className="report-button" onClick={handleReportButtonClick}>
            <AlertTriangle size={20} />
            Report a New Hazard
          </button>

          {/* Official Alerts */}
          <div className="alerts-section fade-in">
            <h2 className="alerts-title">Official Alerts</h2>
            {officialAlerts.map((alert) => (
              <div key={alert.id} className={`alert-card ${alert.type}`}>
                <div className={`alert-icon ${alert.type}`}>{alert.icon}</div>
                <div className="alert-content">
                  <h3>{alert.title}</h3>
                  <p>{alert.description}</p>
                  <div className="alert-time">
                    <Clock size={12} />
                    {formatTimestamp(alert.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* My Recent Reports */}
          <div className="reports-section fade-in">
            <h3 className="reports-title">
              <Compass size={20} />
              My Recent Reports
            </h3>
            {userReports.map((report) => (
              <div key={report.id} className="report-item">
                <div className="report-info">
                  <h4>{report.type}</h4>
                  <p>{report.description}</p>
                </div>
                <span className={`report-status ${report.status}`}>
                  {report.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="map-container fade-in">
          <div className="map-header">
            <h3 className="map-title">Coastal Alert Map</h3>
          </div>
          <div className="map-area">
            <CoastalMap
              alerts={mapAlerts}
              userLocation={
                location.hasLocation
                  ? {
                      latitude: location.latitude!,
                      longitude: location.longitude!,
                      accuracy: location.accuracy!,
                    }
                  : null
              }
            />
          </div>
        </div>
      </main>

      {/* Report Method Selection Modal */}
      {showReportMethodSelection && (
        <div
          className="modal-overlay"
          onClick={() => setShowReportMethodSelection(false)}
        >
          <div
            className="modal-content method-selection"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Choose Report Method</h2>
              <button
                className="modal-close"
                onClick={() => setShowReportMethodSelection(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="method-options">
              <button
                className="method-btn camera-btn"
                onClick={() => handleReportMethodSelect("camera")}
              >
                <Camera size={32} />
                <span>Take Photo</span>
                <p>Capture visual evidence</p>
              </button>

              <button
                className="method-btn audio-btn"
                onClick={() => handleReportMethodSelect("audio")}
              >
                <Mic size={32} />
                <span>Record Audio</span>
                <p>Voice description</p>
              </button>

              <button
                className="method-btn text-btn"
                onClick={() => handleReportMethodSelect("text")}
              >
                <Keyboard size={32} />
                <span>Type Report</span>
                <p>Written description</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowReportModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {reportMethod === "camera"
                  ? "Photo Report"
                  : reportMethod === "audio"
                  ? "Audio Report"
                  : "Text Report"}
              </h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowReportModal(false);
                  setReportMethod(null);
                  setCapturedPhoto(null);
                  setAudioUrl(null);
                  setAudioBlob(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Camera Interface */}
            {reportMethod === "camera" && (
              <div className="camera-interface">
                {!capturedPhoto ? (
                  <div className="camera-view">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="camera-video"
                    />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                    <button
                      type="button"
                      className="capture-btn"
                      onClick={capturePhoto}
                    >
                      <Camera size={24} />
                      Capture Photo
                    </button>
                  </div>
                ) : (
                  <div className="photo-preview">
                    <img
                      src={capturedPhoto}
                      alt="Captured"
                      className="captured-photo"
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setCapturedPhoto(null);
                        startCamera();
                      }}
                    >
                      Retake Photo
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Audio Interface */}
            {reportMethod === "audio" && (
              <div className="audio-interface">
                <div className="recording-controls">
                  {!audioUrl ? (
                    <div className="recording-section">
                      <button
                        type="button"
                        className={`record-btn ${
                          isRecording ? "recording" : ""
                        }`}
                        onClick={
                          isRecording ? stopAudioRecording : startAudioRecording
                        }
                      >
                        {isRecording ? (
                          <StopCircle size={24} />
                        ) : (
                          <Mic size={24} />
                        )}
                        {isRecording ? "Stop Recording" : "Start Recording"}
                      </button>
                      {isRecording && (
                        <div className="recording-indicator">Recording...</div>
                      )}
                    </div>
                  ) : (
                    <div className="audio-preview">
                      <audio controls src={audioUrl} className="audio-player" />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setAudioUrl(null);
                          setAudioBlob(null);
                        }}
                      >
                        Record Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleReportSubmit}>
              <div className="form-group">
                <label className="form-label">Hazard Type</label>
                <select
                  className="form-select"
                  value={reportForm.type}
                  onChange={(e) =>
                    setReportForm((prev) => ({ ...prev, type: e.target.value }))
                  }
                  required
                >
                  <option value="">Select hazard type...</option>
                  {hazardTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {reportMethod === "text" && (
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={reportForm.description}
                    onChange={(e) =>
                      setReportForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe the hazard in detail..."
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-select"
                  value={reportForm.location}
                  onChange={(e) =>
                    setReportForm((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder={
                    location.hasLocation
                      ? `${location.latitude?.toFixed(
                          6
                        )}, ${location.longitude?.toFixed(6)}`
                      : "Enter location..."
                  }
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportMethod(null);
                    setCapturedPhoto(null);
                    setAudioUrl(null);
                    setAudioBlob(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    (reportMethod === "camera" && !capturedPhoto) ||
                    (reportMethod === "audio" && !audioBlob) ||
                    (reportMethod === "text" && !reportForm.description)
                  }
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SamudraAlertDashboard;
