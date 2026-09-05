const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Initiating database purge of testing records...');

  try {
    // Delete in sequence to avoid foreign key constraint violations
    const gitRepos = await prisma.githubRepository.deleteMany({});
    console.log(`- Cleared ${gitRepos.count} GitHub repositories.`);

    const gitProfiles = await prisma.githubProfile.deleteMany({});
    console.log(`- Cleared ${gitProfiles.count} GitHub profiles.`);

    const caseStudies = await prisma.creatorCaseStudy.deleteMany({});
    console.log(`- Cleared ${caseStudies.count} creator case studies.`);

    const anomalies = await prisma.securityAnomaly.deleteMany({});
    console.log(`- Cleared ${anomalies.count} security anomaly logs.`);

    const secEvents = await prisma.securityEvents.deleteMany({});
    console.log(`- Cleared ${secEvents.count} security event logs.`);

    const auditTrail = await prisma.securityAuditTrail.deleteMany({});
    console.log(`- Cleared ${auditTrail.count} security audit trails.`);

    const workLogs = await prisma.dailyWorkLog.deleteMany({});
    console.log(`- Cleared ${workLogs.count} employee daily work logs.`);

    const tasks = await prisma.task.deleteMany({});
    console.log(`- Cleared ${tasks.count} system tasks.`);

    const disbursements = await prisma.payrollDisbursement.deleteMany({});
    console.log(`- Cleared ${disbursements.count} payroll disbursements.`);

    const payrollLedgers = await prisma.payrollLedger.deleteMany({});
    console.log(`- Cleared ${payrollLedgers.count} payroll ledgers.`);

    const revenueSplits = await prisma.revenueSplit.deleteMany({});
    console.log(`- Cleared ${revenueSplits.count} creator revenue splits.`);

    const employmentRecords = await prisma.employmentRecord.deleteMany({});
    console.log(`- Cleared ${employmentRecords.count} employment records.`);

    const workspaceMembers = await prisma.workspaceMember.deleteMany({});
    console.log(`- Cleared ${workspaceMembers.count} workspace memberships.`);

    const leadInteractions = await prisma.leadInteraction.deleteMany({});
    console.log(`- Cleared ${leadInteractions.count} lead interactions.`);

    const leadHistories = await prisma.leadHistory.deleteMany({});
    console.log(`- Cleared ${leadHistories.count} lead histories.`);

    const auditionTapes = await prisma.auditionTape.deleteMany({});
    console.log(`- Cleared ${auditionTapes.count} audition tapes.`);

    const leadQueue = await prisma.leadQueue.deleteMany({});
    console.log(`- Cleared ${leadQueue.count} leads in the fail-safe queue.`);

    const leads = await prisma.lead.deleteMany({});
    console.log(`- Cleared ${leads.count} creator leads.`);

    const digitalSignatures = await prisma.digitalSignature.deleteMany({});
    console.log(`- Cleared ${digitalSignatures.count} digital signatures.`);

    const taxDeclarations = await prisma.taxDeclaration.deleteMany({});
    console.log(`- Cleared ${taxDeclarations.count} tax declarations.`);

    const legalContracts = await prisma.legalContract.deleteMany({});
    console.log(`- Cleared ${legalContracts.count} legal contracts.`);

    const campaignMilestones = await prisma.campaignMilestone.deleteMany({});
    console.log(`- Cleared ${campaignMilestones.count} campaign milestones.`);

    const sponsorshipCampaigns = await prisma.sponsorshipCampaign.deleteMany({});
    console.log(`- Cleared ${sponsorshipCampaigns.count} sponsorship campaigns.`);

    const channelAudits = await prisma.channelAudit.deleteMany({});
    console.log(`- Cleared ${channelAudits.count} channel audits.`);

    const streamLogs = await prisma.streamLog.deleteMany({});
    console.log(`- Cleared ${streamLogs.count} stream logs.`);

    const liveEvents = await prisma.liveEvent.deleteMany({});
    console.log(`- Cleared ${liveEvents.count} live stream events.`);

    const liveRecordings = await prisma.liveRecording.deleteMany({});
    console.log(`- Cleared ${liveRecordings.count} live recordings.`);

    const liveAnalytics = await prisma.liveAnalytics.deleteMany({});
    console.log(`- Cleared ${liveAnalytics.count} live analytics logs.`);

    const liveSessions = await prisma.liveSession.deleteMany({});
    console.log(`- Cleared ${liveSessions.count} live sessions.`);

    const scheduledStreams = await prisma.scheduledStream.deleteMany({});
    console.log(`- Cleared ${scheduledStreams.count} scheduled streams.`);

    const streamingSettings = await prisma.creatorStreamingSetting.deleteMany({});
    console.log(`- Cleared ${streamingSettings.count} streaming settings.`);

    const ytConnections = await prisma.youTubeConnection.deleteMany({});
    console.log(`- Cleared ${ytConnections.count} YouTube connections.`);

    const offerLetters = await prisma.offerLetter.deleteMany({});
    console.log(`- Cleared ${offerLetters.count} offer letters.`);

    const onboardingDocs = await prisma.onboardingDocument.deleteMany({});
    console.log(`- Cleared ${onboardingDocs.count} onboarding compliance documents.`);

    const workspaces = await prisma.workspace.deleteMany({});
    console.log(`- Cleared ${workspaces.count} workspaces.`);

    const authSessions = await prisma.authenticationSession.deleteMany({});
    console.log(`- Cleared ${authSessions.count} authentication sessions.`);

    const partnerRequests = await prisma.partnerRequest.deleteMany({});
    console.log(`- Cleared ${partnerRequests.count} partner requests.`);

    const tenants = await prisma.tenant.deleteMany({});
    console.log(`- Cleared ${tenants.count} franchise tenants.`);

    // Wipe all users except the root administrator
    const usersWiped = await prisma.user.deleteMany({
      where: {
        email: { not: 'root.admin@elvooriq.com' }
      }
    });
    console.log(`- Cleared ${usersWiped.count} testing user records.`);

    console.log('✅ Database successfully purged of all mock data.');
  } catch (error) {
    console.error('❌ Purging failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
