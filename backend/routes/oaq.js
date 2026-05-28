const express = require('express');
const mongoose = require('mongoose');
const OAQ = require('../models/OAQ');
const FAQ = require('../models/FAQ');
const Notification = require('../models/Notification');
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

    /* score using ALL words in the question */
    const allQWords = q.split(/\s+/);
    const score = (text) => {
      const lower = text.toLowerCase();
      const matched = allQWords.filter(w => lower.includes(w)).length;
      return matched / allQWords.length;
    };

    /* fuzzy char-level score for out-of-scope detection */
    const fuzzyTerms = words.map(w => new RegExp(w.split('').join('.*'), 'i'));
    const fuzzyScore = (text) => {
      const lower = text.toLowerCase();
      const matches = fuzzyTerms.filter(reg => reg.test(lower));
      return matches.length / words.length;
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

    /* out-of-scope detection */
    let outOfScope = false;
    if (allDupes.length === 0) {
      const allFaqTexts = faqDupes.flatMap(c => c.questions.map(item => item.q + ' ' + item.a));
      let bestFuzzy = 0;
      for (const text of allFaqTexts) {
        const fs = fuzzyScore(text);
        if (fs > bestFuzzy) bestFuzzy = fs;
      }
      outOfScope = bestFuzzy < 0.2;
    }

    if (allDupes.length > 0) {
      return res.status(409).json({ duplicates: allDupes, outOfScope });
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

    if (oaq.submittedBy.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: oaq.submittedBy,
        type: 'answer',
        message: `${req.user.name} answered your question: "${oaq.question.slice(0, 60)}${oaq.question.length > 60 ? '…' : ''}"`,
        link: '/community',
      });
    }

    const updated = await OAQ.findById(oaq._id)
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');

    res.status(201).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Vote on OAQ ── */
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { value } = req.body;
    if (![1, -1].includes(value)) return res.status(400).json({ error: 'Value must be 1 or -1' });

    const userId = req.user._id;
    const oaq = await OAQ.findById(req.params.id);
    if (!oaq) return res.status(404).json({ error: 'Not found' });

    const alreadyUp = oaq.votedUpBy.some(id => id.equals(userId));
    const alreadyDown = oaq.votedDownBy.some(id => id.equals(userId));

    if (value === 1) {
      if (alreadyUp) {
        oaq.votedUpBy.pull(userId);
      } else {
        if (alreadyDown) oaq.votedDownBy.pull(userId);
        oaq.votedUpBy.push(userId);
      }
    } else {
      if (alreadyDown) {
        oaq.votedDownBy.pull(userId);
      } else {
        if (alreadyUp) oaq.votedUpBy.pull(userId);
        oaq.votedDownBy.push(userId);
      }
    }

    await oaq.save();

    /* ── Auto-promote ── */
    const netVotes = (oaq.votedUpBy || []).length - (oaq.votedDownBy || []).length;
    if (netVotes >= 10 && oaq.status === 'approved') {
      const bestAnswer = oaq.answers.find(a => a.accepted) ||
        oaq.answers.sort((a, b) => (b.votedUpBy.length - b.votedDownBy.length) - (a.votedUpBy.length - a.votedDownBy.length))[0];
      const answerText = bestAnswer ? bestAnswer.text : oaq.question;

      const catName = oaq.category || 'Community Questions';
      let targetCat = await FAQ.findOne({ category: catName });
      if (!targetCat) {
        targetCat = await FAQ.create({ category: catName, icon: '🌐', questions: [] });
      }
      targetCat.questions.push({ q: oaq.question, a: answerText, source: 'community', resolved: true });
      await targetCat.save();

      oaq.status = 'promoted';
      oaq.promotedCount = (oaq.promotedCount || 0) + 1;
      await oaq.save();

      await Notification.create({
        user: oaq.submittedBy,
        type: 'promoted',
        message: `Your question was auto-promoted to FAQ: "${oaq.question.slice(0, 60)}${oaq.question.length > 60 ? '…' : ''}"`,
        link: '/faq',
      });
    }

    const updated = await OAQ.findById(oaq._id)
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Vote on Answer ── */
router.post('/:id/answers/:answerId/vote', auth, async (req, res) => {
  try {
    const { value } = req.body;
    if (![1, -1].includes(value)) return res.status(400).json({ error: 'Value must be 1 or -1' });

    const userId = req.user._id;
    const oaq = await OAQ.findById(req.params.id);
    if (!oaq) return res.status(404).json({ error: 'Not found' });

    const answer = oaq.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    const alreadyUp = answer.votedUpBy.some(id => id.equals(userId));
    const alreadyDown = answer.votedDownBy.some(id => id.equals(userId));

    if (value === 1) {
      if (alreadyUp) {
        answer.votedUpBy.pull(userId);
      } else {
        if (alreadyDown) answer.votedDownBy.pull(userId);
        answer.votedUpBy.push(userId);
      }
    } else {
      if (alreadyDown) {
        answer.votedDownBy.pull(userId);
      } else {
        if (alreadyUp) answer.votedUpBy.pull(userId);
        answer.votedDownBy.push(userId);
      }
    }

    await oaq.save();

    const updated = await OAQ.findById(oaq._id)
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

    await Notification.create({
      user: oaq.submittedBy._id,
      type: 'approved',
      message: `Your question was approved: "${oaq.question.slice(0, 60)}${oaq.question.length > 60 ? '…' : ''}"`,
      link: '/community',
    });

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

    await Notification.create({
      user: oaq.submittedBy._id,
      type: 'system',
      message: `Your question was rejected: "${oaq.question.slice(0, 60)}${oaq.question.length > 60 ? '…' : ''}"`,
      link: '/community',
    });

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

    const acceptedAnswer = oaq.answers.find(a => a.accepted);
    const bestAnswer = acceptedAnswer || oaq.answers.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))[0];
    const answerText = bestAnswer ? bestAnswer.text : oaq.question;

    const catName = oaq.category || 'Community Questions';
    let targetCat = await FAQ.findOne({ category: catName });
    if (!targetCat) {
      targetCat = await FAQ.create({ category: catName, icon: '🌐', questions: [] });
    }

    targetCat.questions.push({
      q: oaq.question,
      a: answerText,
      source: 'community',
      resolved: true,
    });
    await targetCat.save();

    oaq.status = 'promoted';
    oaq.promotedCount = (oaq.promotedCount || 0) + 1;
    await oaq.save();

    await Notification.create({
      user: oaq.submittedBy._id,
      type: 'promoted',
      message: `Your question was promoted to FAQ: "${oaq.question.slice(0, 60)}${oaq.question.length > 60 ? '…' : ''}"`,
      link: '/faq',
    });

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

/* ── Admin: accept answer ── */
router.put('/:id/answers/:answerId/accept', auth, admin, async (req, res) => {
  try {
    const oaq = await OAQ.findById(req.params.id);
    if (!oaq) return res.status(404).json({ error: 'Not found' });

    const answer = oaq.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    answer.accepted = !answer.accepted;
    await oaq.save();

    if (answer.accepted && answer.submittedBy) {
      await Notification.create({
        user: answer.submittedBy,
        type: 'accepted',
        message: `Your answer was accepted on: "${oaq.question.slice(0, 60)}${oaq.question.length > 60 ? '…' : ''}"`,
        link: '/community',
      });
    }

    const updated = await OAQ.findById(oaq._id)
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
