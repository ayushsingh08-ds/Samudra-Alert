import React, { useState, useRef, useEffect } from "react";
import { useCamera } from "../hooks/useCamera";
import { useGeolocation } from "../hooks/useGeolocation";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import Gallery from "./Gallery";
import PostPreview from "./PostPreview";
import type { PostData } from "../types";

const CameraView: React.FC = () => {
  const {
    videoRef,
    isLoading: cameraLoading,
    error: cameraError,
    flashEnabled,
    zoomLevel,
    switchCamera,
    capturePhoto,
    toggleFlash,
    setZoom,
  } = useCamera();

  const {
    latitude,
    longitude,
    accuracy,
    timestamp,
    isLoading: locationLoading,
    error: locationError,
    hasLocation,
  } = useGeolocation();

  const {
    isRecording,
    audioBlob,
    audioUrl,
    duration,
    error: audioError,
    startRecording,
    stopRecording,
    clearRecording,
  } = useAudioRecorder();

  const [caption, setCaption] = useState("");
  const [posts, setPosts] = useState<PostData[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<string>("none");

  const zoomRef = useRef<HTMLDivElement>(null);

  const filters = [
    { name: "none", label: "Normal", style: "filter: none" },
    { name: "grayscale", label: "B&W", style: "filter: grayscale(100%)" },
    { name: "sepia", label: "Sepia", style: "filter: sepia(100%)" },
    {
      name: "vintage",
      label: "Vintage",
      style: "filter: sepia(50%) contrast(1.2) brightness(1.1)",
    },
    {
      name: "cool",
      label: "Cool",
      style: "filter: hue-rotate(180deg) saturate(1.2)",
    },
    {
      name: "warm",
      label: "Warm",
      style: "filter: hue-rotate(25deg) saturate(1.3) brightness(1.1)",
    },
  ];

  const handleCapturePhoto = () => {
    const photoData = capturePhoto();
    if (!photoData) return;

    const locationData =
      hasLocation && latitude && longitude
        ? {
            latitude,
            longitude,
            accuracy: accuracy || 0,
            timestamp: timestamp || Date.now(),
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

    // Here you would typically send to backend
    console.log("Photo captured:", newPost);
  };

  const handleAudioToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (audioUrl) {
        clearRecording();
      }
      startRecording();
    }
  };

  const handleSaveAudio = () => {
    if (!audioBlob || !audioUrl) return;

    const locationData =
      hasLocation && latitude && longitude
        ? {
            latitude,
            longitude,
            accuracy: accuracy || 0,
            timestamp: timestamp || Date.now(),
          }
        : null;

    const newPost: PostData = {
      id: Date.now().toString(),
      type: "audio",
      content: audioUrl,
      caption,
      location: locationData,
      timestamp: Date.now(),
      duration,
    };

    setPosts((prev) => [newPost, ...prev]);
    setCaption("");
    clearRecording();

    // Here you would typically send to backend
    console.log("Audio saved:", newPost);
  };

  const handlePostSelect = (post: PostData) => {
    setSelectedPost(post);
    setShowPreview(true);
    setShowGallery(false);
  };

  const handleDeletePost = (postToDelete: PostData) => {
    setPosts((prev) => prev.filter((post) => post.id !== postToDelete.id));
  };

  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(event.target.value);
    setZoom(newZoom);
  };

  if (cameraLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading camera...</p>
        </div>
      </div>
    );
  }

  if (cameraError) {
    return (
      <div className="h-full flex items-center justify-center bg-black p-6">
        <div className="text-white text-center">
          <p className="text-red-400 mb-4">Camera Error:</p>
          <p className="text-sm">{cameraError}</p>
          <p className="text-xs mt-4 text-gray-400">
            Please allow camera access and refresh the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative bg-black overflow-hidden">
      {/* Camera Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{
          filter:
            filters
              .find((f) => f.name === currentFilter)
              ?.style.replace("filter: ", "") || "none",
        }}
      />

      {/* Top Overlay - Location & Switch Camera */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-start">
        {/* Location Display */}
        <div className="flex flex-col gap-2">
          {locationLoading && (
            <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-white/80">
              <span className="text-xs">📍 Getting location...</span>
            </div>
          )}

          {hasLocation && (
            <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-white/80">
              <span className="text-xs">
                📍 {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
              </span>
            </div>
          )}

          {locationError && (
            <div className="bg-red-500/20 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-white/80">
              <span className="text-xs">📍 Location unavailable</span>
            </div>
          )}
        </div>

        {/* Top Right Controls */}
        <div className="flex gap-2">
          {/* Flash Toggle */}
          <button
            onClick={toggleFlash}
            className={`w-12 h-12 rounded-full shadow-lg active:scale-95 transition-all duration-150 flex items-center justify-center ${
              flashEnabled
                ? "bg-yellow-400 text-black"
                : "bg-white/20 text-white"
            }`}
            aria-label="Toggle flash"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 2v11h3v9l7-12h-4l4-8z" />
            </svg>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-12 h-12 bg-white/20 rounded-full shadow-lg active:scale-95 transition-transform duration-150 flex items-center justify-center"
            aria-label="Settings"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {/* Switch Camera Button */}
          <button
            onClick={switchCamera}
            className="w-12 h-12 bg-white rounded-full shadow-lg active:scale-95 transition-transform duration-150 flex items-center justify-center"
            aria-label="Switch camera"
          >
            <svg
              className="w-5 h-5 text-black"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM15 15.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-20 right-4 bg-black/80 backdrop-blur-sm rounded-xl p-4 z-20 min-w-[200px]">
          <h3 className="text-white font-medium mb-3">Camera Settings</h3>

          {/* Zoom Control */}
          <div className="mb-4">
            <label className="text-white text-sm block mb-2">
              Zoom: {zoomLevel.toFixed(1)}x
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoomLevel}
              onChange={handleZoomChange}
              className="w-full accent-white"
            />
          </div>

          {/* Flash Status */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">Flash</span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  flashEnabled
                    ? "bg-yellow-400 text-black"
                    : "bg-gray-600 text-white"
                }`}
              >
                {flashEnabled ? "ON" : "OFF"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="w-full bg-white/20 text-white py-2 rounded-lg text-sm"
          >
            Close
          </button>
        </div>
      )}

      {/* Filter Selector */}
      <div className="absolute bottom-32 left-0 right-0 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.name}
              onClick={() => setCurrentFilter(filter.name)}
              className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                currentFilter === filter.name
                  ? "bg-white text-black"
                  : "bg-black/40 text-white backdrop-blur-sm"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
        {/* Text Input */}
        <div className="mb-6">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white placeholder-gray-300 border-none outline-none w-full"
            maxLength={200}
          />
        </div>

        {/* Camera Controls */}
        <div className="flex items-center justify-center gap-8">
          {/* Audio Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleAudioToggle}
              className={`w-16 h-16 bg-red-500 rounded-full shadow-lg active:scale-95 transition-transform duration-150 flex items-center justify-center ${
                isRecording ? "animate-pulse bg-red-600" : ""
              }`}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? (
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 6h12v12H6z" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
              )}
            </button>

            {/* Audio Status */}
            {isRecording && (
              <span className="text-xs text-red-400 animate-pulse">REC</span>
            )}

            {audioBlob && !isRecording && (
              <button
                onClick={handleSaveAudio}
                className="text-xs bg-green-500 px-2 py-1 rounded text-white"
              >
                Save Audio
              </button>
            )}
          </div>

          {/* Capture Photo Button */}
          <button
            onClick={handleCapturePhoto}
            className="w-20 h-20 bg-white rounded-full shadow-xl active:scale-95 transition-all duration-150 flex items-center justify-center relative after:content-[''] after:w-16 after:h-16 after:bg-red-500 after:rounded-full after:absolute"
            aria-label="Capture photo"
          />

          {/* Gallery/Posts Preview */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setShowGallery(true)}
              className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Open gallery"
            >
              {posts.length > 0 ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  {posts[0].type === "photo" ? (
                    <img
                      src={posts[0].content}
                      alt="Latest post"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-red-500 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {posts.length}
                  </div>
                </div>
              ) : (
                <svg
                  className="w-8 h-8 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
            <span className="text-xs text-white/60">Gallery</span>
          </div>
        </div>

        {/* Recording Duration */}
        {isRecording && (
          <div className="text-center mt-4">
            <span className="text-red-400 text-sm">
              Recording... {Math.floor(duration / 1000)}s
            </span>
          </div>
        )}

        {/* Error Messages */}
        {audioError && (
          <div className="mt-4 text-center">
            <span className="text-red-400 text-xs">{audioError}</span>
          </div>
        )}
      </div>

      {/* Gallery Modal */}
      <Gallery
        posts={posts}
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        onPostSelect={handlePostSelect}
      />

      {/* Post Preview Modal */}
      <PostPreview
        post={selectedPost}
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setSelectedPost(null);
        }}
        onDelete={handleDeletePost}
      />
    </div>
  );
};

export default CameraView;
