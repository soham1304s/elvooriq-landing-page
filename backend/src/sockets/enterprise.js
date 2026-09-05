const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Enterprise real-time socket controller.
 * Implements real-time collaboration across workspaces and live telemetry for HR/Admin.
 * @param {import('socket.io').Server} io - Socket.IO server instance.
 */
module.exports = (io) => {
  io.on('connection', (socket) => {
    // Join private room dedicated to specific workspace
    socket.on('workspace:join', ({ workspaceId }) => {
      if (workspaceId) {
        socket.join(`workspace-${workspaceId}`);
        console.log(`Socket ${socket.id} joined workspace-${workspaceId}`);
      }
    });

    // Capture task status drag-and-drop progression
    socket.on('task:dragged', async (payload) => {
      try {
        const { taskId, originStatus, targetStatus, workspaceId, userId } = payload;

        if (taskId && targetStatus) {
          // Persist status change to database
          await prisma.task.update({
            where: { id: taskId },
            data: { status: targetStatus },
          });
        }

        // Broadcast update event to all members of this workspace
        if (workspaceId) {
          socket.to(`workspace-${workspaceId}`).emit('task:status-updated', {
            taskId,
            originStatus,
            targetStatus,
            updatedBy: userId || socket.id,
            timestamp: new Date().toISOString(),
          });
        }

        // Broadcast telemetry back to HR / Admin room
        io.to('admin_room').emit('telemetry:log', {
          type: 'TASK_DRAG',
          message: `Task ${taskId ? taskId.slice(0, 8) : ''} moved from ${originStatus || 'N/A'} to ${targetStatus}`,
          timestamp: new Date().toISOString(),
          meta: payload,
        });
      } catch (err) {
        console.error('Error handling task:dragged event:', err.message);
      }
    });

    // Work log submission telemetry
    socket.on('worklog:added', (payload) => {
      const { taskId, hoursSpent, summary, userName, workspaceId } = payload;

      if (workspaceId) {
        socket.to(`workspace-${workspaceId}`).emit('task:log-submitted', payload);
      }

      io.to('admin_room').emit('telemetry:log', {
        type: 'WORKLOG_SUBMITTED',
        message: `${userName || 'Agent'} logged ${hoursSpent}h on task: "${(summary || '').slice(0, 40)}"`,
        timestamp: new Date().toISOString(),
        meta: payload,
      });
    });

    // Continuous tracking of agent status (e.g., "Available", "Reviewing Lead", "In Session")
    socket.on('telemetry:agent-status', (payload) => {
      io.to('admin_room').emit('agent:state-update', {
        ...payload,
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      });
    });
  });
};
