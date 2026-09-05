const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Compiles a detailed qualitative report for an employee for a specific month
 * @param {string} employeeId - Unique UUID of the target employee
 * @param {number} year - Target calendar year (e.g. 2026)
 * @param {number} month - Target calendar month (0-indexed: 0 = Jan, 8 = Sep)
 */
const generateMonthlyEmployeeQualityReport = async (employeeId, year, month) => {
  try {
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = month !== undefined ? parseInt(month) : new Date().getMonth();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 1);

    // Fetch target employee
    const user = await prisma.user.findUnique({
      where: { id: employeeId },
      include: { employmentRecord: true }
    });

    if (!user) {
      throw new Error('Employee not found');
    }

    // Fetch all tasks associated with this employee active during the month
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: employeeId,
        createdAt: { lt: endDate }
      }
    });

    // Fetch all daily worklogs submitted within the targeted calendar month
    const logs = await prisma.dailyWorkLog.findMany({
      where: {
        userId: employeeId,
        createdAt: {
          gte: startDate,
          lt: endDate
        }
      }
    });

    if (tasks.length === 0) {
      return {
        employeeId,
        employeeName: user.fullName,
        jobTitle: user.employmentRecord?.jobTitle || 'Talent Specialist',
        reportingPeriod: `${startDate.toLocaleString('default', { month: 'long' })} ${targetYear}`,
        tasksAssigned: 0,
        completedCount: 0,
        completionRate: 0,
        onTimeCompletionRate: 0,
        averageProgress: 0,
        overdueCount: 0,
        totalHoursLogged: 0,
        performanceScore: 0,
        performanceTier: 'NO_ASSIGNMENTS',
        qualitativeEvaluation: 'No task or work history recorded for this reporting period.'
      };
    }

    const totalTasks = tasks.length;
    const completedTasksList = tasks.filter(t => t.status === 'DONE');
    const completedCount = completedTasksList.length;
    const incompleteTasksList = tasks.filter(t => t.status !== 'DONE');

    // Completion Rate (CR)
    const completionRate = (completedCount / totalTasks) * 100;

    // On-Time Completion Rate (OTCR)
    const onTimeCompletedCount = completedTasksList.filter(t => t.isDeliveredOnTime).length;
    const onTimeCompletionRate = completedCount > 0 
      ? (onTimeCompletedCount / completedCount) * 100 
      : 0;

    // Average Progress on remaining active tasks (AP)
    const averageProgress = incompleteTasksList.length > 0
      ? incompleteTasksList.reduce((acc, t) => acc + (t.progressPercent || 0), 0) / incompleteTasksList.length
      : 100;

    // Overdue Counts: Deadlines crossed without status "DONE"
    const now = new Date();
    const overdueCount = tasks.filter(t => {
      const isOverdue = t.dueDate && new Date(t.dueDate) < now;
      return isOverdue && t.status !== 'DONE';
    }).length;

    // Total Logged Hours
    const totalHoursLogged = logs.reduce((acc, l) => acc + (l.hoursSpent || 0), 0);

    // EPS Calculation (Mathematical Formula)
    const crFactor = completionRate * 0.35;
    const otcrFactor = onTimeCompletionRate * 0.40;
    const apFactor = averageProgress * 0.15;
    const penaltyFactor = Math.min(overdueCount * 5.0, 25.0); // Cap overdue penalty at 25 points
    const hoursFactor = Math.min((totalHoursLogged / 160.0) * 10.0, 10.0); // Reward up to 10 points for standard 160 hours

    let performanceScore = crFactor + otcrFactor + apFactor - penaltyFactor + hoursFactor;
    // Bounds check EPS between 0 and 100
    performanceScore = Math.max(0, Math.min(100, performanceScore));

    // Determine Qualitative Rating Tier
    let performanceTier = 'D - NEEDS IMPROVEMENT';
    let qualitativeEvaluation = 'Employee did not meet essential metrics. Overdue counts are critical, and completion density is insufficient.';

    if (performanceScore >= 90) {
      performanceTier = 'A+ - ENTERPRISE ELITE';
      qualitativeEvaluation = 'Exceptional performance characterized by rapid task delivery, excellent timeline compliance, and reliable logging consistency.';
    } else if (performanceScore >= 80) {
      performanceTier = 'A - EXCELLENT PERFORMANCE';
      qualitativeEvaluation = 'Consistent task completion and highly reliable outputs. Easily manages multiple workflows with minimum oversight.';
    } else if (performanceScore >= 70) {
      performanceTier = 'B - COMPETENT & RELIABLE';
      qualitativeEvaluation = 'Meets standard team metrics. Deliveries are generally on schedule, with minor occurrences of overdue milestones.';
    } else if (performanceScore >= 50) {
      performanceTier = 'C - MODERATE / SATISFACTORY';
      qualitativeEvaluation = 'Working at acceptable baseline operational capacity. Needs acceleration on overdue items and more detailed log updates.';
    }

    return {
      employeeId,
      employeeName: user.fullName,
      jobTitle: user.employmentRecord?.jobTitle || 'Talent Specialist',
      reportingPeriod: `${startDate.toLocaleString('default', { month: 'long' })} ${targetYear}`,
      tasksAssigned: totalTasks,
      completedCount,
      overdueCount,
      totalHoursLogged: Math.round(totalHoursLogged * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10,
      onTimeCompletionRate: Math.round(onTimeCompletionRate * 10) / 10,
      averageProgress: Math.round(averageProgress * 10) / 10,
      performanceScore: Math.round(performanceScore * 10) / 10,
      performanceTier,
      qualitativeEvaluation,
      factors: {
        crFactor: Math.round(crFactor * 10) / 10,
        otcrFactor: Math.round(otcrFactor * 10) / 10,
        apFactor: Math.round(apFactor * 10) / 10,
        penaltyFactor: Math.round(penaltyFactor * 10) / 10,
        hoursFactor: Math.round(hoursFactor * 10) / 10
      },
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Failed to calculate employee monthly report: ${error.message}`);
  }
};

/**
 * Compiles reports for all active employees for the specified month
 */
const generateAllEmployeesMonthlyReport = async (year, month) => {
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: { id: true, fullName: true }
  });

  const reports = [];
  for (const emp of employees) {
    try {
      const rep = await generateMonthlyEmployeeQualityReport(emp.id, year, month);
      reports.push(rep);
    } catch (e) {
      console.error(`Error generating report for ${emp.fullName}:`, e.message);
    }
  }

  return reports;
};

module.exports = {
  generateMonthlyEmployeeQualityReport,
  generateAllEmployeesMonthlyReport
};
