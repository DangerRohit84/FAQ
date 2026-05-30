const natural = require('natural');
const FAQ = require('../models/FAQ');

/**
 * Normalizes and tokenizes text.
 */
function tokenize(text) {
  return text.toLowerCase().trim().split(/\s+/).filter(Boolean);
}

/**
 * Calculates cosine similarity between a query document and a target document in a TfIdf instance.
 * @param {natural.TfIdf} tfidf 
 * @param {number} queryIndex 
 * @param {number} docIndex 
 * @returns {number} similarity score between 0 and 1
 */
function calculateCosineSimilarity(tfidf, queryIndex, docIndex) {
  const queryTerms = tfidf.listTerms(queryIndex);
  const docTerms = tfidf.listTerms(docIndex);

  const queryMap = {};
  let queryMagSq = 0;
  for (const term of queryTerms) {
    queryMap[term.term] = term.tfidf;
    queryMagSq += term.tfidf * term.tfidf;
  }

  const docMap = {};
  let docMagSq = 0;
  for (const term of docTerms) {
    docMap[term.term] = term.tfidf;
    docMagSq += term.tfidf * term.tfidf;
  }

  if (queryMagSq === 0 || docMagSq === 0) {
    return 0;
  }

  let dotProduct = 0;
  for (const term of queryTerms) {
    if (docMap[term.term]) {
      dotProduct += term.tfidf * docMap[term.term];
    }
  }

  return dotProduct / (Math.sqrt(queryMagSq) * Math.sqrt(docMagSq));
}

/**
 * Core prefix matching algorithm for autocomplete queries.
 * Supports multi-word queries matching sequential word prefixes.
 */
function getPrefixMatchScore(questionText, queryText) {
  const cleanQ = questionText.toLowerCase().trim();
  const cleanQuery = queryText.toLowerCase().trim();
  
  if (cleanQ.startsWith(cleanQuery)) {
    return 100 + (cleanQuery.length / cleanQ.length) * 10;
  }

  const questionWords = cleanQ.split(/\s+/);
  const queryWords = cleanQuery.split(/\s+/);

  let qIdx = 0;
  for (let i = 0; i < questionWords.length && qIdx < queryWords.length; i++) {
    if (questionWords[i].startsWith(queryWords[qIdx])) {
      qIdx++;
    }
  }

  if (qIdx === queryWords.length) {
    return 50 + queryWords.length;
  }

  return 0;
}

/**
 * Retrieve all FAQs flattened into a clean document structure.
 */
async function getAllFAQs() {
  const categories = await FAQ.find().lean();
  const allFaqs = [];
  
  for (const cat of categories) {
    if (cat.questions && Array.isArray(cat.questions)) {
      for (const qObj of cat.questions) {
        allFaqs.push({
          _id: qObj._id,
          category: cat.category,
          categoryIcon: cat.icon,
          q: qObj.q,
          a: qObj.a,
          source: qObj.source || 'official',
          resolved: qObj.resolved !== false,
          views: qObj.views || 0
        });
      }
    }
  }
  return allFaqs;
}

/**
 * 1. Autocomplete Endpoint Logic
 * Performs rapid prefix matching on FAQ questions.
 */
async function autocomplete(query) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const allFaqs = await getAllFAQs();
  const matched = [];

  for (const item of allFaqs) {
    const score = getPrefixMatchScore(item.q, cleanQuery);
    if (score > 0) {
      matched.push({
        q: item.q,
        category: item.category,
        categoryIcon: item.categoryIcon,
        score
      });
    }
  }

  // Sort by match score descending, then by views descending
  matched.sort((a, b) => b.score - a.score || b.views - a.views);

  // Return top 5 unique questions
  const seen = new Set();
  const unique = [];
  for (const item of matched) {
    const key = item.q.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({
        q: item.q,
        category: item.category,
        categoryIcon: item.categoryIcon
      });
      if (unique.length === 5) break;
    }
  }

  return unique;
}

/**
 * 2. Intelligent Search Suggestions (TF-IDF & Cosine Similarity)
 * Ranks all FAQs by relevance to the query.
 */
async function searchSuggestions(query) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const allFaqs = await getAllFAQs();
  if (allFaqs.length === 0) return [];

  const tfidf = new natural.TfIdf();

  // Add all FAQ questions as documents in the corpus
  allFaqs.forEach(item => {
    tfidf.addDocument(item.q);
  });

  // Add user query as the last document
  tfidf.addDocument(cleanQuery);
  const queryIndex = allFaqs.length;

  const scoredFaqs = [];

  for (let i = 0; i < allFaqs.length; i++) {
    const similarity = calculateCosineSimilarity(tfidf, queryIndex, i);
    if (similarity > 0) {
      scoredFaqs.push({
        ...allFaqs[i],
        similarity
      });
    }
  }

  // Sort by similarity descending, then by view count descending
  scoredFaqs.sort((a, b) => b.similarity - a.similarity || b.views - a.views);

  // Return the top 5 most relevant FAQs
  return scoredFaqs.slice(0, 5).map(item => ({
    _id: item._id,
    q: item.q,
    a: item.a,
    category: item.category,
    categoryIcon: item.categoryIcon,
    source: item.source,
    resolved: item.resolved,
    views: item.views,
    similarity: item.similarity
  }));
}

module.exports = {
  autocomplete,
  searchSuggestions
};
