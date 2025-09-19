import React, { useState } from "react";
import { useCamera } from "../hooks/useCamera";
import { useGeolocation } from "../hooks/useGeolocation";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import type { PostData } from "../types";

const CameraViewSimple: React.FC = () => {
  const {
    videoRef,
    isLoading: cameraLoading,
    error: cameraError,
    switchCamera,
    capturePhoto,
  } = useCamera();

  const { latitude, longitude, hasLocation } = useGeolocation();

  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

  const [caption, setCaption] = useState("");
  const [posts, setPosts] = useState<PostData[]>([]);

  const handleCapturePhoto = () => {
    const photoData = capturePhoto();
    if (!photoData) return;

    const locationData =
      hasLocation && latitude && longitude
        ? {
            latitude,
            longitude,
            accuracy: 0,
            timestamp: Date.now(),
          }
        : null;

    const newPost: PostData = {
      id: Date.now().toString(),
      type: "photo",
      content: photoData,
      caption,
      location: locationData,
      timestamp: Date.now(),
    };

    setPosts((prev) => [newPost, ...prev]);
    setCaption("");
    console.log("Photo captured:", newPost);
  };

  const handleAudioToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (cameraLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          color: "white",
          textAlign: "center",
        }}
      >
        <div>
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "2px solid white",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          ></div>
          <p>Loading camera...</p>
        </div>
      </div>
    );
  }

  if (cameraError) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          color: "white",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div>
          <p style={{ color: "#ef4444", marginBottom: "16px" }}>
            Camera Error:
          </p>
          <p style={{ fontSize: "14px" }}>{cameraError}</p>
          <p style={{ fontSize: "12px", marginTop: "16px", color: "#9ca3af" }}>
            Please allow camera access and refresh the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        position: "relative",
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      {/* Camera Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Top Overlay - Location & Switch Camera */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "16px",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {/* Location Display */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {hasLocation && (
            <div
              style={{
                backgroundColor: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(8px)",
                borderRadius: "8px",
                padding: "4px 12px",
                fontSize: "12px",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              📍 {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
            </div>
          )}
        </div>

        {/* Switch Camera Button */}
        <button
          onClick={switchCamera}
          style={{
            width: "48px",
            height: "48px",
            backgroundColor: "white",
            borderRadius: "50%",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "transform 0.15s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <svg
            style={{ width: "20px", height: "20px", color: "black" }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM15 15.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z" />
          </svg>
        </button>
      </div>

      {/* Bottom Controls */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "24px",
          background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
        }}
      >
        {/* Text Input */}
        <div style={{ marginBottom: "24px" }}>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            style={{
              backgroundColor: "rgba(0,0,0,0.2)",
              backdropFilter: "blur(8px)",
              borderRadius: "12px",
              padding: "8px 16px",
              color: "white",
              border: "none",
              outline: "none",
              width: "100%",
              fontSize: "16px",
            }}
            maxLength={200}
          />
        </div>

        {/* Camera Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "32px",
          }}
        >
          {/* Audio Button */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <button
              onClick={handleAudioToggle}
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: isRecording ? "#dc2626" : "#ef4444",
                borderRadius: "50%",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                animation: isRecording ? "pulse 2s infinite" : "none",
              }}
            >
              {isRecording ? (
                <svg
                  style={{ width: "24px", height: "24px", color: "white" }}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 6h12v12H6z" />
                </svg>
              ) : (
                <svg
                  style={{ width: "24px", height: "24px", color: "white" }}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
              )}
            </button>

            {isRecording && (
              <span style={{ fontSize: "12px", color: "#ef4444" }}>REC</span>
            )}
          </div>

          {/* Capture Photo Button */}
          <button
            onClick={handleCapturePhoto}
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "white",
              borderRadius: "50%",
              boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#ef4444",
                borderRadius: "50%",
              }}
            ></div>
          </button>

          {/* Gallery Preview */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "white" }}>
                {posts.length}
              </span>
            </div>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
              Posts
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default CameraViewSimple;
