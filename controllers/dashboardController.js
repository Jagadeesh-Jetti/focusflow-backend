const Task = require('../models/Task.model');
const Goal = require('../models/Goal.model');
const Milestone = require('../models/Milestone.model');
const User = require('../models/User.model');

const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalGoals = await Goal.countDocuments({ user: userId });
    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({
      user: userId,
      status: 'completed',
    });
    const pendingTasks = totalTasks - completedTasks;

    const activeGoals = await Goal.countDocuments({
      user: userId,
      status: { $ne: 'completed' },
    });

    const userDoc = await User.findById(userId).select(
      'streakCount lastActivityAt'
    );
    // Streak is valid only if last activity was today or yesterday
    let streakCount = userDoc?.streakCount || 0;
    if (userDoc?.lastActivityAt) {
      const last = new Date(userDoc.lastActivityAt);
      const today = new Date();
      const diffDays = Math.floor(
        (today.setHours(0, 0, 0, 0) - new Date(last).setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      );
      if (diffDays > 1) streakCount = 0;
    }

    res.json({
      totalGoals,
      totalTasks,
      completedTasks,
      pendingTasks,
      activeGoals,
      streakCount,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error fetching stats' });
  }
};

const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    const milestones = await Milestone.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: 'milestone',
          as: 'tasks',
        },
      },
      {
        $addFields: {
          totalTasks: { $size: '$tasks' },
          completedTasks: {
            $size: {
              $filter: {
                input: '$tasks',
                as: 'task',
                cond: { $eq: ['$$task.status', 'completed'] },
              },
            },
          },
          progress: {
            $cond: [
              { $gt: [{ $size: '$tasks' }, 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $size: {
                          $filter: {
                            input: '$tasks',
                            as: 'task',
                            cond: { $eq: ['$$task.status', 'completed'] },
                          },
                        },
                      },
                      { $size: '$tasks' },
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: '$title',
          progress: { $round: ['$progress', 0] },
        },
      },
    ]);

    res.json(milestones);
  } catch (err) {
    console.error('Error fetching milestone progress:', err);
    res.status(500).json({ error: 'Error fetching milestone progress' });
  }
};

const getDeadlines = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();

    const upcomingTasks = await Task.find({
      user: userId,
      status: { $ne: 'completed' },
      dueDate: { $gte: today },
    })
      .sort({ dueDate: 1 })
      .limit(5);

    res.json(upcomingTasks);
  } catch (error) {
    console.error('Error while fetching deadlines:', error);
    res.status(500).json({ error: 'Error while fetching deadlines' });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();

    const startOfWeek = new Date(today);
    const dayOfWeek = (today.getDay() + 6) % 7;
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      user: userId,
      status: 'completed',
      completedAt: { $gte: startOfWeek },
    });

    const countsPerDay = [0, 0, 0, 0, 0, 0, 0];

    tasks.forEach((task) => {
      if (task.completedAt) {
        const day = (task.completedAt.getDay() + 6) % 7;
        return (countsPerDay[day] += 1);
      }
    });

    res.json(countsPerDay);
  } catch (error) {
    console.error('Error fetching task history:', error);
    res.status(500).json({ error: 'Error fetching task history' });
  }
};

module.exports = {
  getStats,
  getProgress,
  getHistory,
  getDeadlines,
};
