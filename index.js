const express = require('express');
const cors = require('cors');

const app = express();

const connectDB = require('./config/db');
const authRouter = require('./routers/Auth.router');
const GoalRouter = require('./routers/Goal.router');
const MilestoneRouter = require('./routers/Milestones.router');
const TaskRouter = require('./routers/Task.router');

connectDB();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.use('/auth', authRouter);
app.use('/goals', GoalRouter);
app.use('/milestones', MilestoneRouter);
app.use('/tasks', TaskRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
