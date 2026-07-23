import { create } from 'zustand';

const useLiveStore = create((set, get) => ({
  sessionId: null,
  youtubeConnected: false,
  broadcastStatus: 'idle',
  
  stream: null,
  mediaRecorder: null,
  videoEnabled: true,
  audioEnabled: true,
  screenSharing: false,
  selectedCamera: 'default',
  selectedMic: 'default',

  title: 'My Awesome Live Stream',
  description: 'Streaming from Elvooriq Live Studio',
  category: 'Education',
  visibility: 'public',
  latencyMode: 'normal',

  metrics: { viewers: 0, likes: 0, fps: 0, bitrate: 0, droppedFrames: 0, cpuUsage: 0, memoryUsage: 0 },
  streamHealth: 'Excellent',

  setSessionId: (id) => set({ sessionId: id }),
  setYouTubeConnected: (status) => set({ youtubeConnected: status }),
  setBroadcastStatus: (status) => set({ broadcastStatus: status }),
  setStream: (stream) => set({ stream }),
  setMediaRecorder: (recorder) => set({ mediaRecorder: recorder }),
  
  toggleVideo: () => {
    const { stream, videoEnabled } = get();
    if (stream) stream.getVideoTracks().forEach(track => track.enabled = !videoEnabled);
    set({ videoEnabled: !videoEnabled });
  },
  toggleAudio: () => {
    const { stream, audioEnabled } = get();
    if (stream) stream.getAudioTracks().forEach(track => track.enabled = !audioEnabled);
    set({ audioEnabled: !audioEnabled });
  },
  setScreenSharing: (sharing) => set({ screenSharing: sharing }),
  
  updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
  updateMetrics: (newMetrics) => set((state) => ({ metrics: { ...state.metrics, ...newMetrics } })),
  setStreamHealth: (health) => set({ streamHealth: health }),

  resetStore: () => set({
    sessionId: null, broadcastStatus: 'idle', stream: null, mediaRecorder: null,
    videoEnabled: true, audioEnabled: true, screenSharing: false,
    metrics: { viewers: 0, likes: 0, fps: 0, bitrate: 0, droppedFrames: 0, cpuUsage: 0, memoryUsage: 0 },
    streamHealth: 'Excellent',
  })
}));

export default useLiveStore;
