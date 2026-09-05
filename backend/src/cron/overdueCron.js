const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { notifyHROverdue } = require('../services/smsService');

const initOverdueCron = (io) => {
  // Evaluates state transitions at the start of every hour (e.g. "0 * * * *")
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON_DAEMON] Initiating overdue task evaluation...');
    try {
      const now = new Date();

      const overdueTasks = await prisma.task.findMany({
        where: {
          status: { not: 'DONE' },
          dueDate: { lt: now },
          overdueNotificationSent: false,
          assigneeId: { not: null }
        },
        include: { assignee: true, creator: true }
      });

      for (const task of overdueTasks) {
        const hr = task.creator;
        const employee = task.assignee;

        if (hr && hr.whatsapp) {
          const success = await notifyHROverdue(
            hr.whatsapp,
            hr.fullName || hr.name,
            employee ? (employee.fullName || employee.name) : 'Unassigned',
            task.title,
            task.dueDate
          );

          if (success) {
            // Commit locking flag to database to prevent duplicate SMS warnings
            await prisma.task.update({
              where: { id: task.id },
              data: { overdueNotificationSent: true }
            });
          }
        }

        if (io) {
          io.to('admin_room').emit('telemetry:log', {
            type: 'TASK_OVERDUE_ALERT',
            message: `Task "${task.title}" is overdue (Assignee: ${employee?.fullName || 'Unassigned'})`,
            timestamp: now.toISOString(),
            meta: { taskId: task.id, title: task.title, dueDate: task.dueDate }
          });
        }
      }
    } catch (err) {
      console.error('[CRON_DAEMON_ERROR] Overdue tracking processing crashed:', err.message);
    }
  });
};

module.exports = { initOverdueCron };
