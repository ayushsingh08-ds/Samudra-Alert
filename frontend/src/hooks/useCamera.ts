import { useRef, useState, useEffect } from 'react';

interface CameraState {
  stream: MediaStream | null;
  isLoading: boolean;
  error: string | null;
  facingMode: 'user' | 'environment';
  flashEnabled: boolean;
  zoomLevel: number;
}

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraState, setCameraState] = useState<CameraState>({
    stream: null,
    isLoading: true,
    error: null,
    facingMode: 'environment', // Default to back camera
    flashEnabled: false,
    zoomLevel: 1
  });

  const startCamera = async (facingMode: 'user' | 'environment' = 'environment') => {
    try {
      setCameraState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Stop existing stream if any
      if (cameraState.stream) {
        cameraState.stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraState(prev => ({
        ...prev,
        stream,
        isLoading: false,
        error: null,
        facingMode
      }));

    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to access camera'
      }));
    }
  };

  const switchCamera = () => {
    const newFacingMode = cameraState.facingMode === 'user' ? 'environment' : 'user';
    startCamera(newFacingMode);
  };

  const capturePhoto = (): string | null => {
    if (!videoRef.current || !cameraState.stream) return null;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const toggleFlash = async () => {
    if (!cameraState.stream) return;
    
    try {
      const track = cameraState.stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !cameraState.flashEnabled } as any]
        });
        setCameraState(prev => ({ ...prev, flashEnabled: !prev.flashEnabled }));
      }
    } catch (error) {
      console.error('Flash not supported:', error);
    }
  };

  const setZoom = async (zoomLevel: number) => {
    if (!cameraState.stream) return;
    
    try {
      const track = cameraState.stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      
      if (capabilities.zoom) {
        const clampedZoom = Math.max(capabilities.zoom.min, Math.min(capabilities.zoom.max, zoomLevel));
        await track.applyConstraints({
          advanced: [{ zoom: clampedZoom } as any]
        });
        setCameraState(prev => ({ ...prev, zoomLevel: clampedZoom }));
      }
    } catch (error) {
      console.error('Zoom not supported:', error);
    }
  };

  const stopCamera = () => {
    if (cameraState.stream) {
      cameraState.stream.getTracks().forEach(track => track.stop());
      setCameraState(prev => ({ ...prev, stream: null }));
    }
  };

  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    ...cameraState,
    startCamera,
    switchCamera,
    capturePhoto,
    stopCamera,
    toggleFlash,
    setZoom
  };
};