const fs = require('fs');
const c = fs.readFileSync('d:/sample/bionova-backend/src/main/java/com/bionova/config/DatabaseMigrator.java', 'utf8');

// Find the full get_user_dashboard procedure body
const funcStart = c.indexOf('CREATE OR REPLACE FUNCTION get_user_dashboard');
const funcEnd = c.indexOf('CREATE OR REPLACE FUNCTION get_admin_dashboard');
console.log('Function span:', funcStart, '-', funcEnd);

const func = c.slice(funcStart, funcEnd);

// Find all UNION ALL occurrences
let i = -1;
let count = 0;
while ((i = func.indexOf('UNION ALL', i+1)) !== -1) {
  count++;
  const before = func.slice(Math.max(0, i-400), i);
  const after = func.slice(i, i+400);
  
  // Count columns in the SELECT before this UNION ALL
  // Find the start of the SELECT before UNION ALL
  const lastSelect = before.lastIndexOf('SELECT');
  const selectSection = before.slice(lastSelect);
  const commas = (selectSection.match(/,\s*\"/g) || []).length;
  
  console.log(`\n=== UNION ALL #${count} at offset ${i} ===`);
  console.log('Context after:', JSON.stringify(func.slice(i, i+200)));
  console.log('Context before (last 200):', JSON.stringify(func.slice(Math.max(0,i-200), i)));
}
console.log('\nTotal UNION ALLs:', count);
