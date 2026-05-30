require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const FAQ = require('../models/FAQ');
const searchService = require('../services/searchService');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/faq-app';

async function test() {
  console.log('Connecting to MongoDB at:', MONGO_URI);
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to MongoDB!');

    // 1. Verify Autocomplete prefix matching
    console.log('\n--- Testing Autocomplete (Prefix Matching) for query "noc" ---');
    const autocompleteResults = await searchService.autocomplete('noc');
    console.log(`Found ${autocompleteResults.length} autocomplete matches:`);
    autocompleteResults.forEach((res, i) => {
      console.log(`  [${i + 1}] Category: ${res.category} | Question: "${res.q}"`);
    });

    console.log('\n--- Testing Autocomplete (Prefix Matching) for multi-word query "noc date" ---');
    const autocompleteMultiResults = await searchService.autocomplete('noc date');
    console.log(`Found ${autocompleteMultiResults.length} autocomplete matches:`);
    autocompleteMultiResults.forEach((res, i) => {
      console.log(`  [${i + 1}] Category: ${res.category} | Question: "${res.q}"`);
    });

    // 2. Verify TF-IDF and Cosine Similarity
    console.log('\n--- Testing Intelligent Search Suggestions for query "how long is internship" ---');
    const searchResults = await searchService.searchSuggestions('how long is internship');
    console.log(`Found ${searchResults.length} intelligent search recommendations (ranked by Cosine Similarity):`);
    searchResults.forEach((res, i) => {
      console.log(`  [${i + 1}] Score: ${res.similarity.toFixed(4)} | Question: "${res.q}"`);
    });

    console.log('\n--- Testing Intelligent Search Suggestions for query "noc signature authorization" ---');
    const searchNocResults = await searchService.searchSuggestions('noc signature authorization');
    console.log(`Found ${searchNocResults.length} intelligent search recommendations (ranked by Cosine Similarity):`);
    searchNocResults.forEach((res, i) => {
      console.log(`  [${i + 1}] Score: ${res.similarity.toFixed(4)} | Question: "${res.q}"`);
    });

    console.log('\nAll offline similarity tests completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

test();
