const axios = require('axios');
const Goal = require('../models/Goal.model');
const Milestone = require('../models/Milestone.model');
const Task = require('../models/Task.model');

const SYSTEM_PROMPT = (user, context) => `You are FocusFlow Coach — a friendly, focused, no-nonsense AI productivity coach. You help ${user.name || 'the user'} make progress on their goals.

Today's date: ${new Date().toISOString().split('T')[0]}

You have access to the user's current state below. Use it to give specific, actionable advice. Reference their actual goals and tasks by name. Be concise (3-6 short paragraphs unless they ask for more). Use short markdown lists when listing steps or tasks. Never invent goals or tasks that aren't in the data.

If they ask "what should I work on today?" — pick 1-3 specific tasks from their pending list, prioritized by due date and goal priority, and explain why.

If they ask about progress, give honest numbers from the data.

If they ask vague questions, ask one clarifying question first.

Avoid platitudes. Be a friend who happens to know their plan.

=== USER CONTEXT ===
${context}
=== END CONTEXT ===`;

const buildUserContext = async (userId) => {
  const [goals, milestones, tasks, recentCompleted] = await Promise.all([
    Goal.find({ user: userId }).sort({ createdAt: -1 }).limit(20).lean(),
    Milestone.find({ user: userId })
      .populate('goal', 'title')
      .sort({ targetDate: 1 })
      .limit(30)
      .lean(),
    Task.find({ user: userId })
      .populate('goal', 'title')
      .populate('milestone', 'title')
      .sort({ dueDate: 1 })
      .limit(60)
      .lean(),
    Task.find({
      user: userId,
      status: 'completed',
      completedAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    })
      .sort({ completedAt: -1 })
      .limit(30)
      .lean(),
  ]);

  const fmtDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : '—');

  const taskByGoal = new Map();
  for (const t of tasks) {
    const gid = t.goal?._id?.toString() || 'unassigned';
    if (!taskByGoal.has(gid)) taskByGoal.set(gid, []);
    taskByGoal.get(gid).push(t);
  }

  let ctx = `## Goals (${goals.length})\n`;
  if (goals.length === 0) {
    ctx += 'No goals yet.\n';
  } else {
    for (const g of goals) {
      const gTasks = taskByGoal.get(g._id.toString()) || [];
      const total = gTasks.length;
      const done = gTasks.filter((t) => t.status === 'completed').length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      ctx += `- "${g.title}" — ${g.status || 'unset'}, ${
        g.priority || 'unset'
      } priority, due ${fmtDate(g.dueDate)}. Progress: ${done}/${total} tasks (${pct}%)\n`;
    }
  }

  ctx += `\n## Milestones (${milestones.length})\n`;
  if (milestones.length === 0) {
    ctx += 'No milestones yet.\n';
  } else {
    for (const m of milestones) {
      ctx += `- "${m.title}" (under "${
        m.goal?.title || 'unassigned'
      }") — target ${fmtDate(m.targetDate)}\n`;
    }
  }

  const pending = tasks.filter((t) => t.status !== 'completed');
  ctx += `\n## Pending tasks (${pending.length})\n`;
  if (pending.length === 0) {
    ctx += 'No pending tasks.\n';
  } else {
    for (const t of pending.slice(0, 40)) {
      ctx += `- "${t.title}" — ${t.priority || 'unset'} priority, due ${fmtDate(
        t.dueDate
      )}, goal: "${t.goal?.title || '—'}", milestone: "${
        t.milestone?.title || '—'
      }"\n`;
    }
  }

  ctx += `\n## Completed in last 7 days (${recentCompleted.length})\n`;
  if (recentCompleted.length === 0) {
    ctx += 'Nothing completed in the last 7 days.\n';
  } else {
    for (const t of recentCompleted) {
      ctx += `- "${t.title}" (completed ${fmtDate(t.completedAt)})\n`;
    }
  }

  return ctx;
};

const chat = async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: 'messages array is required' });
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage?.content?.trim?.()) {
    return res.status(400).json({ message: 'last message must have content' });
  }

  // Defensive: cap incoming history to last 20 turns to keep prompt size bounded
  const trimmed = messages.slice(-20).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content).slice(0, 4000),
  }));

  try {
    const userContext = await buildUserContext(req.user._id);
    const systemPrompt = SYSTEM_PROMPT(req.user, userContext);

    const cohereResponse = await axios.post(
      'https://api.cohere.com/v2/chat',
      {
        model: 'command-r-08-2024',
        messages: [{ role: 'system', content: systemPrompt }, ...trimmed],
        temperature: 0.4,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const contentParts = cohereResponse.data?.message?.content || [];
    const reply = contentParts.map((p) => p.text || '').join('').trim();

    if (!reply) {
      return res.status(502).json({ message: 'AI returned an empty response' });
    }

    res.status(200).json({
      reply,
      role: 'assistant',
    });
  } catch (error) {
    const upstream = error.response?.data;
    res.status(502).json({
      message: 'AI coach failed',
      error: error.message,
      upstream,
    });
  }
};

module.exports = { chat };
