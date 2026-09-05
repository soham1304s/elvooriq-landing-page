const { sendLiveSMS } = require('../utils/smsSender');

/**
 * Enterprise Production Task Assignment Controller (v8.0 ACID Transaction)
 * Securely assigns a task to an employee and logs the initial workspace log in a single transaction.
 */
const createAndAssignTask = async (req, res) => {
  const prisma = req.prisma;
  const { title, description, priority, dueDate, assigneeId, workspaceId } = req.body;
  const creatorId = req.user.id; // Decoded from validated JWT

  if (!title || !assigneeId) {
    return res.status(400).json({ success: false, message: 'Task title and Assignee ID are required.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify the assignee is an active, enabled employee
      const employee = await tx.user.findFirst({
        where: { id: assigneeId, role: 'EMPLOYEE', status: 'ACTIVE' }
      });

      if (!employee) {
        throw new Error('Assignee must be an active, verified employee.');
      }

      // 2. Create the new task record
      const newTask = await tx.task.create({
        data: {
          title,
          description,
          priority: priority || 'MEDIUM',
          dueDate: dueDate ? new Date(dueDate) : null,
          creatorId,
          assigneeId,
          workspaceId: workspaceId || null,
          status: 'TODO',
          progressPercent: 0
        },
        include: {
          assignee: { select: { id: true, fullName: true, email: true } },
          creator: { select: { id: true, fullName: true, email: true } },
          workspace: { select: { id: true, name: true } }
        }
      });

      // 3. Log the task creation event in the daily work log
      const initialLog = await tx.dailyWorkLog.create({
        data: {
          userId: assigneeId,
          taskId: newTask.id,
          hoursSpent: 0.0,
          summary: `Task assigned by HR: "${title}"`,
          progressValue: 0
        }
      });

      return { newTask, initialLog };
    });

    if (req.io) {
      if (workspaceId) {
        req.io.to(`workspace-${workspaceId}`).emit('task:created', result.newTask);
      }
      req.io.to('admin_room').emit('telemetry:log', {
        type: 'TASK_ASSIGNED',
        message: `Task "${result.newTask.title}" assigned to employee`,
        timestamp: new Date().toISOString(),
        meta: { taskId: result.newTask.id, assigneeId }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Task assigned and logged successfully.',
      task: result.newTask,
      log: result.initialLog
    });

  } catch (error) {
    return res.status(422).json({
      success: false,
      message: 'Transaction failed. Task was not assigned.',
      error: error.message
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { workspaceId, assigneeId, status } = req.query;

    const where = {};
    if (workspaceId) where.workspaceId = workspaceId;

    // For employees querying their workspace portal, default to their own tasks unless admin overrides
    if (req.user?.role === 'EMPLOYEE' && !assigneeId) {
      where.assigneeId = req.user.id;
    } else if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, fullName: true, email: true } },
        creator: { select: { id: true, fullName: true } },
        workspace: { select: { id: true, name: true } },
        workLogs: {
          include: {
            user: { select: { id: true, fullName: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, tasks });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
};

const createTask = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { title, description, priority, dueDate, assigneeId, workspaceId } = req.body;
    const creatorId = req.user.id;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    if (assigneeId) {
      const activeEmployee = await prisma.user.findFirst({
        where: { id: assigneeId, status: 'ACTIVE', isEnabled: true }
      });
      if (!activeEmployee) {
        return res.status(404).json({ success: false, message: 'Assignee must be an active, verified Employee in our roster.' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        creatorId,
        assigneeId: assigneeId || creatorId,
        workspaceId,
        status: 'TODO',
        progressPercent: 0
      },
      include: {
        assignee: { select: { id: true, fullName: true, email: true } },
        creator: { select: { id: true, fullName: true, email: true } },
      }
    });

    if (req.io && workspaceId) {
      req.io.to(`workspace-${workspaceId}`).emit('task:created', task);
      req.io.to('admin_room').emit('telemetry:log', {
        type: 'TASK_CREATED',
        message: `Task "${task.title}" created in workspace`,
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json({ success: true, task });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const prisma = req.prisma;
    const id = req.params.id || req.params.taskId;
    const { status, originStatus } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        assignee: { select: { id: true, fullName: true } },
        workspace: { select: { id: true, name: true } },
      }
    });

    if (req.io) {
      if (task.workspaceId) {
        req.io.to(`workspace-${task.workspaceId}`).emit('task:status-updated', {
          taskId: task.id,
          originStatus: originStatus || 'PREVIOUS',
          targetStatus: status,
          updatedBy: req.user.fullName || req.user.id,
          timestamp: new Date().toISOString(),
        });
      }

      req.io.to('admin_room').emit('telemetry:log', {
        type: 'TASK_DRAG',
        message: `Task "${task.title.slice(0, 30)}" transitioned to ${status}`,
        timestamp: new Date().toISOString(),
        meta: { taskId: task.id, status }
      });
    }

    res.json({ success: true, task });
  } catch (err) {
    console.error('Error updating task status:', err);
    res.status(500).json({ success: false, message: 'Failed to update task status' });
  }
};

const updateProgress = async (req, res) => {
  try {
    const prisma = req.prisma;
    const id = req.params.id || req.params.taskId;
    const { progressPercent, hoursSpent, summary, blockers } = req.body;
    const userId = req.user.id;

    if (progressPercent === undefined || progressPercent === null) {
      return res.status(400).json({ success: false, message: 'Progress percentage (0-100) is required.' });
    }

    const currentTask = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: true,
        creator: true,
        workspace: true
      }
    });

    if (!currentTask) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (currentTask.assigneeId && currentTask.assigneeId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access Forbidden: You are not assigned to this task.' });
    }

    const numericProgress = Math.min(100, Math.max(0, parseInt(progressPercent, 10)));
    const now = new Date();

    const updateData = {
      progressPercent: numericProgress
    };

    let onTimeAlertDispatched = false;

    // If reaching 100%, mark as DONE and calculate on-time delivery
    if (numericProgress === 100) {
      updateData.status = 'DONE';
      if (!currentTask.deliveredAt) {
        updateData.deliveredAt = now;
      }
      
      const isOnTime = currentTask.dueDate ? now <= new Date(currentTask.dueDate) : true;
      updateData.isDeliveredOnTime = isOnTime;

      // Dispatch On-Time Delivery SMS to HR/Creator if not previously sent (v4.0 / v8.0)
      if (isOnTime && !currentTask.deliveryNotificationSent && currentTask.creator?.whatsapp) {
        const msg = `✅ [ELVOORIQ Success] Hi ${currentTask.creator.fullName || 'Admin'}, Employee ${currentTask.assignee?.fullName || req.user.fullName || 'Agent'} has completed task "${currentTask.title}" ON-TIME at ${now.toLocaleString()}.`;
        sendLiveSMS(currentTask.creator.whatsapp, msg).catch(err => console.error('SMS dispatch error:', err.message));

        updateData.deliveryNotificationSent = true;
        onTimeAlertDispatched = true;
      }
    } else if (numericProgress > 0 && currentTask.status === 'TODO') {
      updateData.status = 'IN_PROGRESS';
    }

    // Perform atomic transaction: update task and create daily worklog if hours/summary provided
    let createdLog = null;
    const updatedTask = await prisma.$transaction(async (tx) => {
      const taskRes = await tx.task.update({
        where: { id },
        data: updateData,
        include: {
          assignee: { select: { id: true, fullName: true, email: true } },
          creator: { select: { id: true, fullName: true } },
          workspace: { select: { id: true, name: true } }
        }
      });

      if (summary || (hoursSpent !== undefined && hoursSpent !== null)) {
        createdLog = await tx.dailyWorkLog.create({
          data: {
            userId,
            taskId: id,
            hoursSpent: hoursSpent ? parseFloat(hoursSpent) : 0,
            summary: summary || `Routine progress check-in updated to ${numericProgress}%`,
            blockers: blockers || null,
            progressValue: numericProgress
          },
          include: {
            user: { select: { id: true, fullName: true } }
          }
        });
      }

      return taskRes;
    });

    // Real-time broadcasts
    if (req.io) {
      if (updatedTask.workspaceId) {
        req.io.to(`workspace-${updatedTask.workspaceId}`).emit('task:progress-updated', {
          task: updatedTask,
          log: createdLog,
          updatedBy: req.user.fullName || req.user.name || req.user.id
        });
      }

      req.io.to('admin_room').emit('telemetry:log', {
        type: 'TASK_PROGRESS_COMMIT',
        message: `Task "${updatedTask.title.slice(0, 30)}" advanced to ${numericProgress}% by ${req.user.name || 'Agent'}`,
        timestamp: now.toISOString(),
        meta: { taskId: updatedTask.id, progressPercent: numericProgress, onTime: updatedTask.isDeliveredOnTime, onTimeAlertDispatched }
      });
    }

    return res.status(200).json({
      success: true,
      message: `Progress updated to ${numericProgress}%`,
      task: updatedTask,
      log: createdLog
    });
  } catch (err) {
    console.error('Error updating task progress:', err);
    return res.status(500).json({ success: false, message: 'Failed to update task progress', error: err.message });
  }
};

const submitWorkLog = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { taskId, hoursSpent, summary, blockers, targetStatus, progressValue } = req.body;
    const userId = req.user.id;

    if (!summary || hoursSpent === undefined) {
      return res.status(400).json({ success: false, message: 'Summary and hours spent are required' });
    }

    // 1. Create work log entry
    const log = await prisma.dailyWorkLog.create({
      data: {
        userId,
        taskId: taskId || null,
        hoursSpent: parseFloat(hoursSpent) || 0,
        summary,
        blockers: blockers || null,
        progressValue: progressValue !== undefined ? parseInt(progressValue, 10) : null
      },
      include: {
        user: { select: { id: true, fullName: true } }
      }
    });

    // 2. Optionally update task status and progress
    let updatedTask = null;
    if (taskId) {
      const taskUpdateData = {};
      if (targetStatus) taskUpdateData.status = targetStatus;
      if (progressValue !== undefined) taskUpdateData.progressPercent = Math.min(100, Math.max(0, parseInt(progressValue, 10)));
      if (targetStatus === 'DONE' || progressValue === 100) {
        taskUpdateData.deliveredAt = new Date();
      }

      if (Object.keys(taskUpdateData).length > 0) {
        updatedTask = await prisma.task.update({
          where: { id: taskId },
          data: taskUpdateData,
          include: {
            assignee: { select: { id: true, fullName: true } },
            workspace: { select: { id: true } }
          }
        });
      }
    }

    // 3. Emit real-time telemetry
    if (req.io) {
      const workspaceId = updatedTask?.workspace?.id;
      if (workspaceId) {
        req.io.to(`workspace-${workspaceId}`).emit('task:log-submitted', {
          log,
          task: updatedTask,
        });
      }

      req.io.to('admin_room').emit('telemetry:log', {
        type: 'WORKLOG_SUBMITTED',
        message: `${req.user.fullName || 'Agent'} logged ${hoursSpent}h on: "${summary.slice(0, 35)}"`,
        timestamp: new Date().toISOString(),
        meta: { logId: log.id, taskId, hoursSpent }
      });
    }

    res.status(201).json({ success: true, log, task: updatedTask });
  } catch (err) {
    console.error('Error submitting work log:', err);
    res.status(500).json({ success: false, message: 'Failed to submit work log' });
  }
};

module.exports = {
  createAndAssignTask,
  getTasks,
  createTask,
  updateTaskStatus,
  updateProgress,
  submitWorkLog
};
