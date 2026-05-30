require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');
const FAQ = require('./models/FAQ');
const OAQ = require('./models/OAQ');
const authRoutes = require('./routes/auth');
const oaqRoutes = require('./routes/oaq');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const aiRoutes = require('./routes/ai');
const { auth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const groqApiKey = process.env.GROQ_API_KEY;

/* ── Text indexes & search cache ── */
const searchCache = new Map();
const SEARCH_CACHE_TTL = 60000;

async function ensureIndexes() {
  try {
    await FAQ.collection.createIndex({ 'questions.q': 'text', 'questions.a': 'text' }, { name: 'faq_text' });
    await OAQ.collection.createIndex({ question: 'text' }, { name: 'oaq_text' });
    console.log('Text indexes ready');
  } catch (e) {
    console.log('Index note:', e.message);
  }
}

/* ── FAQ cache (5 min TTL) ── */
let faqCache = null;
let faqCacheTime = 0;
const FAQ_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/faq-app';

function connectDB(retrying) {
  mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 })
    .then(() => {
      console.log('Connected to MongoDB' + (retrying ? ' (retry)' : ''));
      if (!retrying) ensureIndexes();
    })
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
      if (!retrying) {
        console.log('Retrying in 3s...');
        setTimeout(() => connectDB(true), 3000);
      }
    });
}
connectDB(false);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/oaq', oaqRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);

/* ── FAQ listing (cached 5 min, sorted by views) ── */
app.get('/api/faqs', async (req, res) => {
  try {
    const now = Date.now();
    if (faqCache && now - faqCacheTime < FAQ_CACHE_TTL) {
      return res.json(faqCache);
    }
    const faqs = await FAQ.find().lean();
    for (const cat of faqs) {
      cat.questions.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    faqCache = faqs;
    faqCacheTime = now;
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Full-text search (like large-scale sites) ── */
app.get('/api/faqs/search', async (req, res) => {
  try {
    const query = req.query.q?.trim() || '';
    if (!query || query.length < 3) {
      const faqs = await FAQ.find().lean();
      return res.json(faqs);
    }

    const cacheKey = 'faqs:' + query.toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < SEARCH_CACHE_TTL) {
      return res.json(cached.data);
    }

    /* Full-text search via aggregation: unwind → score → rank → group */
    const pipe = [
      { $match: { $text: { $search: query } } },
      { $unwind: '$questions' },
      { $match: { $text: { $search: query } } },
      {
        $addFields: {
          score: { $meta: 'textScore' },
          qLower: { $toLower: '$questions.q' },
          aLower: { $toLower: '$questions.a' },
        },
      },
      {
        $addFields: {
          _relevance: {
            $cond: [{ $gte: [{ $indexOfCP: ['$qLower', query.toLowerCase()] }, 0] }, 3,
              { $cond: [{ $gte: [{ $indexOfCP: ['$aLower', query.toLowerCase()] }, 0] }, 1, 0] },
            ],
          },
        },
      },
      { $sort: { score: -1, _relevance: -1 } },
      { $limit: 20 },
      {
        $group: {
          _id: '$_id',
          category: { $first: '$category' },
          icon: { $first: '$icon' },
          questions: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 1,
          category: 1,
          icon: 1,
          questions: {
            $map: {
              input: '$questions',
              as: 'q',
              in: {
                _id: '$$q.questions._id',
                q: '$$q.questions.q',
                a: '$$q.questions.a',
                source: '$$q.questions.source',
                resolved: '$$q.questions.resolved',
                views: '$$q.questions.views',
                _relevance: '$$q._relevance',
                score: '$$q.score',
              },
            },
          },
        },
      },
    ];

    const results = await FAQ.aggregate(pipe);
    searchCache.set(cacheKey, { data: results, ts: Date.now() });
    res.json(results);
  } catch (err) {
    /* Fallback to regex search if $text fails */
    try {
      const query2 = req.query.q?.toLowerCase() || '';
      const words = query2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').split(/\s+/).filter(Boolean);
      const faqs = await FAQ.find({
        $or: words.map(w => ({ 'questions.q': { $regex: w, $options: 'i' } })),
      }).lean();
      const results = faqs.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q =>
          words.every(w => q.q.toLowerCase().includes(w))
        ),
      })).filter(cat => cat.questions.length > 0);
      res.json(results);
    } catch {
      res.status(500).json({ error: err.message });
    }
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

/* ── Unified search (FAQ + OAQ) with full-text ── */
app.get('/api/search/all', async (req, res) => {
  try {
    const query = req.query.q?.trim() || '';
    if (!query || query.length < 3) return res.json({ faq: [], oaq: [] });

    const cacheKey = 'all:' + query.toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < SEARCH_CACHE_TTL) {
      return res.json(cached.data);
    }

    const [faqPipe, oaqResults] = await Promise.all([
      FAQ.aggregate([
        { $match: { $text: { $search: query } } },
        { $unwind: '$questions' },
        { $match: { $text: { $search: query } } },
        { $addFields: { score: { $meta: 'textScore' } } },
        { $sort: { score: -1 } },
        { $limit: 10 },
        {
          $group: {
            _id: '$_id',
            category: { $first: '$category' },
            icon: { $first: '$icon' },
            questions: { $push: { q: '$questions.q', a: '$questions.a', source: '$questions.source', views: '$questions.views' } },
          },
        },
        { $project: { _id: 1, category: 1, icon: 1, questions: 1 } },
      ]),
      OAQ.find(
        { $text: { $search: query }, status: { $ne: 'rejected' } },
        { score: { $meta: 'textScore' } },
      )
        .sort({ score: -1 })
        .limit(10)
        .populate('submittedBy', 'name')
        .lean({ virtuals: true }),
    ]);

    const result = { faq: faqPipe, oaq: oaqResults };
    searchCache.set(cacheKey, { data: result, ts: Date.now() });
    res.json(result);
  } catch (err) {
    /* Fallback regex search */
    try {
      const q = req.query.q?.toLowerCase() || '';
      const words = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').split(/\s+/).filter(Boolean);
      const [faqFallback, oaqFallback] = await Promise.all([
        FAQ.find({ $or: words.map(w => ({ 'questions.q': { $regex: w, $options: 'i' } })) }).lean(),
        OAQ.find({
          $or: words.map(w => ({ question: { $regex: w, $options: 'i' } })),
          status: { $ne: 'rejected' },
        }).populate('submittedBy', 'name').lean({ virtuals: true }),
      ]);
      const faq = faqFallback.map(c => ({ ...c, questions: c.questions.filter(q => words.every(w => q.q.toLowerCase().includes(w))) })).filter(c => c.questions.length > 0);
      res.json({ faq, oaq: oaqFallback });
    } catch {
      res.status(500).json({ error: err.message });
    }
  }
});

/* ── Search suggestions (typo-tolerant) ── */
app.get('/api/search/suggest', async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || '';
    if (!query || query.length < 2) return res.json([]);

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    /* Prefix match for speed: finds questions starting with any word in the query */
    const words = escaped.split(/\s+/).filter(Boolean);
    const prefixRegex = words.map(w => new RegExp('\\b' + w, 'i'));

    const allQas = await FAQ.aggregate([
      { $unwind: '$questions' },
      {
        $match: {
          $or: prefixRegex.map(r => ({ 'questions.q': { $regex: r } })),
        },
      },
      { $project: { _id: 0, cat: '$category', q: '$questions.q' } },
      { $limit: 30 },
    ]);

    const oaqs = await OAQ.find(
      { $or: prefixRegex.map(r => ({ question: { $regex: r } })), status: { $ne: 'rejected' } },
    ).select('question').limit(20).lean();

    const seen = new Set();
    const suggestions = [];

    for (const item of allQas) {
      const key = item.q.toLowerCase();
      if (!seen.has(key)) { seen.add(key); suggestions.push({ text: item.q, type: 'FAQ', cat: item.cat }); }
    }
    for (const item of oaqs) {
      const key = item.question.toLowerCase();
      if (!seen.has(key)) { seen.add(key); suggestions.push({ text: item.question, type: 'OAQ' }); }
    }

    res.json(suggestions.slice(0, 8));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Homepage dashboard (public) ── */
app.get('/api/home', async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [categories, totalQuestions, faqData, trendingOaqs, latestOaqs, kbStats] = await Promise.all([
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
    ]);

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
        _score: (o.views || 0) * 3 + (o.answers?.length || 0) * 1,
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 5);

    const promotedCount = kbStats[0]?.count || 0;
    const promotedVotes = kbStats[0]?.totalVotes || 0;

    res.json({
      stats: {
        categories,
        questions: totalQuestions[0]?.total || 0,
        openOaqs: await OAQ.countDocuments({ status: 'open' }),
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
        _score: (o.views || 0) * 3 + (o.answers?.length || 0) * 1,
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

    let outOfScope = false;
    if (duplicates.length === 0) {
      const allFaqTexts = faqDupes.flatMap(c => c.questions.map(item => item.q + ' ' + item.a));
      let bestFuzzy = 0;
      for (const text of allFaqTexts) {
        const fs = fuzzyScore(text);
        if (fs > bestFuzzy) bestFuzzy = fs;
      }
      outOfScope = bestFuzzy < 0.2;
    }

    /* Validate with Groq AI if available */
    if (duplicates.length > 0 && groqApiKey) {
      const groq = new Groq({ apiKey: groqApiKey });
      const dup = duplicates[0];
      const completion = await groq.chat.completions.create({
        messages: [{
          role: 'user',
          content: `Are these two questions asking the same thing?
Existing: "${dup.text}"
New: "${question.trim()}"
Reply ONLY with JSON: { "isDuplicate": true/false, "reason": "brief explanation" }`,
        }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });
      const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
      if (!result.isDuplicate) {
        return res.json({ duplicates: [], outOfScope: false });
      }
    }

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
