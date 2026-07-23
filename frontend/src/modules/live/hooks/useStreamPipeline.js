import { useEffect, useRef, useCallback } from 'react';
import useLiveStore from '../store/useLiveStore';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

export const useStreamPipeline = () => {
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  
  const { sessionId, setStream, stream, setMediaRecorder, setBroadcastStatus, updateMetrics } = useLiveStore();

  useEffect(() => {
    socketRef.current = io(`${SOCKET_URL}/live`, { withCredentials: true });
    socketRef.current.on('connect', () => {
      if (sessionId) socketRef.current.emit('join-session', sessionId);
    });
    socketRef.current.on('stream-started', () => setBroadcastStatus('live'));
    socketRef.current.on('stream-ended', () => setBroadcastStatus('ended'));
    socketRef.current.on('stream-error', () => setBroadcastStatus('error'));
    socketRef.current.on('metrics-update', (data) => updateMetrics(data));

    return () => socketRef.current?.disconnect();
  }, [sessionId]);

  const initCamera = useCallback(async (deviceId = null) => {
    try {
      const constraints = { video: deviceId ? { deviceId: { exact: deviceId }, width: 1920, height: 1080 } : { width: 1920, height: 1080 }, audio: true };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      return mediaStream;
    } catch (error) { console.error(error); throw error; }
  }, [setStream]);

  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: 'always' }, audio: true });
      setStream(screenStream);
      return screenStream;
    } catch (error) { console.error(error); throw error; }
  }, [setStream]);

  const startStreaming = useCallback(async () => {
    if (!stream || !sessionId) return;
    const options = { mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=h264,opus') ? 'video/webm;codecs=h264,opus' : 'video/webm;codecs=vp8,opus' };
    const recorder = new MediaRecorder(stream, { ...options, videoBitsPerSecond: 4000000 });

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0 && socketRef.current?.connected) {
        socketRef.current.emit('stream-data', { sessionId, chunk: e.data });
      }
    };
    recorder.start(1000);
    setMediaRecorder(recorder);
    setBroadcastStatus('starting');
  }, [stream, sessionId, setMediaRecorder, setBroadcastStatus]);

  const stopStreaming = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
    setBroadcastStatus('ending');
  }, [setBroadcastStatus]);

  return { initCamera, startScreenShare, startStreaming, stopStreaming };
};
