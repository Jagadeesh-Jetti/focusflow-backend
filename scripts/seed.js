/* eslint-disable no-console */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../models/User.model');
const Goal = require('../models/Goal.model');
const Milestone = require('../models/Milestone.model');
const Task = require('../models/Task.model');
const Post = require('../models/Post.model');

const SHARED_PASSWORD = 'FocusFlow@2026';

const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(0, 0, 0, 0);
  return d;
};

const SEED_USERS = [
  {
    email: 'ironman@example.com',
    name: 'Tony',
    bio: 'Building the next-gen everything.',
    location: 'Manhattan',
    goals: [
      {
        title: 'Build the Mark VIII suit',
        description: 'Lighter, faster, smarter than Mark VII.',
        category: 'Engineering',
        status: 'In Progress',
        priority: 'High',
        dueDate: day(45),
        milestones: [
          {
            title: 'Design new repulsors',
            description: 'Sketch and prototype.',
            targetDate: day(14),
            tasks: [
              { title: 'Sketch repulsor coil v3', priority: 'high', dueDate: day(2), status: 'completed' },
              { title: 'Prototype in lab', priority: 'high', dueDate: day(7), status: 'in-progress' },
              { title: 'Stress-test at 2x rated load', priority: 'medium', dueDate: day(12), status: 'pending' },
            ],
          },
          {
            title: 'Integrate JARVIS v2',
            description: 'Voice and predictive systems.',
            targetDate: day(30),
            tasks: [
              { title: 'Wire voice intents', priority: 'medium', dueDate: day(20), status: 'pending' },
              { title: 'Predictive flight stabilization', priority: 'high', dueDate: day(28), status: 'pending' },
            ],
          },
        ],
      },
      {
        title: 'Mentor the next Avenger',
        description: 'Pass the torch responsibly.',
        category: 'Leadership',
        status: 'Not Started',
        priority: 'Medium',
        dueDate: day(120),
        milestones: [
          {
            title: 'Pick a candidate',
            description: 'Shortlist 3, interview 2.',
            targetDate: day(20),
            tasks: [
              { title: 'Review SHIELD recommendations', priority: 'low', dueDate: day(10), status: 'pending' },
              { title: 'Run two coffee meetings', priority: 'medium', dueDate: day(18), status: 'pending' },
            ],
          },
        ],
      },
    ],
    posts: [
      {
        content:
          'Repulsor v3 prototype hit 2.1x rated thrust today. Mark VIII is taking shape.',
      },
      {
        content:
          'Reminder to self: ship beats perfect. Ship beats perfect. Ship beats perfect.',
      },
    ],
  },
  {
    email: 'jaggu@gmail.com',
    name: 'Jaggu',
    bio: 'Frontend dev shipping side projects.',
    location: 'Hyderabad',
    goals: [
      {
        title: 'Ship FocusFlow v1',
        description: 'Public launch with AI coach as the headline feature.',
        category: 'Product',
        status: 'In Progress',
        priority: 'High',
        dueDate: day(30),
        milestones: [
          {
            title: 'Polish landing page',
            description: 'Hero, features, mockup, CTA.',
            targetDate: day(7),
            tasks: [
              { title: 'Add Coach feature card', priority: 'high', dueDate: day(2), status: 'completed' },
              { title: 'Write hero copy', priority: 'medium', dueDate: day(3), status: 'completed' },
              { title: 'Polish product mockup', priority: 'medium', dueDate: day(5), status: 'in-progress' },
            ],
          },
          {
            title: 'Seed demo data',
            description: 'So new visitors see a lively app.',
            targetDate: day(10),
            tasks: [
              { title: 'Write seed script', priority: 'high', dueDate: day(1), status: 'in-progress' },
              { title: 'Verify seed runs idempotently', priority: 'medium', dueDate: day(2), status: 'pending' },
            ],
          },
          {
            title: 'Public launch',
            description: 'Hacker News + Twitter.',
            targetDate: day(28),
            tasks: [
              { title: 'Write launch post', priority: 'medium', dueDate: day(25), status: 'pending' },
              { title: 'Record 60s demo video', priority: 'medium', dueDate: day(26), status: 'pending' },
            ],
          },
        ],
      },
      {
        title: 'Land senior frontend role',
        description: 'Aim for Series B / growth-stage SaaS.',
        category: 'Career',
        status: 'In Progress',
        priority: 'High',
        dueDate: day(75),
        milestones: [
          {
            title: 'Resume + portfolio',
            description: 'Tight, results-focused.',
            targetDate: day(7),
            tasks: [
              { title: 'Rewrite resume bullets', priority: 'high', dueDate: day(3), status: 'completed' },
              { title: 'Update portfolio with FocusFlow', priority: 'high', dueDate: day(5), status: 'pending' },
            ],
          },
          {
            title: 'Apply to 20 companies',
            description: 'Quality over quantity, but volume helps.',
            targetDate: day(30),
            tasks: [
              { title: 'List 30 target companies', priority: 'medium', dueDate: day(8), status: 'pending' },
              { title: 'Send first 10 applications', priority: 'high', dueDate: day(15), status: 'pending' },
            ],
          },
        ],
      },
    ],
    posts: [
      {
        content:
          'AI Coach chat is live in FocusFlow. Asked it "what should I work on today" and it actually gave me a reasonable answer.',
      },
      {
        content:
          'Resume rewrite done. Tightened 12 bullets to outcomes-only. Two pages → one page. Feels good.',
      },
    ],
  },
  {
    email: 'jaggu@example.com',
    name: 'Jaggu',
    bio: 'Always learning. Currently obsessing over Rust.',
    location: 'Bangalore',
    goals: [
      {
        title: 'Master Rust',
        description: 'Comfortable enough to ship a small CLI in production.',
        category: 'Learning',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: day(90),
        milestones: [
          {
            title: 'Read the Rust book',
            description: 'Cover to cover, with exercises.',
            targetDate: day(30),
            tasks: [
              { title: 'Chapters 1–5: ownership and borrowing', priority: 'high', dueDate: day(7), status: 'completed' },
              { title: 'Chapters 6–10: structs, enums, errors', priority: 'medium', dueDate: day(14), status: 'in-progress' },
              { title: 'Chapters 11–15: testing and lifetimes', priority: 'medium', dueDate: day(25), status: 'pending' },
            ],
          },
          {
            title: 'Ship a Rust CLI',
            description: 'A real tool you actually use.',
            targetDate: day(70),
            tasks: [
              { title: 'Pick the problem to solve', priority: 'medium', dueDate: day(35), status: 'pending' },
              { title: 'MVP working end to end', priority: 'high', dueDate: day(55), status: 'pending' },
              { title: 'Publish to crates.io', priority: 'low', dueDate: day(65), status: 'pending' },
            ],
          },
        ],
      },
      {
        title: 'Read 24 books this year',
        description: 'Two per month, mix of fiction and non-fiction.',
        category: 'Reading',
        status: 'In Progress',
        priority: 'Low',
        dueDate: day(180),
        milestones: [
          {
            title: 'Q1 reading',
            description: '6 books by end of March.',
            targetDate: day(60),
            tasks: [
              { title: 'Finish current non-fiction', priority: 'low', dueDate: day(10), status: 'in-progress' },
              { title: 'Pick next book', priority: 'low', dueDate: day(11), status: 'pending' },
            ],
          },
        ],
      },
    ],
    posts: [
      {
        content:
          'Ownership in Rust finally clicked today. Spent two weekends fighting the borrow checker; suddenly it just makes sense. ✨',
      },
    ],
  },
  {
    email: 'chandu@gmail.com',
    name: 'Chandu',
    bio: 'Coffee → code → run. Repeat.',
    location: 'Chennai',
    goals: [
      {
        title: 'Run a half marathon',
        description: '21k in under 2 hours.',
        category: 'Fitness',
        status: 'In Progress',
        priority: 'High',
        dueDate: day(120),
        milestones: [
          {
            title: 'Build base: 20k weekly',
            description: 'Three runs a week, easy pace.',
            targetDate: day(30),
            tasks: [
              { title: 'Run 5k Mon/Wed', priority: 'medium', dueDate: day(2), status: 'completed' },
              { title: 'Run 7k long every Sat', priority: 'medium', dueDate: day(5), status: 'completed' },
              { title: 'Recover well: sleep + stretch', priority: 'medium', dueDate: day(7), status: 'in-progress' },
            ],
          },
          {
            title: 'Add tempo + intervals',
            description: 'Speed work to actually hit pace.',
            targetDate: day(60),
            tasks: [
              { title: 'Tempo run: 6k @ goal pace', priority: 'high', dueDate: day(40), status: 'pending' },
              { title: 'Intervals: 6×800m', priority: 'medium', dueDate: day(45), status: 'pending' },
            ],
          },
        ],
      },
      {
        title: 'Hit 80kg lean',
        description: 'Slow cut, no crash diet.',
        category: 'Fitness',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: day(150),
        milestones: [
          {
            title: 'Track food for 30 days',
            description: 'No judgement, just data.',
            targetDate: day(30),
            tasks: [
              { title: 'Set up MacroFactor', priority: 'low', dueDate: day(1), status: 'completed' },
              { title: 'Log every day for 2 weeks', priority: 'medium', dueDate: day(14), status: 'in-progress' },
            ],
          },
        ],
      },
    ],
    posts: [
      {
        content:
          'Hit 7k easy this morning. Legs felt great. Half marathon prep is officially on the rails.',
      },
    ],
  },
  {
    email: 'trinadh@gmail.com',
    name: 'Trinadh',
    bio: 'Indie hacker. Building in public.',
    location: 'Vijayawada',
    goals: [
      {
        title: 'Launch SaaS app',
        description: 'Niche tool for B2B teams. $1k MRR target.',
        category: 'Side project',
        status: 'In Progress',
        priority: 'High',
        dueDate: day(60),
        milestones: [
          {
            title: 'MVP with core feature',
            description: 'One thing, done well.',
            targetDate: day(20),
            tasks: [
              { title: 'Spec the one feature', priority: 'high', dueDate: day(2), status: 'completed' },
              { title: 'Build auth + billing', priority: 'high', dueDate: day(10), status: 'in-progress' },
              { title: 'Wire the core feature', priority: 'high', dueDate: day(18), status: 'pending' },
            ],
          },
          {
            title: 'First 10 paying users',
            description: 'Talk to humans, fix what hurts.',
            targetDate: day(50),
            tasks: [
              { title: 'Reach out to 30 leads', priority: 'high', dueDate: day(30), status: 'pending' },
              { title: 'Schedule 10 demo calls', priority: 'medium', dueDate: day(40), status: 'pending' },
            ],
          },
        ],
      },
      {
        title: 'Build personal site',
        description: 'A quiet corner of the internet that is mine.',
        category: 'Personal',
        status: 'Not Started',
        priority: 'Low',
        dueDate: day(45),
        milestones: [
          {
            title: 'Pick a stack and design',
            description: 'Astro + minimal. No more.',
            targetDate: day(10),
            tasks: [
              { title: 'Sketch homepage', priority: 'low', dueDate: day(3), status: 'pending' },
              { title: 'Pick fonts and colors', priority: 'low', dueDate: day(5), status: 'pending' },
            ],
          },
        ],
      },
    ],
    posts: [
      {
        content:
          'MVP day 4. Auth working, billing half-wired. Going to bed before midnight tonight.',
      },
    ],
  },
  {
    email: 'chintu@gmail.com',
    name: 'chintu',
    bio: 'Building Goal Deck. Iterating.',
    location: '—',
    goals: [
      {
        title: 'Polish FocusFlow for beta',
        description: 'Tighten every flow before sharing.',
        category: 'Product',
        status: 'In Progress',
        priority: 'High',
        dueDate: day(20),
        milestones: [
          {
            title: 'Audit every page',
            description: 'Dev / senior / tester / PM lens on each.',
            targetDate: day(7),
            tasks: [
              { title: 'Auth + landing pass', priority: 'high', dueDate: day(2), status: 'completed' },
              { title: 'Goals + milestones + tasks pass', priority: 'high', dueDate: day(4), status: 'in-progress' },
              { title: 'Coach + Feed + Profile pass', priority: 'high', dueDate: day(6), status: 'pending' },
            ],
          },
          {
            title: 'Seed data + share with friends',
            description: 'Make the app feel alive on first open.',
            targetDate: day(15),
            tasks: [
              { title: 'Run seed script', priority: 'medium', dueDate: day(1), status: 'completed' },
              { title: 'Invite 5 friends', priority: 'medium', dueDate: day(12), status: 'pending' },
            ],
          },
        ],
      },
    ],
    posts: [
      {
        content:
          'Seeded the demo with 6 themed users. Logging in as each one and the feed actually feels like a community now.',
      },
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB);
  console.log('🟢 Connected to Mongo\n');

  const passwordHash = await bcrypt.hash(SHARED_PASSWORD, 10);
  const userMap = new Map();
  let totalGoals = 0;
  let totalMilestones = 0;
  let totalTasks = 0;
  let totalPosts = 0;

  for (const seedUser of SEED_USERS) {
    let user = await User.findOne({ email: seedUser.email });
    if (!user) {
      user = await User.create({
        email: seedUser.email,
        name: seedUser.name,
        password: passwordHash,
        bio: seedUser.bio,
        location: seedUser.location,
      });
    } else {
      user.password = passwordHash;
      user.name = seedUser.name;
      user.bio = seedUser.bio;
      user.location = seedUser.location;
      user.goals = [];
      user.posts = [];
      await user.save();
    }
    userMap.set(seedUser.email, user);

    // Wipe and reseed this user's data only
    const oldGoals = await Goal.find({ user: user._id }).select('_id');
    const oldGoalIds = oldGoals.map((g) => g._id);
    await Task.deleteMany({ user: user._id });
    await Milestone.deleteMany({ user: user._id });
    await Goal.deleteMany({ _id: { $in: oldGoalIds } });
    await Post.deleteMany({ user: user._id });

    const goalIds = [];

    for (const g of seedUser.goals) {
      const goal = await Goal.create({
        user: user._id,
        title: g.title,
        description: g.description,
        category: g.category,
        status: g.status,
        priority: g.priority,
        dueDate: g.dueDate,
      });
      goalIds.push(goal._id);
      totalGoals += 1;

      const milestoneIds = [];
      const taskIds = [];

      for (const m of g.milestones) {
        const milestone = await Milestone.create({
          user: user._id,
          goal: goal._id,
          title: m.title,
          description: m.description,
          targetDate: m.targetDate,
        });
        milestoneIds.push(milestone._id);
        totalMilestones += 1;

        const milestoneTaskIds = [];
        for (const t of m.tasks) {
          const task = await Task.create({
            user: user._id,
            goal: goal._id,
            milestone: milestone._id,
            title: t.title,
            description: t.title,
            dueDate: t.dueDate,
            priority: t.priority,
            status: t.status,
            completedAt: t.status === 'completed' ? new Date() : null,
          });
          milestoneTaskIds.push(task._id);
          taskIds.push(task._id);
          totalTasks += 1;
        }

        milestone.tasks = milestoneTaskIds;
        await milestone.save();
      }

      goal.milestones = milestoneIds;
      goal.tasks = taskIds;
      await goal.save();
    }

    user.goals = goalIds;
    await user.save();

    for (const p of seedUser.posts) {
      const post = await Post.create({
        user: user._id,
        content: p.content,
      });
      user.posts.push(post._id);
      totalPosts += 1;
    }
    await user.save();

    console.log(
      `  ✅ ${seedUser.email}: ${seedUser.goals.length} goals, ${seedUser.posts.length} posts`
    );
  }

  // Follow graph
  console.log('\n🔗 Wiring follow graph...');
  const followEdges = [
    ['chintu@gmail.com', 'ironman@example.com'],
    ['chintu@gmail.com', 'jaggu@gmail.com'],
    ['chintu@gmail.com', 'trinadh@gmail.com'],
    ['jaggu@gmail.com', 'ironman@example.com'],
    ['jaggu@gmail.com', 'jaggu@example.com'],
    ['jaggu@gmail.com', 'chandu@gmail.com'],
    ['jaggu@gmail.com', 'trinadh@gmail.com'],
    ['jaggu@gmail.com', 'chintu@gmail.com'],
    ['trinadh@gmail.com', 'chandu@gmail.com'],
    ['chandu@gmail.com', 'trinadh@gmail.com'],
    ['ironman@example.com', 'jaggu@gmail.com'],
  ];

  // Reset follow lists for seed users only
  for (const u of userMap.values()) {
    u.followers = [];
    u.following = [];
    await u.save();
  }

  for (const [followerEmail, targetEmail] of followEdges) {
    const follower = userMap.get(followerEmail);
    const target = userMap.get(targetEmail);
    if (!follower || !target) continue;
    if (!follower.following.some((id) => String(id) === String(target._id))) {
      follower.following.push(target._id);
    }
    if (!target.followers.some((id) => String(id) === String(follower._id))) {
      target.followers.push(follower._id);
    }
    await follower.save();
    await target.save();
  }

  console.log(`\n📊 Summary`);
  console.log(`   Users seeded: ${userMap.size}`);
  console.log(`   Goals:        ${totalGoals}`);
  console.log(`   Milestones:   ${totalMilestones}`);
  console.log(`   Tasks:        ${totalTasks}`);
  console.log(`   Posts:        ${totalPosts}`);
  console.log(`   Follow edges: ${followEdges.length}`);
  console.log(`\n🔑 Login creds (all seeded users): ${SHARED_PASSWORD}`);
  console.log(`   Try:`);
  for (const u of SEED_USERS) {
    console.log(`     ${u.email}`);
  }

  await mongoose.disconnect();
  console.log('\n🟢 Done.');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
