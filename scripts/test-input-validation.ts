import { validateUserInput } from '../src/lib/validation';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testValidation() {
  console.log('🧪 Testing Input Validation\n');

  const testCases = [
    // Valid inputs
    { inputs: ['chicken', 'tomatoes', 'pasta'], essentials: [], shouldPass: true, label: 'Valid: Common ingredients' },
    { inputs: ['carbonara'], essentials: [], shouldPass: true, label: 'Valid: Dish name' },
    { inputs: ['beef', 'broccoli'], essentials: ['garlic'], shouldPass: true, label: 'Valid: Ingredients + essentials' },

    // Invalid inputs
    { inputs: ['laptop', 'phone'], essentials: [], shouldPass: false, label: 'Invalid: Non-food items' },
    { inputs: ['car'], essentials: [], shouldPass: false, label: 'Invalid: Single non-food word' },
    { inputs: ['asdfgh', 'xyz123'], essentials: [], shouldPass: false, label: 'Invalid: Nonsense' },
    { inputs: ['shoes', 'shirt'], essentials: [], shouldPass: false, label: 'Invalid: Clothing items' },
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.label}`);
    console.log(`  Input: ${[...testCase.inputs, ...testCase.essentials].join(', ')}`);

    const result = await validateUserInput(testCase.inputs, testCase.essentials);

    const testPassed = result.valid === testCase.shouldPass;
    if (testPassed) {
      console.log(`  ✅ PASS - Valid: ${result.valid}${result.reason ? ` (${result.reason})` : ''}`);
      passed++;
    } else {
      console.log(`  ❌ FAIL - Expected valid=${testCase.shouldPass}, got valid=${result.valid}${result.reason ? ` (${result.reason})` : ''}`);
      failed++;
    }
    console.log('');
  }

  console.log('='.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));
}

testValidation().catch(console.error);
