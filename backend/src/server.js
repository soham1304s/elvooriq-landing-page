require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const featuredRoutes = require('./routes/featuredRoutes');
const adminRoutes = require('./routes/adminRoutes');
const creatorRoutes = require('./routes/creatorRoutes');
const talentRoutes = require('./routes/talentRoutes');
const liveRoutes = require('./modules/live/routes/live.routes');
const liveSocket = require('./modules/live/socket/live.socket');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);

// Socket.io setup for Phase 3
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Pass IO and Prisma instance to request object so controllers can use it
app.use((req, res, next) => {
  req.io = io;
  req.prisma = prisma;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/featured', featuredRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/talent', talentRoutes);

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Admin joins the admin room
  socket.on('admin:join', () => {
    socket.join('admin_room');
    console.log('Client joined admin room:', socket.id);
  });

  socket.on('auth:start', (data) => {
    // Broadcast to admin dashboard
    io.to('admin_room').emit('admin:auth_start', data);
  });

  socket.on('auth:progress', (data) => {
    io.to('admin_room').emit('admin:auth_progress', data);
  });

  socket.on('auth:success', (data) => {
    io.to('admin_room').emit('admin:auth_success', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Initialize Live Socket Namespace
liveSocket(io);

// Global Error Handler for debugging
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err);
  require('fs').appendFileSync('error.log', new Date().toISOString() + ' GLOBAL ERROR: ' + (err.stack || err) + '\n');
  res.status(500).json({ success: false, message: err.message });
});

// Server Initialization
let PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = Number(PORT) + 1;
    console.warn(`⚠️ Port ${PORT} is in use (EADDRINUSE). Retrying on fallback port ${fallbackPort}...`);
    PORT = fallbackPort;
    setTimeout(() => {
      server.listen(PORT, () => {
        console.log(`🚀 Server running on fallback port ${PORT}`);
      });
    }, 1000);
  } else {
    console.error('Server error:', err);
  }
});

const path = require('path');

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL Database via Prisma');
  } catch (error) {
    if (error.code === 'P1001' || error.message?.includes("Can't reach database")) {
      try {
        console.log('🔄 Starting user-space Embedded PostgreSQL instance...');
        const EmbeddedPostgres = require('embedded-postgres').default || require('embedded-postgres');
        const pg = new EmbeddedPostgres({
          port: 5432,
          databaseDir: path.join(__dirname, '../.pgdata'),
          user: 'postgres',
          password: 'postgres',
          initialDatabase: 'elvooriq_db',
          persistent: true
        });
        await pg.initialise().catch(() => {});
        await pg.start().catch(() => {});
        await prisma.$connect();
        console.log('✅ Connected to PostgreSQL Database via Embedded Postgres');
      } catch (embeddedErr) {
        console.warn('⚠️ Embedded Postgres start warning:', embeddedErr.message);
      }
    } else {
      console.warn('⚠️ Database connection warning:', error.message);
    }
  }

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

if (process.env.VERCEL) {
  // If running on Vercel, we need to export the app
  // Note: Socket.io will not work reliably on Vercel Serverless
  prisma.$connect().catch(console.error);
  module.exports = app;
} else {
  // Local or standard Node.js server deployment
  startServer();
}
