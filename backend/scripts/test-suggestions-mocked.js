const searchService = require('../services/searchService');
const FAQ = require('../models/FAQ');

// Mock data based on the real seed data
const mockFAQData = [
  {
    category: 'About the Internship',
    icon: '📋',
    questions: [
      { q: 'What is the Vicharanashala internship?', a: 'A two-month internship run by Vicharanashala, a research lab at IIT Ropar.' },
      { q: 'What is VINS?', a: 'VINS is the Vicharanashala Internship — an online programme.' },
      { q: 'Who is the internship for? Are alumni eligible?', a: 'Currently-enrolled students at any college or university.' }
    ]
  },
  {
    category: 'NOC (No Objection Certificate)',
    icon: '📄',
    questions: [
      { q: 'What dates do I put on the NOC?', a: 'Your chosen start date to start + 2 months.' },
      { q: 'Who can sign the NOC?', a: 'Any authorised signatory at your college.' },
      { q: 'When do I submit the NOC? Is the deadline hard?', a: 'There is no hard deadline, but submit as early as possible.' }
    ]
  }
];

// Mock FAQ.find to return our mock dataset
FAQ.find = function() {
  return {
    lean: function() {
      return Promise.resolve(mockFAQData);
    }
  };
};

async function test() {
  console.log('Running suggestions offline tests using mocked database...');

  try {
    // 1. Verify Autocomplete prefix matching
    console.log('\n--- Testing Autocomplete (Prefix Matching) for query "noc" ---');
    const autocompleteResults = await searchService.autocomplete('noc');
    console.log(`Found ${autocompleteResults.length} autocomplete matches:`);
    autocompleteResults.forEach((res, i) => {
      console.log(`  [${i + 1}] Category: ${res.category} | Question: "${res.q}"`);
    });

    console.log('\n--- Testing Autocomplete (Prefix Matching) for query "intern" ---');
    const autocompleteIntern = await searchService.autocomplete('intern');
    console.log(`Found ${autocompleteIntern.length} autocomplete matches:`);
    autocompleteIntern.forEach((res, i) => {
      console.log(`  [${i + 1}] Category: ${res.category} | Question: "${res.q}"`);
    });

    // 2. Verify TF-IDF and Cosine Similarity
    console.log('\n--- Testing Intelligent Search Suggestions for query "who is internship for" ---');
    const searchResults = await searchService.searchSuggestions('who is internship for');
    console.log(`Found ${searchResults.length} intelligent search recommendations (ranked by Cosine Similarity):`);
    searchResults.forEach((res, i) => {
      console.log(`  [${i + 1}] Score: ${res.similarity.toFixed(4)} | Question: "${res.q}"`);
    });

    console.log('\n--- Testing Intelligent Search Suggestions for query "noc dates deadline" ---');
    const searchNocResults = await searchService.searchSuggestions('noc dates deadline');
    console.log(`Found ${searchNocResults.length} intelligent search recommendations (ranked by Cosine Similarity):`);
    searchNocResults.forEach((res, i) => {
      console.log(`  [${i + 1}] Score: ${res.similarity.toFixed(4)} | Question: "${res.q}"`);
    });

    console.log('\nAll mock suggestions tests completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Mock test execution failed:', err);
    process.exit(1);
  }
}

test();
