const express = require('express');
const searchService = require('../services/searchService');

const router = express.Router();

/* ── Auto-Completion ── */
router.get('/autocomplete', async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query.trim()) {
      return res.json([]);
    }

    const suggestions = await searchService.autocomplete(query);
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Intelligent Search Suggestions (TF-IDF & Cosine Similarity) ── */
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query.trim()) {
      return res.json([]);
    }

    const results = await searchService.searchSuggestions(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
