require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const GoalRouter = require('./routers/Goal.router');
const MilestoneRouter = require('./routers/Milestones.router');
const TaskRouter = require('./routers/Task.router');
const PostRouter = require('./routers/Post.router');
const UserRouter = require('./routers/User.router');
const AuthRouter = require('./routers/Auth.router');
const Goal = require('./models/Goal.model');
const Task = require('./models/Task.model');
const DashboardRouter = require('./routers/Dashboard.router');

const app = express();

connectDB();

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.use('/auth', AuthRouter);
app.use('/goals', GoalRouter);
app.use('/milestones', MilestoneRouter);
app.use('/tasks', TaskRouter);
app.use('/posts', PostRouter);
app.use('/users', UserRouter);
app.use('/dashboard', DashboardRouter);
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Something went wrong' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
