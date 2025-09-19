import { useState, useRef } from 'react';

interface AudioState {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  isLoading: boolean;
  error: string | null;
  duration: number;
}

export const useAudioRecorder = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  
  const [audioState, setAudioState] = useState<AudioState>({
    isRecording: false,
    audioBlob: null,
    audioUrl: null,
    isLoading: false,
    error: null,
    duration: 0
  });

  const startRecording = async () => {
    try {
      setAudioState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      chunksRef.current = [];
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = Date.now() - startTimeRef.current;
        
        setAudioState(prev => ({
          ...prev,
          isRecording: false,
          audioBlob,
          audioUrl,
          duration,
          isLoading: false
        }));
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      startTimeRef.current = Date.now();
      
      setAudioState(prev => ({
        ...prev,
        isRecording: true,
        isLoading: false,
        audioBlob: null,
        audioUrl: null,
        duration: 0
      }));
      
    } catch (error) {
      console.error('Error starting audio recording:', error);
      setAudioState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to start recording'
      }));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && audioState.isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const clearRecording = () => {
    if (audioState.audioUrl) {
      URL.revokeObjectURL(audioState.audioUrl);
    }
    
    setAudioState(prev => ({
      ...prev,
      audioBlob: null,
      audioUrl: null,
      duration: 0,
      error: null
    }));
  };

  const playRecording = () => {
    if (audioState.audioUrl) {
      const audio = new Audio(audioState.audioUrl);
      audio.play();
    }
  };

  return {
    ...audioState,
    startRecording,
    stopRecording,
    clearRecording,
    playRecording
  };
};