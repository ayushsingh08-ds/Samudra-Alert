import React from "react";
import type { PostData } from "../types";

interface GalleryProps {
  posts: PostData[];
  isOpen: boolean;
  onClose: () => void;
  onPostSelect: (post: PostData) => void;
}

const Gallery: React.FC<GalleryProps> = ({
  posts,
  isOpen,
  onClose,
  onPostSelect,
}) => {
  if (!isOpen) return null;

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const formatDuration = (duration: number) => {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
        <h2 className="text-white text-lg font-semibold">
          Gallery ({posts.length})
        </h2>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"
          aria-label="Close gallery"
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
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/60">
            <svg
              className="w-16 h-16 mb-4"
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
            <p className="text-center">No posts yet</p>
            <p className="text-sm text-center mt-2">
              Capture photos or record audio to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform transition-transform active:scale-95"
                onClick={() => onPostSelect(post)}
              >
                {post.type === "photo" ? (
                  <div className="relative w-full h-full">
                    <img
                      src={post.content}
                      alt="Captured photo"
                      className="w-full h-full object-cover"
                    />
                    {post.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                        <p className="text-white text-xs truncate">
                          {post.caption}
                        </p>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full bg-gradient-to-br from-red-500 to-red-700 flex flex-col items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white mb-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                    </svg>
                    <span className="text-white text-xs font-medium">
                      {post.duration ? formatDuration(post.duration) : "0:00"}
                    </span>
                    {post.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                        <p className="text-white text-xs truncate">
                          {post.caption}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Location indicator */}
                {post.location && (
                  <div className="absolute top-2 left-2">
                    <span className="text-xs text-white bg-black/60 rounded px-1">
                      📍
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Info */}
      {posts.length > 0 && (
        <div className="p-4 bg-black/80 backdrop-blur-sm border-t border-white/10">
          <p className="text-white/60 text-sm text-center">
            Tap any item to view details
          </p>
        </div>
      )}
    </div>
  );
};

export default Gallery;
