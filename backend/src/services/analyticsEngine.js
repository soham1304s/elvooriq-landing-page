const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AnalyticsEngine {
  /**
   * Compiles monthly performance telemetry for a specific employee according to Section 7.1 EPS formula
   */
  static async compileMonthlyReport(employeeId, year, month) {
    try {
      const parsedYear = parseInt(year);
      const parsedMonth = parseInt(month);
      const startDate = new Date(parsedYear, parsedMonth, 1);
      const endDate = new Date(parsedYear, parsedMonth + 1, 1);

      // Fetch active tasks for this assignee
      const tasks = await prisma.task.findMany({
        where: { assigneeId: employeeId, createdAt: { lt: endDate } }
      });

      // Fetch daily work logs
      const logs = await prisma.dailyWorkLog.findMany({
        where: { userId: employeeId, createdAt: { gte: startDate, lt: endDate } }
      });

      if (tasks.length === 0) {
        return {
          employeeId,
          tasksAssigned: 0,
          completedCount: 0,
          overdueCount: 0,
          totalHoursLogged: 0,
          completionRate: 0.0,
          onTimeCompletionRate: 0.0,
          averageProgress: 0.0,
          performanceScore: 0.0,
          tier: 'NO_ASSIGNMENTS',
          evaluation: 'No tasks or daily worklogs registered for this operational period.'
        };
      }

      const completed = tasks.filter(t => t.status === 'DONE');
      const incomplete = tasks.filter(t => t.status !== 'DONE');

      // 1. Completion Rate (CR)
      const cr = (completed.length / tasks.length) * 100;

      // 2. On-Time Completion Rate (OTCR)
      const onTimeCompleted = completed.filter(t => t.isDeliveredOnTime).length;
      const otcr = completed.length > 0 ? (onTimeCompleted / completed.length) * 100 : 0;

      // 3. Average Progress of active items (AP)
      const ap = incomplete.length > 0 
        ? incomplete.reduce((acc, t) => acc + (t.progressPercent || 0), 0) / incomplete.length 
        : 100;

      // 4. Overdue Task Count (ONC)
      const overdueCount = tasks.filter(t => {
        const isExpired = t.dueDate && new Date(t.dueDate) < new Date();
        return isExpired && t.status !== 'DONE';
      }).length;

      // 5. Aggregate Logged Hours
      const totalHours = logs.reduce((acc, log) => acc + (log.hoursSpent || 0), 0);

      // Apply EPS Formula (Section 7.1)
      const crWeight = cr * 0.35;
      const otcrWeight = otcr * 0.40;
      const apWeight = ap * 0.15;
      const penalty = Math.min(overdueCount * 5.0, 25.0);
      const hoursBonus = Math.min((totalHours / 160.0) * 10.0, 10.0);

      let eps = crWeight + otcrWeight + apWeight - penalty + hoursBonus;
      eps = Math.max(0, Math.min(100, eps)); // Clamping: 0 <= EPS <= 100

      // Determine Performance Rating Tier
      let tier = 'C - baseline';
      let evaluation = 'Meets core requirements. Needs focus on overdue milestones and detail logs.';

      if (eps >= 90) {
        tier = 'A+ - ENTERPRISE ELITE';
        evaluation = 'Exemplary output. Exceeds standard task performance with perfect timing metrics.';
      } else if (eps >= 80) {
        tier = 'A - EXCELLENT';
        evaluation = 'High consistency across all workflows. Highly recommended for workspace expansions.';
      } else if (eps < 50) {
        tier = 'D - NEEDS IMPROVEMENT';
        evaluation = 'Underperforming on essential milestones. Action plan required immediately.';
      }

      return {
        employeeId,
        reportingPeriod: `${startDate.toLocaleString('default', { month: 'long' })} ${parsedYear}`,
        tasksAssigned: tasks.length,
        completedCount: completed.length,
        overdueCount,
        totalHoursLogged: Math.round(totalHours * 10) / 10,
        completionRate: Math.round(cr * 10) / 10,
        onTimeCompletionRate: Math.round(otcr * 10) / 10,
        averageProgress: Math.round(ap * 10) / 10,
        performanceScore: Math.round(eps * 10) / 10,
        tier,
        evaluation,
        generatedAt: new Date()
      };
    } catch (err) {
      console.error('[ANALYTICS_ERROR] Failed compiling Monthly Report:', err.message);
      throw err;
    }
  }

  /**
   * Compiles monthly performance for all active staff members
   */
  static async compileAllReports(year, month) {
    const activeStaff = await prisma.user.findMany({
      where: { role: 'EMPLOYEE', status: 'ACTIVE', isEnabled: true }
    });

    const reports = [];
    for (const emp of activeStaff) {
      const rep = await this.compileMonthlyReport(emp.id, year, month);
      reports.push({
        ...rep,
        employeeName: emp.fullName || emp.name,
        employeeEmail: emp.email,
        employeeDepartment: 'TALENT_MANAGEMENT'
      });
    }
    return reports;
  }
}

module.exports = AnalyticsEngine;
