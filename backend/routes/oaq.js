const express = require('express');
const mongoose = require('mongoose');
const OAQ = require('../models/OAQ');
const FAQ = require('../models/FAQ');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

/* ── List OAQs ── */
router.get('/', async (req, res) => {
  try {
    const { status, sort } = req.query;
    const filter = {};
    if (status && ['open', 'approved', 'promoted', 'rejected'].includes(status)) {
      filter.status = status;
    }
    let sortOpt = { createdAt: -1 };
    if (sort === 'votes') sortOpt = { createdAt: -1 };
    if (sort === 'trending') sortOpt = { createdAt: -1 };
    const oaqs = await OAQ.find(filter)
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name')
      .sort(sortOpt);
    res.json(oaqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Increment OAQ view ── */
router.post('/:id/view', async (req, res) => {
  try {
    await OAQ.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Get single OAQ ── */
router.get('/:id', async (req, res) => {
  try {
    const oaq = await OAQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    )
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');
    if (!oaq) return res.status(404).json({ error: 'Not found' });
    res.json(oaq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Submit OAQ (with duplicate check) ── */
router.post('/', auth, async (req, res) => {
  try {
    const { question, description, category } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const q = question.toLowerCase().trim();
    const words = q.split(/\s+/).filter(w => w.length > 2);
    const wordRegexes = words.map(w => new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

    const [faqDupes, oaqDupes] = await Promise.all([
      FAQ.find({ $or: wordRegexes.flatMap(r => [{ 'questions.q': r }, { 'questions.a': r }]) }).lean(),
      OAQ.find({ $or: wordRegexes.map(r => ({ question: r })), status: { $ne: 'rejected' } }).lean(),
    ]);

    const score = (text) => {
      const lower = text.toLowerCase();
      const matched = words.filter(w => lower.includes(w)).length;
      return matched / words.length;
    };

    const allDupes = [
      ...faqDupes.flatMap(c =>
        c.questions
          .filter(item => score(item.q) > 0.4)
          .map(i => ({ text: i.q, source: 'FAQ', score: score(i.q) }))
      ),
      ...oaqDupes
        .filter(o => score(o.question) > 0.4)
        .map(o => ({ text: o.question, source: 'OAQ', id: o._id, score: score(o.question) })),
    ].sort((a, b) => b.score - a.score);

    if (allDupes.length > 0) {
      return res.status(409).json({ duplicates: allDupes });
    }

    const oaq = await OAQ.create({
      question: question.trim(),
      description: description?.trim() || '',
      category: category?.trim() || '',
      submittedBy: req.user._id,
    });
    await oaq.populate('submittedBy', 'name');

    res.status(201).json(oaq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Submit answer ── */
router.post('/:id/answers', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Answer text is required' });

    const oaq = await OAQ.findById(req.params.id);
    if (!oaq) return res.status(404).json({ error: 'OAQ not found' });
    if (oaq.status === 'promoted' || oaq.status === 'rejected') {
      return res.status(400).json({ error: 'Cannot answer a promoted or rejected question' });
    }

    oaq.answers.push({ text: text.trim(), submittedBy: req.user._id });
    await oaq.save();

    const updated = await OAQ.findById(oaq._id)
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');

    res.status(201).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Vote on OAQ (testing mode: unlimited, no dedup) ── */
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { value } = req.body;
    if (![1, -1].includes(value)) return res.status(400).json({ error: 'Value must be 1 or -1' });

    const userId = req.user._id;
    if (value === 1) {
      await OAQ.findByIdAndUpdate(req.params.id, { $push: { votedUpBy: userId } });
    } else {
      await OAQ.findByIdAndUpdate(req.params.id, { $push: { votedDownBy: userId } });
    }

    const updated = await OAQ.findById(req.params.id)
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Vote on Answer (testing mode: unlimited, no dedup) ── */
router.post('/:id/answers/:answerId/vote', auth, async (req, res) => {
  try {
    const { value } = req.body;
    if (![1, -1].includes(value)) return res.status(400).json({ error: 'Value must be 1 or -1' });

    const userId = req.user._id;
    if (value === 1) {
      await OAQ.findOneAndUpdate(
        { _id: req.params.id, 'answers._id': req.params.answerId },
        { $push: { 'answers.$.votedUpBy': userId } },
      );
    } else {
      await OAQ.findOneAndUpdate(
        { _id: req.params.id, 'answers._id': req.params.answerId },
        { $push: { 'answers.$.votedDownBy': userId } },
      );
    }

    const updated = await OAQ.findById(req.params.id)
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Admin: approve ── */
router.put('/:id/approve', auth, admin, async (req, res) => {
  try {
    const oaq = await OAQ.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true })
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');
    if (!oaq) return res.status(404).json({ error: 'Not found' });
    res.json(oaq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Admin: reject ── */
router.put('/:id/reject', auth, admin, async (req, res) => {
  try {
    const oaq = await OAQ.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true })
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');
    if (!oaq) return res.status(404).json({ error: 'Not found' });
    res.json(oaq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Admin: promote to FAQ ── */
router.put('/:id/promote', auth, admin, async (req, res) => {
  try {
    const oaq = await OAQ.findById(req.params.id).populate('submittedBy', 'name');
    if (!oaq) return res.status(404).json({ error: 'Not found' });

    const bestAnswer = oaq.answers.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))[0];
    const answerText = bestAnswer ? bestAnswer.text : oaq.question;

    let communityCat = await FAQ.findOne({ category: 'Community Questions' });
    if (!communityCat) {
      communityCat = await FAQ.create({
        category: 'Community Questions',
        icon: '🌐',
        questions: [],
      });
    }

    communityCat.questions.push({
      q: oaq.question,
      a: answerText,
      source: 'community',
      resolved: true,
    });
    await communityCat.save();

    oaq.status = 'promoted';
    oaq.promotedCount = (oaq.promotedCount || 0) + 1;
    await oaq.save();

    res.json({ message: 'Promoted to FAQ', oaq });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Admin: edit answer ── */
router.put('/:id/answers/:answerId', auth, admin, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Text is required' });

    const oaq = await OAQ.findOneAndUpdate(
      { _id: req.params.id, 'answers._id': req.params.answerId },
      { $set: { 'answers.$.text': text.trim() } },
      { new: true },
    )
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');
    if (!oaq) return res.status(404).json({ error: 'Not found' });
    res.json(oaq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
