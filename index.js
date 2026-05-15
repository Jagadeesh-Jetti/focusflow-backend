require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

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
const CoachRouter = require('./routers/Coach.router');

const app = express();

connectDB();

app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173',
  'https://focus-flow-theta-henna.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.get('/', (req, res) => {
  res.send('Hello world');
});

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth requests. Try again in a minute.' },
});
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'AI rate limit reached. Slow down for a minute.' },
});

app.use('/auth', authLimiter, AuthRouter);
app.use('/coach', aiLimiter, CoachRouter);
app.use('/goals/generate-plan', aiLimiter);
app.use('/goals/save-ai-plan', aiLimiter);
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
