const bcrypt = require('bcrypt');

exports.getPersonnel = async (req, res) => {
  try {
    const prisma = req.prisma;

    const personnel = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'EMPLOYEE'] }
      },
      include: {
        employmentRecord: true,
        workspaceMembers: {
          include: {
            workspace: { select: { id: true, name: true } }
          }
        },
        assignedLeads: {
          select: { id: true, status: true }
        },
        assignedTasks: {
          where: { status: { not: 'DONE' } },
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const formatted = personnel.map(p => ({
      id: p.id,
      fullName: p.fullName,
      email: p.email,
      role: p.role,
      country: p.country,
      employment: p.employmentRecord || {
        jobTitle: p.role === 'ADMIN' ? 'Executive Director' : 'Talent Specialist',
        department: 'TALENT_MANAGEMENT',
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        baseSalary: p.role === 'ADMIN' ? 120000 : 75000,
        currency: 'INR'
      },
      workspaces: p.workspaceMembers.map(wm => wm.workspace),
      openLeadsCount: p.assignedLeads.filter(l => !['SIGNED', 'REJECTED'].includes(l.status)).length,
      activeTasksCount: p.assignedTasks.length,
      createdAt: p.createdAt,
    }));

    res.json({ success: true, personnel: formatted });
  } catch (err) {
    console.error('Error fetching personnel:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch personnel roster' });
  }
};

exports.updateEmploymentRecord = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { userId } = req.params;
    const { jobTitle, department, employmentType, status, baseSalary, currency } = req.body;

    const updated = await prisma.employmentRecord.upsert({
      where: { userId },
      update: {
        jobTitle,
        department,
        employmentType,
        status,
        baseSalary: baseSalary !== undefined ? parseFloat(baseSalary) : undefined,
        currency,
      },
      create: {
        userId,
        jobTitle: jobTitle || 'Talent Specialist',
        department: department || 'TALENT_MANAGEMENT',
        employmentType: employmentType || 'FULL_TIME',
        status: status || 'ACTIVE',
        baseSalary: baseSalary !== undefined ? parseFloat(baseSalary) : 75000,
        currency: currency || 'INR',
      }
    });

    if (req.io) {
      req.io.to('admin_room').emit('telemetry:log', {
        type: 'PERSONNEL_UPDATED',
        message: `Personnel record updated for user ${userId.slice(0, 8)} (${updated.jobTitle} - ₹${updated.baseSalary})`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ success: true, employmentRecord: updated });
  } catch (err) {
    console.error('Error updating employment record:', err);
    res.status(500).json({ success: false, message: 'Failed to update employment record' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { fullName, email, password, role, jobTitle, department, baseSalary } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password || 'Password123!', 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: passwordHash,
        role: role || 'EMPLOYEE',
        employmentRecord: {
          create: {
            jobTitle: jobTitle || 'Talent Specialist',
            department: department || 'TALENT_MANAGEMENT',
            employmentType: 'FULL_TIME',
            status: 'ACTIVE',
            baseSalary: baseSalary ? parseFloat(baseSalary) : 75000,
            currency: 'INR',
          }
        }
      },
      include: {
        employmentRecord: true
      }
    });

    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ success: false, message: 'Failed to create employee' });
  }
};
