const ProjectProgress = require('../models/ProjectProgress');
const Gig = require('../models/Gig');
const { sendNotification } = require('../services/notificationService');

const getOrInitProgress = async (req, res) => {
  const { gigId } = req.params;

  try {
    let progress = await ProjectProgress.findOne({ gig: gigId })
      .populate('client', 'name email')
      .populate('freelancer', 'name email')
      .populate('progressLogs.author', 'name');

    if (!progress) {
      const gig = await Gig.findById(gigId);
      if (!gig || !gig.selectedFreelancer) {
        return res.status(400).json({ message: 'Cannot initialize progress for unassigned or closed gig.' });
      }

      const isClient = gig.client.toString() === req.user._id.toString();
      const isFreelancer = gig.selectedFreelancer.toString() === req.user._id.toString();
      if (!isClient && !isFreelancer) {
        return res.status(403).json({ message: 'Not authorized to access this tracker.' });
      }

      const initialTasks = gig.milestones.map((m) => ({
        title: m.title,
        isCompleted: m.status === 'completed' || m.status === 'paid',
        milestoneRef: m._id,
      }));

      const pendingMilestones = gig.milestones.filter((m) => m.dueDate && m.status === 'pending');
      const earliestDeadline = pendingMilestones.length > 0
        ? new Date(Math.min(...pendingMilestones.map((m) => new Date(m.dueDate))))
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      progress = await ProjectProgress.create({
        gig: gig._id,
        client: gig.client,
        freelancer: gig.selectedFreelancer,
        overallPercentage: 0,
        tasks: initialTasks,
        nextDeadline: earliestDeadline,
      });

      await progress.populate('client', 'name email');
      await progress.populate('freelancer', 'name email');
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProgressLog = async (req, res) => {
  const { overallPercentage, tasks, message, attachments = [], nextDeadline } = req.body;

  try {
    const progress = await ProjectProgress.findById(req.params.id);
    if (!progress) {
      return res.status(404).json({ message: 'Progress tracker not found' });
    }

    const isClient = progress.client.toString() === req.user._id.toString();
    const isFreelancer = progress.freelancer.toString() === req.user._id.toString();
    if (!isClient && !isFreelancer) {
      return res.status(403).json({ message: 'Not authorized to update this progress tracker' });
    }

    if (typeof overallPercentage === 'number') {
      progress.overallPercentage = Math.min(Math.max(overallPercentage, 0), 100);
      if (progress.overallPercentage === 100) {
        progress.isCompleted = true;
      }
    }

    if (Array.isArray(tasks)) {
      progress.tasks = tasks.map((t) => ({
        ...t,
        completedAt: t.isCompleted ? (t.completedAt || new Date()) : null,
      }));
    }

    if (nextDeadline) {
      progress.nextDeadline = new Date(nextDeadline);
    }

    if (message) {
      progress.progressLogs.push({
        author: req.user._id,
        message,
        percentageReported: progress.overallPercentage,
        attachments,
        timestamp: new Date(),
      });
    }

    await progress.save();

    const targetRecipient = isFreelancer ? progress.client : progress.freelancer;
    await sendNotification({
      recipient: targetRecipient,
      sender: req.user._id,
      type: 'SYSTEM_ALERT',
      title: '📈 Project Progress Updated!',
      message: `${req.user.name} logged progress: "${message ? message.substring(0, 50) + '...' : `${progress.overallPercentage}% complete`}"`,
      link: `/dashboard/tracker/${progress.gig}`,
    });

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getOrInitProgress, updateProgressLog };