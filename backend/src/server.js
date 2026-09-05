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
const workspaceRoutes = require('./routes/workspaceRoutes');
const taskRoutes = require('./routes/taskRoutes');
const leadRoutes = require('./routes/leadRoutes');
const personnelRoutes = require('./routes/personnelRoutes');
const onboardingRoutes = require('./routes/onboardingRoutes');
const hrRoutes = require('./routes/hrRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const commissionRoutes = require('./routes/commissionRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const crmRoutes = require('./routes/crmRoutes');
const auditRoutes = require('./routes/auditRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const auditionRoutes = require('./routes/auditionRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const legalRoutes = require('./routes/legalRoutes');
const franchiseRoutes = require('./routes/franchiseRoutes');
const offerLetterRoutes = require('./routes/offerLetterRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const githubRoutes = require('./routes/githubRoutes');
const caseStudyRoutes = require('./routes/caseStudyRoutes');
const enterpriseSocket = require('./sockets/enterprise');
const { initOverdueCron } = require('./cron/overdueCron');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

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
app.set('socketio', io);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://elvooriq.com',
  'https://www.elvooriq.com'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      origin.endsWith('.vercel.app') ||
      origin.includes('elvooriq.com') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
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
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/employee/tasks', taskRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/personnel', personnelRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/commission', commissionRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auditions', auditionRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/franchise', franchiseRoutes);
app.use('/api/hr/onboarding', offerLetterRoutes);
app.use('/api/hr', complianceRoutes);
app.use('/api/candidate', offerLetterRoutes);
app.use('/api/candidate', complianceRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/case-studies', caseStudyRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

  // Client joins their partner request room
  socket.on('partner_request:join', (data) => {
    if (data && data.requestId) {
      socket.join('partner_request_' + data.requestId);
      console.log(`Client joined room for partner request: partner_request_${data.requestId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Initialize Live Socket Namespace, Enterprise Socket & Automated Cron
liveSocket(io);
enterpriseSocket(io);
initOverdueCron(io);

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
        await pg.initialise().catch(() => { });
        await pg.start().catch(() => { });
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
