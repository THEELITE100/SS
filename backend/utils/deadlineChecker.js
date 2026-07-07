const ProjectProgress = require('../models/ProjectProgress');
const { sendNotification } = require('../services/notificationService');

const sweepApproachingDeadlines = async () => {
  try {
    const now = new Date();
    const fortyEightHoursLater = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const urgentTrackers = await ProjectProgress.find({
      isCompleted: false,
      nextDeadline: { $gte: now, $lte: fortyEightHoursLater },
    }).populate('gig', 'title');

    console.log(`[Deadline Sweep] Found ${urgentTrackers.length} projects approaching deadline.`);

    for (const tracker of urgentTrackers) {
      const hoursRemaining = Math.round((tracker.nextDeadline - now) / (1000 * 60 * 60));

      await sendNotification({
        recipient: tracker.freelancer,
        type: 'SYSTEM_ALERT',
        title: '⏰ Action Required: Milestone Approaching!',
        message: `Your deadline for "${tracker.gig.title}" expires in ~${hoursRemaining} hours. Make sure to log deliverable updates!`,
        link: `/dashboard/tracker/${tracker.gig._id}`,
      });

      await sendNotification({
        recipient: tracker.client,
        type: 'SYSTEM_ALERT',
        title: '⏳ Project Deadline Approaching',
        message: `The next milestone for "${tracker.gig.title}" is due in ~${hoursRemaining} hours.`,
        link: `/dashboard/tracker/${tracker.gig._id}`,
      });
    }
  } catch (error) {
    console.error('Deadline Checker Sweep Error:', error.message);
  }
};

module.exports = { sweepApproachingDeadlines };