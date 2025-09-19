import React, { useState, useRef } from "react";
import {
  AlertTriangle,
  Waves,
  MapPin,
  X,
  Bell,
  Compass,
  Camera,
  Mic,
  Keyboard,
  StopCircle,
} from "lucide-react";

import { useGeolocation } from "../hooks/useGeolocation";
import CoastalMap from "../components/CoastalMap";
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

  // Mock Data - Map Alerts (converted from officialAlerts for map display)
  const mapAlerts = officialAlerts.map((alert, index) => ({
    id: alert.id,
    type: alert.type,
    title: alert.title,
    lat: 19.076 + (index - 1) * 0.01, // Spread around Mumbai coast
    lng: 72.8777 + (index - 1) * 0.015,
  }));

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

  // Device detection function
  const isMobileDevice = () => {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      (navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2 &&
        /MacIntel/.test(navigator.platform))
    );
  };

  // Direct camera access for scan button
  const handleScanButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Show loading state
    setShowReportModal(true);
    setReportMethod("camera");

    try {
      // Determine camera facing mode based on device
      const facingMode = isMobileDevice() ? "environment" : "user";

      console.log(
        `🎥 Opening ${facingMode} camera for ${
          isMobileDevice() ? "mobile" : "desktop"
        } device`
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.classList.add("active");
        videoRef.current.play(); // Ensure video starts playing
      }

      // Auto-populate location if available
      if (location.hasLocation) {
        const coordinates = `${location.latitude?.toFixed(
          6
        )}, ${location.longitude?.toFixed(6)}`;
        setReportForm((prev) => ({
          ...prev,
          location: coordinates,
        }));
      }

      console.log("✅ Camera started successfully");
    } catch (error) {
      console.error("❌ Error accessing camera:", error);

      // Close modal on error
      closeReportModal();

      // Provide user-friendly error messages
      let errorMessage = "Unable to access camera. ";
      if (error instanceof DOMException) {
        switch (error.name) {
          case "NotAllowedError":
            errorMessage +=
              "Please allow camera access in your browser settings.";
            break;
          case "NotFoundError":
            errorMessage += "No camera found on this device.";
            break;
          case "NotSupportedError":
            errorMessage += "Camera not supported on this device.";
            break;
          case "OverconstrainedError":
            errorMessage +=
              "Camera constraints not supported. Trying with basic settings...";
            // Try with simpler constraints
            try {
              const fallbackFacing = isMobileDevice() ? "environment" : "user";
              const fallbackStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: fallbackFacing },
                audio: false,
              });

              if (videoRef.current) {
                videoRef.current.srcObject = fallbackStream;
                videoRef.current.classList.add("active");
                videoRef.current.play();
              }

              setShowReportModal(true);
              setReportMethod("camera");
              return; // Success with fallback
            } catch (fallbackError) {
              errorMessage += " Fallback also failed.";
            }
            break;
          default:
            errorMessage +=
              "Please check your camera permissions and try again.";
        }
      }

      alert(errorMessage);
    }
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

  // Camera cleanup function
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      videoRef.current.classList.remove("active");
    }
  };

  // Enhanced modal close function
  const closeReportModal = () => {
    stopCamera(); // Stop camera when closing modal
    setShowReportModal(false);
    setReportMethod(null);
    setCapturedPhoto(null);
    setAudioUrl(null);
    setAudioBlob(null);
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
      {/* Mobile App-Style Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="app-logo">
            <Waves size={20} />
          </div>
          <h1 className="app-title">Samudra Alert</h1>
        </div>

        <div className="header-profile">
          <button className="notification-btn">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          <div className="profile-avatar">SA</div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search marine incidents..."
            className="search-input"
          />
          <Compass className="search-icon" size={20} />
        </div>
      </div>

      {/* Main Content - ReCall Style */}
      <main className="main-content">
        {/* Gradient Stats Card */}
        <div className="stats-card">
          <div className="stats-content">
            <div className="stats-left">
              <div className="stats-icon">👑</div>
              <h3 className="stats-label">Alert Status</h3>
              <div className="stats-count">Active</div>
              <p className="stats-subtitle">
                Total Reports: {userReports.length}
              </p>
            </div>
            <div className="stats-right">
              <div className="stats-level">
                Level {Math.min(Math.floor(userReports.length / 5) + 1, 10)}
              </div>
              <p className="stats-level-label">(current)</p>
              <div className="stats-progress">
                <p className="stats-progress-label">Next Level</p>
                <p className="stats-progress-value">
                  {5 - (userReports.length % 5)} reports needed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="category-grid">
          <div className="category-card" onClick={handleReportButtonClick}>
            <div className="category-icon reports">
              <AlertTriangle size={24} />
            </div>
            <div className="category-content">
              <h4 className="category-title">New Report</h4>
              <p className="category-count">Report Hazard</p>
            </div>
          </div>

          <div className="category-card">
            <div className="category-icon alerts">
              <Bell size={24} />
            </div>
            <div className="category-content">
              <h4 className="category-title">Alerts</h4>
              <p className="category-count">{officialAlerts.length} Active</p>
            </div>
          </div>
        </div>

        {/* Interactive Map Section */}
        <div className="map-section">
          <div className="section-header">
            <h2 className="section-title">Live Marine Alerts Map</h2>
            <span className="section-subtitle">
              Real-time incident locations
            </span>
          </div>
          <div className="map-container">
            <CoastalMap
              alerts={mapAlerts}
              userLocation={
                location.hasLocation && location.latitude && location.longitude
                  ? {
                      latitude: location.latitude,
                      longitude: location.longitude,
                      accuracy: location.accuracy || undefined,
                    }
                  : null
              }
            />
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="section-header">
          <h2 className="section-title">Recent Marine Incidents</h2>
          <a href="#" className="section-link">
            All →
          </a>
        </div>

        <div className="incidents-list">
          {officialAlerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className="incident-item">
              <div
                className={`incident-icon ${
                  alert.type === "danger"
                    ? "oil-spill"
                    : alert.type === "warning"
                    ? "vessel-emergency"
                    : "marine-pollution"
                }`}
              >
                {alert.icon}
              </div>
              <div className="incident-content">
                <h4 className="incident-title">{alert.title}</h4>
                <div className="incident-meta">
                  <span>{formatTimestamp(alert.timestamp)}</span>
                  <span>Severity: {alert.severity}</span>
                </div>
              </div>
              <div className="incident-arrow">›</div>
            </div>
          ))}
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
        <div className="modal-overlay" onClick={closeReportModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {reportMethod === "camera"
                  ? "Photo Report"
                  : reportMethod === "audio"
                  ? "Audio Report"
                  : "Text Report"}
              </h2>
              <button className="modal-close" onClick={closeReportModal}>
                <X size={20} />
              </button>
            </div>

            {/* Camera Interface */}
            {reportMethod === "camera" && (
              <div className="camera-interface">
                {!capturedPhoto ? (
                  <div className="camera-view">
                    {/* Loading indicator when camera is initializing */}
                    {!videoRef.current?.srcObject && (
                      <div className="camera-loading">
                        <div className="camera-loading-spinner"></div>
                        <p>
                          Starting {isMobileDevice() ? "rear" : "front"}{" "}
                          camera...
                        </p>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            opacity: 0.7,
                            marginTop: "0.5rem",
                          }}
                        >
                          Please allow camera access when prompted
                        </p>
                      </div>
                    )}

                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="camera-video"
                    />
                    <canvas ref={canvasRef} style={{ display: "none" }} />

                    {/* Only show capture button when video is active */}
                    {videoRef.current?.srcObject && (
                      <button
                        type="button"
                        className="capture-btn"
                        onClick={capturePhoto}
                      >
                        <Camera size={24} />
                        Capture Photo
                      </button>
                    )}
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
                  onClick={closeReportModal}
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

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        <a href="#" className="nav-item scan" onClick={handleScanButtonClick}>
          <div className="nav-icon">📷</div>
          <span className="nav-label">Scan</span>
        </a>
      </nav>
    </div>
  );
};

export default SamudraAlertDashboard;
