const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { processAndRouteLead } = require('../modules/leadEngine');

exports.startSession = async (req, res) => {
  try {
    const { flowType, initialStep } = req.body;
    const prisma = req.prisma;
    
    // Create a unique session ID
    const sessionId = crypto.randomBytes(16).toString('hex');
    
    const newSession = await prisma.authenticationSession.create({
      data: {
        sessionId,
        flowType: flowType || 'login',
        currentStep: initialStep || 'email',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || ''
      }
    });

    res.status(201).json({
      success: true,
      sessionId: newSession.sessionId,
      message: 'Authentication session started'
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.saveProgress = async (req, res) => {
  try {
    const { sessionId, step, answers, progress } = req.body;
    const prisma = req.prisma;
    
    const session = await prisma.authenticationSession.findUnique({ 
      where: { sessionId }
    });
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session expired or not found' });
    }

    const answersString = typeof answers === 'object' ? JSON.stringify(answers) : (answers || '{}');

    await prisma.authenticationSession.update({
      where: { sessionId },
      data: {
        currentStep: step,
        answers: answersString,
        progress: progress
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.register = async (req, res) => {
  try {
    // Support both direct registration and legacy session-based flow
    const directName = req.body.fullName || req.body.name;
    const directPassword = req.body.password || req.body.reg_password;
    const directEmail = req.body.email;
    const directRole = req.body.role;
    const directWhatsapp = req.body.whatsapp;
    const directPlatform = req.body.platform;
    const directAge = req.body.age;
    const directCountry = req.body.country;
    const directExperience = req.body.experience;
    const directSocialUrl = req.body.socialUrl || req.body.social_url;
    const directBio = req.body.bio;
    const sessionId = req.body.sessionId;
    
    const prisma = req.prisma;
    
    let email, reg_password, fullName, whatsapp, platform, age, country, experience, social_url, bio, role;

    if (sessionId) {
      const session = await prisma.authenticationSession.findUnique({ 
        where: { sessionId } 
      });
      
      if (!session) {
        return res.status(400).json({ success: false, message: 'Invalid or expired session' });
      }
      const answers = typeof session.answers === 'string' ? JSON.parse(session.answers || '{}') : (session.answers || {});
      email = answers.email || answers.login_email;
      reg_password = answers.reg_password || answers.password || answers.login_password;
      fullName = answers.fullName || answers.name;
      whatsapp = answers.whatsapp;
      platform = answers.platform;
      age = answers.age;
      country = answers.country;
      experience = answers.experience;
      social_url = answers.social_url || answers.socialUrl;
      bio = answers.bio;
      role = answers.role;

      // Mark session complete
      await prisma.authenticationSession.update({
        where: { sessionId },
        data: { status: 'completed' }
      });
    } else {
      email = directEmail;
      reg_password = directPassword;
      fullName = directName;
      whatsapp = directWhatsapp;
      platform = directPlatform;
      age = directAge;
      country = directCountry;
      experience = directExperience;
      social_url = directSocialUrl;
      bio = directBio;
      role = directRole;
    }

    if (!email || !reg_password || !fullName) {
      return res.status(400).json({ success: false, message: 'Required parameters (name, email, password) are missing.' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'This email address is already registered on our platform.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(reg_password, salt);

    const targetedRole = ['ADMIN', 'EMPLOYEE', 'CREATOR'].includes(role) ? role : 'CREATOR';
    // Hardened Rule: Administrative profiles must default to PENDING & disabled status
    const shouldHoldApproval = ['ADMIN', 'EMPLOYEE'].includes(targetedRole);
    const initialStatus = shouldHoldApproval ? 'PENDING' : 'ACTIVE';
    const initialEnabled = !shouldHoldApproval; // Creators auto-enabled

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        whatsapp,
        platform,
        age: age ? parseInt(age) : null,
        country,
        experience,
        socialUrl: social_url,
        bio,
        role: targetedRole,
        status: initialStatus,
        isEnabled: initialEnabled
      }
    });

    const userResponse = {
      id: newUser.id,
      name: newUser.fullName,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      isEnabled: newUser.isEnabled,
      platform: newUser.platform
    };

    // If account is PENDING approval, do not issue active JWT session
    if (shouldHoldApproval || newUser.status !== 'ACTIVE' || !newUser.isEnabled) {
      if (req.io) {
        req.io.to('admin_room').emit('admin:user_registered', {
          ...userResponse,
          registeredAt: new Date().toISOString(),
          note: 'Requires Root Admin activation'
        });
      }

      return res.status(201).json({
        success: true,
        requiresApproval: true,
        message: "Registration received successfully. Your account is currently PENDING manual activation. A Root Admin must review and enable your access before you can log in.",
        user: userResponse
      });
    }

    // Generate JWT for activated accounts
    const token = jwt.sign(
      { id: newUser.id, name: newUser.fullName, email: newUser.email, role: newUser.role, status: newUser.status },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // Trigger High-Velocity Lead Intake & Workload-Aware Router
    processAndRouteLead(prisma, req.io, {
      fullName: newUser.fullName,
      email: newUser.email,
      whatsapp: newUser.whatsapp,
      platform: newUser.platform,
      socialUrl: newUser.socialUrl,
      followers: 10000,
      experience: newUser.experience,
      bio: newUser.bio,
    }).catch(err => console.error('Automated lead dispatch warning:', err.message));

    // Emit live login event to admins
    if (req.io) {
      req.io.to('admin_room').emit('admin:user_login', {
        ...userResponse,
        loginTime: new Date().toLocaleTimeString(),
        type: 'registration'
      });
    }

    res.status(201).json({
      success: true,
      message: "Registration completed successfully.",
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'P1001' || error.message?.includes("Can't reach database") || error.name === 'PrismaClientInitializationError') {
      return res.status(503).json({ 
        success: false, 
        message: 'Database offline: Please start PostgreSQL or configure DATABASE_URL in backend/.env' 
      });
    }
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    // Support both direct login (email/password) and session-based login (for legacy conversational flow)
    const { sessionId, email, password } = req.body;
    const prisma = req.prisma;
    
    let loginEmail, loginPassword;

    if (sessionId) {
      const session = await prisma.authenticationSession.findUnique({ 
        where: { sessionId } 
      });
      
      if (!session) {
        return res.status(400).json({ success: false, message: 'Invalid or expired session' });
      }
      const answers = typeof session.answers === 'string' ? JSON.parse(session.answers || '{}') : (session.answers || {});
      loginEmail = answers.login_email || answers.email;
      loginPassword = answers.login_password || answers.password;

      // Mark session complete
      await prisma.authenticationSession.update({
        where: { sessionId },
        data: { status: 'completed' }
      });
    } else {
      loginEmail = email;
      loginPassword = password;
    }

    if (!loginEmail || !loginPassword) {
      return res.status(400).json({ success: false, message: 'Both email and password are required.' });
    }

    const user = await prisma.user.findUnique({ 
      where: { email: loginEmail } 
    });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials entered.' });
    }

    const isMatch = await bcrypt.compare(loginPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials entered.' });
    }

    // Enterprise Gate: Manual activation validation
    if (!user.isEnabled || user.status !== 'ACTIVE') {
      if (user.status === 'PENDING') {
        return res.status(403).json({
          success: false,
          code: 'ACCOUNT_PENDING_APPROVAL',
          message: 'Account Pending Activation. A system administrator must review and manually enable your account before you can log in.',
          status: user.status,
          isEnabled: user.isEnabled
        });
      }
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_RESTRICTED',
        message: `Your account access has been restricted. [Account Status: ${user.status}]. Please contact your operations team.`,
        status: user.status,
        isEnabled: user.isEnabled
      });
    }

    // Extract Client Network Coordinates for GeoIP and Security Telemetry (v4.0)
    let geoip;
    try { geoip = require('geoip-lite'); } catch (e) {}
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const clientIp = rawIp.split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    const geo = (geoip && clientIp !== '127.0.0.1' && clientIp !== '::1' && clientIp !== 'localhost') ? geoip.lookup(clientIp) : null;
    const country = geo ? geo.country : 'IN';
    const city = geo ? geo.city : 'New Delhi';
    const locationString = `${city}, ${country}`;

    // Commit SecurityEvents Record
    try {
      await prisma.securityEvents.create({
        data: {
          userId: user.id,
          eventType: 'LOGIN',
          ip: clientIp,
          device: userAgent,
          country: country
        }
      });
    } catch (secErr) {
      console.warn('[SECURITY_LOG_WARNING] Could not commit security event:', secErr.message);
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.fullName, 
        fullName: user.fullName,
        email: user.email, 
        role: user.role,
        status: user.status 
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '12h' }
    );

    const userResponse = {
      id: user.id,
      name: user.fullName,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      isEnabled: user.isEnabled,
      platform: user.platform,
      clientLocation: locationString,
      networkTelemetry: {
        ip: clientIp,
        country,
        city,
        isGeoVerified: true
      }
    };

    // Emit live login event to admins
    if (req.io) {
      req.io.to('admin_room').emit('admin:user_login', {
        ...userResponse,
        loginTime: new Date().toLocaleTimeString(),
        type: 'login'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Authentication verified successfully.',
      token,
      user: userResponse,
      securityStatus: {
        active: true,
        geoIpLock: true,
        clientLocation: locationString,
        verified: true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error.code === 'P1001' || error.message?.includes("Can't reach database") || error.name === 'PrismaClientInitializationError') {
      return res.status(503).json({ 
        success: false, 
        message: 'Database offline: Please start PostgreSQL or configure DATABASE_URL in backend/.env' 
      });
    }
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const prisma = req.prisma;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        employmentRecord: true,
        receivedOffer: true,
        complianceDocs: true,
        workspaceMembers: {
          include: {
            workspace: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const verifiedDocsCount = (user.complianceDocs || []).filter(d => d.status === 'VERIFIED').length;
    const isOnboardingPending = user.role === 'EMPLOYEE' && (user.status === 'PENDING' || !user.isEnabled);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.fullName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        isEnabled: user.isEnabled,
        platform: user.platform,
        employment: user.employmentRecord,
        workspaces: user.workspaceMembers.map(wm => wm.workspace),
        receivedOffer: user.receivedOffer,
        complianceDocs: user.complianceDocs,
        verifiedDocsCount,
        isOnboardingPending
      }
    });
  } catch (err) {
    console.error('Error in getMe:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch current user session' });
  }
};
