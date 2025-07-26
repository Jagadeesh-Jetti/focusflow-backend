require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task.model');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB 🚀');

    const tasks = await Task.find();

    for (const task of tasks) {
      const update = {
        status: task.isCompleted ? 'Completed' : 'Pending',
        completedAt: task.isCompleted ? task.updatedAt || new Date() : null,
      };

      await Task.updateOne(
        { _id: task._id },
        {
          $set: update,
          $unset: { isCompleted: '' },
        }
      );
    }

    console.log(
      '✅ Migration complete: status, completedAt set. isCompleted removed.'
    );
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
};

migrate();
