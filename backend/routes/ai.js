const express = require('express');
const Groq = require('groq-sdk');
const OAQ = require('../models/OAQ');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

const groqApiKey = process.env.GROQ_API_KEY;

/* ── AI summarize answers for an OAQ ── */
router.post('/summarize/:oaqId', auth, admin, async (req, res) => {
  try {
    if (!groqApiKey) {
      return res.status(400).json({ error: 'GROQ_API_KEY not configured. Add it to .env' });
    }

    const oaq = await OAQ.findById(req.params.oaqId)
      .populate('answers.submittedBy', 'name');
    if (!oaq) return res.status(404).json({ error: 'OAQ not found' });
    if (!oaq.answers || oaq.answers.length === 0) {
      return res.status(400).json({ error: 'No answers to summarize' });
    }

    const groq = new Groq({ apiKey: groqApiKey });

    const answersText = oaq.answers.map((a, i) =>
      `Answer ${i + 1} (by ${a.submittedBy?.name || 'Anonymous'}):\n${a.text}`
    ).join('\n\n---\n\n');

    const prompt = `You are an AI assistant helping an admin review community answers.

Given the question: "${oaq.question}"

Here are the answers provided by the community:

${answersText}

Please provide:
1. A brief summary of the key points across all answers (2-3 sentences).
2. Which answer number is the best and most accurate, and why.

Respond in JSON format like this:
{
  "summary": "your summary here",
  "bestAnswerIndex": <number>,
  "reason": "why this answer is best"
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');

    res.json({
      summary: result.summary || '',
      bestAnswerIndex: result.bestAnswerIndex != null ? result.bestAnswerIndex - 1 : -1,
      reason: result.reason || '',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── AI check if question is relevant to FAQ topics ── */
router.post('/check-question/:oaqId', auth, admin, async (req, res) => {
  try {
    if (!groqApiKey) {
      return res.status(400).json({ error: 'GROQ_API_KEY not configured. Add it to .env' });
    }

    const oaq = await OAQ.findById(req.params.oaqId)
      .populate('submittedBy', 'name');
    if (!oaq) return res.status(404).json({ error: 'OAQ not found' });

    const groq = new Groq({ apiKey: groqApiKey });

    const prompt = `You are an AI assistant helping moderate a community Q&A forum for the Vicharanashala Internship at IIT Ropar.

The forum covers these topics: About the internship, Timing & Dates, NOC (No Objection Certificate), Selection & Offer Letter, Work & Mentorship, Code of Conduct, Interviews, Certificate, Rosetta (Internship Journal), Coursework & ViBe LMS, Yaksha Chat, ViBe Platform, Team Formation.

A user submitted this question:
"${oaq.question}"

Description (if any): "${oaq.description || 'none'}"

Determine if this question is related to the Vicharanashala Internship (on-topic) or if it is spam / unrelated.

Respond in JSON format:
{
  "relevant": true/false,
  "reason": "brief explanation why",
  "confidence": "high/medium/low"
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');

    res.json({
      relevant: result.relevant !== false,
      reason: result.reason || '',
      confidence: result.confidence || 'low',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
