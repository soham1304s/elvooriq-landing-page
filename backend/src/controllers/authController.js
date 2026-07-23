const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
    const { 
      sessionId,
      email: directEmail,
      reg_password: directPassword,
      fullName: directName,
      whatsapp: directWhatsapp,
      platform: directPlatform,
      age: directAge,
      country: directCountry,
      experience: directExperience,
      social_url: directSocialUrl,
      bio: directBio
    } = req.body;
    
    const prisma = req.prisma;
    
    let email, reg_password, fullName, whatsapp, platform, age, country, experience, social_url, bio;

    if (sessionId) {
      const session = await prisma.authenticationSession.findUnique({ 
        where: { sessionId } 
      });
      
      if (!session) {
        return res.status(400).json({ success: false, message: 'Invalid or expired session' });
      }
      ({ 
        email, reg_password, fullName, whatsapp, platform, age, country, experience, social_url, bio 
      } = session.answers);

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
    }

    if (!email || !reg_password || !fullName) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(reg_password, salt);

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
        bio
      }
    });


    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    const userResponse = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      platform: newUser.platform
    };

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
    res.status(500).json({ success: false, message: 'Server error during registration' });
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
      loginEmail = session.answers.login_email;
      loginPassword = session.answers.login_password;

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
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ 
      where: { email: loginEmail } 
    });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(loginPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    const userResponse = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      platform: user.platform
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
      token,
      user: userResponse
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
