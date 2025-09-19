export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface PostData {
  id: string;
  type: 'photo' | 'audio';
  content: string; // base64 for photo, blob URL for audio
  caption: string;
  location: LocationData | null;
  timestamp: number;
  duration?: number; // For audio posts
}

export interface CameraPermissions {
  camera: boolean;
  microphone: boolean;
  location: boolean;
}

export interface MediaCapture {
  photo?: string;
  audio?: {
    blob: Blob;
    url: string;
    duration: number;
  };
  caption: string;
  location: LocationData | null;
}