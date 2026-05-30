require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const FAQ = require('./models/FAQ');
const OAQ = require('./models/OAQ');
const authRoutes = require('./routes/auth');
const oaqRoutes = require('./routes/oaq');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const aiRoutes = require('./routes/ai');
const suggestionsRoutes = require('./routes/suggestions');
const { auth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/faq-app';

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 1000,
  bufferCommands: false,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err.message));

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/oaq', oaqRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/suggestions', suggestionsRoutes);

/* ── FAQ listing ── */
app.get('/api/faqs', async (req, res) => {
  try {
    let faqs = [];
    try {
      faqs = await FAQ.find().lean();
    } catch (err) {
      console.warn('Mongoose query failed for /api/faqs, loading static fallback.');
    }
    if (!faqs || faqs.length === 0) {
      faqs = require('./data/fallbackFaqs.json');
    }
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Smart search with fuzzy matching ── */
app.get('/api/faqs/search', async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || '';
    if (!query) {
      const faqs = await FAQ.find().lean();
      return res.json(faqs);
    }

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const fuzzy = query.length >= 3 ? escaped.split('').join('.*') : escaped;
    const regex = new RegExp(fuzzy, 'i');

    const results = faqs.map(cat => ({
      ...cat,
      questions: cat.questions
        .filter(item => regex.test(item.q) || regex.test(item.a))
        .map(item => ({
          ...item,
          _relevance:
            (item.q.toLowerCase().includes(query) ? 3 : 0) +
            (item.a.toLowerCase().includes(query) ? 1 : 0),
        }))
        .sort((a, b) => b._relevance - a._relevance),
    })).filter(cat => cat.questions.length > 0);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Increment FAQ question view ── */
app.post('/api/faqs/:catId/questions/:qId/view', async (req, res) => {
  try {
    await FAQ.findOneAndUpdate(
      { _id: req.params.catId, 'questions._id': req.params.qId },
      { $inc: { 'questions.$.views': 1 } },
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Unified search (FAQ + OAQ) ── */
app.get('/api/search/all', async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || '';
    if (!query) return res.json({ faq: [], oaq: [] });

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const fuzzy = query.length >= 3 ? escaped.split('').join('.*') : escaped;
    const regex = new RegExp(fuzzy, 'i');

    let faqResults = [];
    let oaqResults = [];

    const dbConnected = mongoose.connection.readyState === 1;

    if (dbConnected) {
      try {
        [faqResults, oaqResults] = await Promise.all([
          FAQ.find({ $or: [{ 'questions.q': { $regex: regex } }, { 'questions.a': { $regex: regex } }] }).lean(),
          OAQ.find({ question: { $regex: regex }, status: { $ne: 'rejected' } })
            .populate('submittedBy', 'name')
            .lean({ virtuals: true }),
        ]);
      } catch (e) {
        console.warn('Mongoose query failed for unified search, using static fallback');
        faqResults = require('./data/fallbackFaqs.json');
      }
    } else {
      console.warn('MongoDB not connected. Loading static fallback for unified search');
      faqResults = require('./data/fallbackFaqs.json');
    }

    const faq = faqResults.map(cat => ({
      ...cat,
      questions: cat.questions
        .filter(item => regex.test(item.q) || regex.test(item.a))
        .map(item => ({
          ...item,
          _relevance:
            (item.q.toLowerCase().includes(query) ? 3 : 0) +
            (item.a.toLowerCase().includes(query) ? 1 : 0),
        }))
        .sort((a, b) => b._relevance - a._relevance),
    })).filter(cat => cat.questions.length > 0);

    res.json({ faq, oaq: oaqResults });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Search suggestions (typo-tolerant) ── */
app.get('/api/search/suggest', async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || '';
    if (!query || query.length < 2) return res.json([]);

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let allQas = [];
    let oaqs = [];

    const dbConnected = mongoose.connection.readyState === 1;

    if (dbConnected) {
      try {
        allQas = await FAQ.aggregate([
          { $unwind: '$questions' },
          { $project: { _id: 0, cat: '$category', q: '$questions.q', a: '$questions.a' } },
        ]);
        oaqs = await OAQ.find({ status: { $ne: 'rejected' } }).select('question').lean();
      } catch (e) {
        console.warn('Mongoose query failed for legacy suggestions, using static fallback');
        const staticData = require('./data/fallbackFaqs.json');
        allQas = staticData.flatMap(c => 
          c.questions.map(q => ({ cat: c.category, q: q.q, a: q.a }))
        );
      }
    } else {
      console.warn('MongoDB not connected. Loading static fallback for legacy suggestions');
      const staticData = require('./data/fallbackFaqs.json');
      allQas = staticData.flatMap(c => 
        c.questions.map(q => ({ cat: c.category, q: q.q, a: q.a }))
      );
    }

    const suggestions = [];

    for (const item of allQas) {
      if (item.q.toLowerCase().includes(escaped)) suggestions.push({ text: item.q, type: 'FAQ', cat: item.cat });
      else if (item.a.toLowerCase().includes(escaped)) suggestions.push({ text: item.a.slice(0, 80), type: 'FAQ', cat: item.cat });
    }

    for (const item of oaqs) {
      if (item.question.toLowerCase().includes(escaped)) suggestions.push({ text: item.question, type: 'OAQ' });
    }

    const seen = new Set();
    const unique = suggestions.filter(s => {
      const key = s.text.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    res.json(unique.slice(0, 8));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Homepage dashboard (public) ── */
app.get('/api/home', async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    let categories = 0;
    let totalQuestionsCount = 0;
    let faqData = [];
    let trendingOaqs = [];
    let latestOaqs = [];
    let kbStats = [];
    let openOaqsCount = 0;

    try {
      const [cats, totalQ, fData, tOaqs, lOaqs, kStats, openCount] = await Promise.all([
        FAQ.countDocuments(),
        FAQ.aggregate([{ $unwind: '$questions' }, { $count: 'total' }]),
        FAQ.find().select('category icon questions.q questions.a questions._id questions.source questions.resolved questions.views').lean(),
        OAQ.find({ createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'rejected' } })
          .populate('submittedBy', 'name')
          .lean({ virtuals: true }),
        OAQ.find({ status: { $ne: 'rejected' } })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('submittedBy', 'name')
          .lean({ virtuals: true }),
        OAQ.aggregate([
          { $match: { status: 'promoted' } },
          { $group: { _id: null, count: { $sum: 1 }, totalVotes: { $sum: { $size: { $ifNull: ['$votedUpBy', []] } } } } },
        ]),
        OAQ.countDocuments({ status: 'open' })
      ]);
      categories = cats;
      totalQuestionsCount = totalQ[0]?.total || 0;
      faqData = fData;
      trendingOaqs = tOaqs;
      latestOaqs = lOaqs;
      kbStats = kStats;
      openOaqsCount = openCount;
    } catch (e) {
      console.warn('Mongoose query failed for /api/home, using static fallback');
      const staticData = require('./data/fallbackFaqs.json');
      categories = staticData.length;
      faqData = staticData.map((c, i) => ({
        _id: c._id || `fallback-cat-${i}`,
        category: c.category,
        icon: c.icon,
        questions: c.questions.map((q, j) => ({
          _id: q._id || `fallback-q-${i}-${j}`,
          q: q.q,
          a: q.a,
          source: q.source || 'official',
          resolved: q.resolved !== false,
          views: q.views || 0
        }))
      }));
      totalQuestionsCount = faqData.reduce((acc, c) => acc + c.questions.length, 0);
    }

    const categoryCards = faqData.map(c => ({
      _id: c._id,
      category: c.category,
      icon: c.icon,
      count: c.questions.length,
      questions: (c.questions || []).map(q => ({ _id: q._id, q: q.q, a: q.a, source: q.source, resolved: q.resolved, views: q.views })),
    }));

    const trending = trendingOaqs
      .map(o => ({
        ...o,
        _score: (o.upvotes || 0) * 3 + (o.views || 0) * 0.5 + (o.answers?.length || 0) * 2,
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 5);

    const promotedCount = kbStats[0]?.count || 0;
    const promotedVotes = kbStats[0]?.totalVotes || 0;

    res.json({
      stats: {
        categories,
        questions: totalQuestionsCount,
        openOaqs: openOaqsCount,
        promotedCount,
        promotedVotes,
      },
      categoryCards,
      trending,
      latest: latestOaqs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Authenticated dashboard ── */
app.get('/api/dashboard', auth, async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalFaqs, categories, openOaqs, trendingOaqs, userOaqs, kbStats] = await Promise.all([
      FAQ.aggregate([{ $unwind: '$questions' }, { $count: 'total' }]),
      FAQ.countDocuments(),
      OAQ.countDocuments({ status: 'open' }),
      OAQ.find({ createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'rejected' } })
        .populate('submittedBy', 'name')
        .lean({ virtuals: true }),
      OAQ.find({ submittedBy: req.user._id }).sort({ createdAt: -1 }).limit(5).lean({ virtuals: true }),
      OAQ.aggregate([
        { $match: { status: 'promoted' } },
        { $group: { _id: null, count: { $sum: 1 }, totalVotes: { $sum: { $size: { $ifNull: ['$votedUpBy', []] } } } } },
      ]),
    ]);

    const trending = trendingOaqs
      .map(o => ({
        ...o,
        _score: (o.upvotes || 0) * 3 + (o.views || 0) * 0.5 + (o.answers?.length || 0) * 2,
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 5);

    const promotedCount = kbStats[0]?.count || 0;
    const promotedVotes = kbStats[0]?.totalVotes || 0;

    res.json({
      user: req.user,
      stats: {
        categories,
        questions: totalFaqs[0]?.total || 0,
        openOaqs,
        promotedCount,
        promotedVotes,
      },
      trending,
      myOaqs: userOaqs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── AI: Related recommendations ── */
app.get('/api/ai/related', async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || '';
    if (!query || query.length < 2) return res.json({ faq: [], oaq: [] });

    const stopWords = new Set(['what', 'how', 'why', 'when', 'where', 'which', 'who', 'whom', 'whose', 'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'do', 'does', 'did', 'done', 'doing', 'is', 'am', 'are', 'was', 'were', 'be', 'being', 'been', 'has', 'have', 'had', 'get', 'gets', 'got', 'use', 'used', 'using', 'make', 'makes', 'made', 'need', 'needs', 'needed']);
    const words = query.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    if (words.length === 0) return res.json({ faq: [], oaq: [] });

    const wordRegexes = words.map(w => new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

    const [faqMatches, oaqMatches] = await Promise.all([
      FAQ.find({ $or: wordRegexes.flatMap(r => [{ 'questions.q': r }, { 'questions.a': r }]) }).lean(),
      OAQ.find({
        $or: wordRegexes.flatMap(r => [{ question: r }, { description: r }]),
        status: { $ne: 'rejected' },
      }).populate('submittedBy', 'name').lean({ virtuals: true }),
    ]);

    const faq = faqMatches.map(cat => ({
      ...cat,
      questions: cat.questions.filter(item =>
        words.some(w => {
          const r = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
          return r.test(item.q) || r.test(item.a);
        })
      ),
    })).filter(cat => cat.questions.length > 0);

    res.json({ faq, oaq: oaqMatches.slice(0, 5) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── AI: Check duplicates ── */
app.post('/api/ai/check-duplicate', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) return res.json({ duplicates: [], outOfScope: false });

    const q = question.toLowerCase().trim();
    const words = q.split(/\s+/).filter(w => w.length > 2);
    if (words.length === 0) return res.json({ duplicates: [], outOfScope: false });

    /* fuzzy char-level regex — same as FAQ search */
    const fuzzyTerms = words.map(w => new RegExp(w.split('').join('.*'), 'i'));
    const exactWords = words.map(w => new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

    const [faqDupes, oaqDupes] = await Promise.all([
      FAQ.find({ $or: exactWords.flatMap(r => [{ 'questions.q': r }, { 'questions.a': r }]) }).lean(),
      OAQ.find({ $or: exactWords.map(r => ({ question: r })), status: { $ne: 'rejected' } }).lean(),
    ]);

    /* fuzzy word-overlap score using full question */
    const allQWords = q.split(/\s+/);
    const score = (text) => {
      const lower = text.toLowerCase();
      const matched = allQWords.filter(w => lower.includes(w)).length;
      return matched / allQWords.length;
    };

    /* fuzzy char-overlap score for out-of-scope detection */
    const fuzzyScore = (text) => {
      const lower = text.toLowerCase();
      const matches = fuzzyTerms.filter(reg => reg.test(lower));
      return matches.length / words.length;
    };

    const duplicates = [
      ...faqDupes.flatMap(c =>
        c.questions
          .filter(item => score(item.q) > 0.4)
          .map(i => ({ text: i.q, source: 'FAQ', score: score(i.q) }))
      ),
      ...oaqDupes
        .filter(o => score(o.question) > 0.4)
        .map(o => ({ text: o.question, source: 'OAQ', id: o._id, score: score(o.question) })),
    ]
      .sort((a, b) => b.score - a.score)
      .slice(0, 1);

    /* check if question is out of scope — fuzzy-match against ALL FAQ text */
    const allFaqTexts = faqDupes.flatMap(c => c.questions.map(item => item.q + ' ' + item.a));
    let bestFuzzy = 0;
    for (const text of allFaqTexts) {
      const fs = fuzzyScore(text);
      if (fs > bestFuzzy) bestFuzzy = fs;
    }
    const outOfScope = bestFuzzy < 0.2 && duplicates.length === 0;

    res.json({ duplicates, outOfScope });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Leaderboard ── */
app.get('/api/leaderboard', async (req, res) => {
  try {
    const oaqs = await OAQ.find({ status: { $ne: 'rejected' } })
      .populate('submittedBy', 'name email')
      .lean({ virtuals: true });

    const userMap = {};

    for (const oaq of oaqs) {
      const uid = oaq.submittedBy?._id?.toString();
      if (!uid) continue;
      if (!userMap[uid]) {
        userMap[uid] = {
          _id: uid,
          name: oaq.submittedBy.name || 'Anonymous',
          email: oaq.submittedBy.email || '',
          questionsAsked: 0,
          answersGiven: 0,
          upvotesReceived: 0,
          downvotesReceived: 0,
          acceptedCount: 0,
          promotedCount: 0,
          score: 0,
        };
      }

      const u = userMap[uid];
      u.questionsAsked++;
      u.upvotesReceived += (oaq.votedUpBy || []).length;
      u.downvotesReceived += (oaq.votedDownBy || []).length;
      if (oaq.status === 'promoted') u.promotedCount++;

      for (const ans of oaq.answers) {
        const ansUid = ans.submittedBy?._id?.toString();
        if (!ansUid) continue;
        if (!userMap[ansUid]) {
          const ansUser = ans.submittedBy || {};
          userMap[ansUid] = {
            _id: ansUid,
            name: ansUser.name || 'Anonymous',
            email: ansUser.email || '',
            questionsAsked: 0,
            answersGiven: 0,
            upvotesReceived: 0,
            downvotesReceived: 0,
            acceptedCount: 0,
            promotedCount: 0,
            score: 0,
          };
        }
        const a = userMap[ansUid];
        a.answersGiven++;
        a.upvotesReceived += (ans.votedUpBy || []).length;
        a.downvotesReceived += (ans.votedDownBy || []).length;
        if (ans.accepted) a.acceptedCount++;
      }
    }

    const users = Object.values(userMap);
    for (const u of users) {
      u.score =
        u.questionsAsked * 5 +
        u.answersGiven * 10 +
        u.upvotesReceived * 3 +
        u.downvotesReceived * -2 +
        u.acceptedCount * 25 +
        u.promotedCount * 50;
    }

    users.sort((a, b) => b.score - a.score);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`FAQ API server running on http://localhost:${PORT}`);
});
