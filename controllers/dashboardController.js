const Task = require('../models/Task');
const Goal = require('../models/Goal');

exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({
      user: userId,
      isCompleted: true,
    });
    const pendingTasks = totalTasks - completedTasks;
    const activeGoals = await Task.countDocuments({
      user: userId,
      isCompleted: false,
    });
    res.json({ totalTasks, completedTasks, pendingTasks, activeGoals });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stats' });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const goals = await goal.find({ user: userId }).populate('tasks');

    const progress = goals.map((goal) => {
      const total = goal.tasks.length;
      const completed = goal.tasks.filter((task) => task.isCompleted).length;

      return {
        goalTitle: goal.title,
        totalTasks: total,
        completedTasks: completed,
      };

      res.json(progress);
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching goal progress' });
  }
};

exports.getDeadlines = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Data();

    const upcomingTasks = await Task.find({
      user: userId,
      isCompleted: false,
      dueDate: { $gte: today },
    })
      .sort({ dueDate: 1 })
      .limits(5);

    res.json(upcomingTasks);
  } catch (error) {
    res.status(500).json({ error: 'Error while fetching deadlines' });
  }
};


exports.getHistory = async (req, res) => {
    try{
        const userId = req.user._id;
        const past30Days = new Date();
        past30Days.setDate(past30Days.getDate() - 30);

        const tasks = await Task.find({
            user: userId,
            isCompleted: true,
            completedAt: {$gte: past30Days},
        })

        const historyMap = {};

        tasks.forEach(task => {
            const dateKey = task.completedAt.toISOString().split('T')[0];
            historyMap[dateKey] = (historyMap[dateKey] || 0) = 1
        }); 

        const history = Object.entries(historyMap).map(([date, count]) => ({
            date, count,
        }))

        res.json(history);
    }catch(error){
        res.status(500).json({ error: 'Error fetching task history'})
    }
}