import React, { useState } from "react";
import type { PostData } from "../types";

interface PostPreviewProps {
  post: PostData | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (post: PostData) => void;
}

const PostPreview: React.FC<PostPreviewProps> = ({
  post,
  isOpen,
  onClose,
  onDelete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  if (!isOpen || !post) return null;

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const formatDuration = (duration: number) => {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handlePlayAudio = () => {
    if (post.type !== "audio") return;

    if (isPlaying) {
      audio?.pause();
      setIsPlaying(false);
    } else {
      const newAudio = new Audio(post.content);
      newAudio.onended = () => setIsPlaying(false);
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      onDelete(post);
      onClose();
    }
  };

  const handleShare = async () => {
    if (navigator.share && post.type === "photo") {
      try {
        // Convert base64 to blob for sharing
        const response = await fetch(post.content);
        const blob = await response.blob();
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });

        await navigator.share({
          title: "Shared Photo",
          text: post.caption || "Check out this photo!",
          files: [file],
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard or download
      if (post.type === "photo") {
        const link = document.createElement("a");
        link.href = post.content;
        link.download = `photo-${post.timestamp}.jpg`;
        link.click();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"
          aria-label="Close preview"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"
            aria-label="Share post"
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
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </button>

          <button
            onClick={handleDelete}
            className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center"
            aria-label="Delete post"
          >
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {post.type === "photo" ? (
          <img
            src={post.content}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        ) : (
          <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl p-8 max-w-sm w-full">
            <div className="text-center">
              <button
                onClick={handlePlayAudio}
                className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 active:scale-95 transition-transform"
              >
                {isPlaying ? (
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <p className="text-white text-lg font-medium mb-2">
                {post.duration ? formatDuration(post.duration) : "0:00"}
              </p>

              <p className="text-white/80 text-sm">
                {isPlaying ? "Playing..." : "Tap to play"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Post Details */}
      <div className="p-4 bg-black/80 backdrop-blur-sm border-t border-white/10">
        {post.caption && (
          <p className="text-white mb-3 text-center">{post.caption}</p>
        )}

        <div className="flex flex-col gap-2 text-sm text-white/60">
          <div className="flex items-center justify-center gap-4">
            <span>{formatTimestamp(post.timestamp)}</span>
            <span>•</span>
            <span className="capitalize">{post.type}</span>
          </div>

          {post.location && (
            <div className="flex items-center justify-center gap-1">
              <span>📍</span>
              <span>
                {post.location.latitude.toFixed(4)},{" "}
                {post.location.longitude.toFixed(4)}
              </span>
              <span className="text-xs">
                (±{Math.round(post.location.accuracy)}m)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostPreview;
