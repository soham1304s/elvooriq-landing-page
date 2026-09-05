// backend/src/cron/overdueTracker.js
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { notifyHROfOverdue } = require('../services/notificationService');

const checkOverdueTasks = async (io) => {
  try {
    const now = new Date();

    // Retrieve tasks that are overdue, incomplete, and haven't triggered alerts
    const delinquentTasks = await prisma.task.findMany({
      where: {
        status: { not: "DONE" },
        dueDate: { lt: now },
        overdueNotificationSent: false,
        assigneeId: { not: null }
      },
      include: {
        assignee: true, // Employee
        creator: true   // HR Administrator who assigned the task
      }
    });

    if (delinquentTasks.length === 0) {
      return;
    }

    console.log(`[CRON DAEMON] Detected ${delinquentTasks.length} newly overdue tasks. Processing alerts...`);

    for (const task of delinquentTasks) {
      const hrAdmin = task.creator;
      const employee = task.assignee;
      const hrPhone = hrAdmin?.whatsapp;
      const hrName = hrAdmin?.fullName || hrAdmin?.name || 'Admin';
      const empName = employee ? (employee.fullName || employee.name) : 'Unassigned Staff';

      if (hrPhone) {
        const success = await notifyHROfOverdue(
          hrPhone,
          hrName,
          empName,
          task.title,
          task.dueDate
        );

        if (success) {
          // Commit status update to database to lock notifications and prevent loops
          await prisma.task.update({
            where: { id: task.id },
            data: { overdueNotificationSent: true }
          });
        }
      } else {
        console.warn(`[CRON WARNING] Skipped alert for task ${task.id}: HR Administrator '${hrName}' has no registered phone number.`);
      }

      if (io) {
        io.to('admin_room').emit('telemetry:log', {
          type: 'TASK_OVERDUE_ALERT',
          message: `🚨 Overdue Alert: Task "${task.title}" assigned to ${empName} has expired!`,
          timestamp: new Date().toISOString(),
          meta: { taskId: task.id, dueDate: task.dueDate }
        });
      }
    }
  } catch (error) {
    console.error('[CRON FAILURE] An error occurred during deadline evaluations:', error.message);
  }
};

const initOverdueCron = (io) => {
  // Execute checks every hour on the hour ("0 * * * *")
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON DAEMON] Executing hourly checks on assigned task deadlines...');
    await checkOverdueTasks(io);
  });

  // Run an initial check shortly after startup
  setTimeout(() => {
    checkOverdueTasks(io).catch(err => console.error('[STARTUP OVERDUE CHECK ERROR]', err.message));
  }, 5000);
};

module.exports = { initOverdueCron, checkOverdueTasks };
