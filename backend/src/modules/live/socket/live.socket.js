const ffmpegService = require('../services/ffmpeg.service');

module.exports = (io) => {
  const liveNamespace = io.of('/live');

  liveNamespace.on('connection', (socket) => {
    console.log('Client connected to Live Namespace:', socket.id);

    // Join a specific room for a stream session
    socket.on('join-session', (sessionId) => {
      socket.join(`session_${sessionId}`);
      console.log(`Socket ${socket.id} joined session ${sessionId}`);
    });

    // Receive WebM chunks from browser and feed to FFmpeg
    socket.on('stream-data', (data) => {
      const { sessionId, chunk } = data;
      ffmpegService.feedData(sessionId, chunk);
    });

    // Handle stream status updates
    socket.on('stream-health', (data) => {
      const { sessionId, fps, bitrate, droppedFrames } = data;
      // Broadcast to analytics dashboard
      liveNamespace.to(`session_${sessionId}`).emit('metrics-update', { fps, bitrate, droppedFrames });
    });

    socket.on('chat-message', (data) => {
      const { sessionId, message, user } = data;
      // Broadcast chat message to all viewers in the room
      liveNamespace.to(`session_${sessionId}`).emit('chat-message', { message, user, timestamp: new Date() });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from Live Namespace:', socket.id);
    });
  });

  // Listen to FFmpeg events
  ffmpegService.on('start', ({ sessionId }) => {
    liveNamespace.to(`session_${sessionId}`).emit('stream-started');
  });

  ffmpegService.on('error', ({ sessionId, error }) => {
    liveNamespace.to(`session_${sessionId}`).emit('stream-error', { error: error.message });
  });

  ffmpegService.on('end', ({ sessionId }) => {
    liveNamespace.to(`session_${sessionId}`).emit('stream-ended');
  });
};
