exports.getWorkspaces = async (req, res) => {
  try {
    const prisma = req.prisma;
    const workspaces = await prisma.workspace.findMany({
      include: {
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, role: true, platform: true }
            }
          }
        },
        leads: {
          select: { id: true, status: true, score: true }
        },
        tasks: {
          select: { id: true, status: true, priority: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = workspaces.map(ws => {
      const leadMember = ws.members.find(m => m.role === 'LEAD') || ws.members.find(m => m.user.role === 'EMPLOYEE');
      const streamers = ws.members.filter(m => m.user.role === 'CREATOR');
      return {
        id: ws.id,
        name: ws.name,
        description: ws.description,
        assignedAgent: leadMember ? leadMember.user : null,
        totalMembers: ws.members.length,
        streamersCount: streamers.length,
        leadPipelineCount: ws.leads.length,
        openTasksCount: ws.tasks.filter(t => t.status !== 'DONE').length,
        tasks: ws.tasks,
        members: ws.members,
        createdAt: ws.createdAt,
      };
    });

    res.json({ success: true, workspaces: formatted });
  } catch (err) {
    console.error('Error fetching workspaces:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch workspaces' });
  }
};

exports.getWorkspaceById = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, role: true, platform: true }
            }
          }
        },
        leads: {
          include: {
            agent: { select: { id: true, fullName: true } }
          },
          orderBy: { score: 'desc' }
        },
        tasks: {
          include: {
            assignee: { select: { id: true, fullName: true } },
            creator: { select: { id: true, fullName: true } },
            workLogs: true,
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    res.json({ success: true, workspace });
  } catch (err) {
    console.error('Error fetching workspace:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch workspace' });
  }
};

exports.createWorkspace = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { name, description, agentId } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Workspace name is required' });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
      }
    });

    if (agentId) {
      await prisma.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: agentId,
          role: 'LEAD',
        }
      });
    }

    if (req.io) {
      req.io.to('admin_room').emit('telemetry:log', {
        type: 'WORKSPACE_CREATED',
        message: `New Workspace created: "${workspace.name}"`,
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json({ success: true, workspace });
  } catch (err) {
    console.error('Error creating workspace:', err);
    res.status(500).json({ success: false, message: 'Failed to create workspace' });
  }
};

exports.updateWorkspace = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;
    const { name, description } = req.body;

    const updated = await prisma.workspace.update({
      where: { id },
      data: { name, description }
    });

    res.json({ success: true, workspace: updated });
  } catch (err) {
    console.error('Error updating workspace:', err);
    res.status(500).json({ success: false, message: 'Failed to update workspace' });
  }
};

exports.deleteWorkspace = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;

    await prisma.workspace.delete({ where: { id } });
    res.json({ success: true, message: 'Workspace deleted successfully' });
  } catch (err) {
    console.error('Error deleting workspace:', err);
    res.status(500).json({ success: false, message: 'Failed to delete workspace' });
  }
};
