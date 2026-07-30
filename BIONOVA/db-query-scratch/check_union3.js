const fs = require('fs');
const c = fs.readFileSync('d:/sample/bionova-backend/src/main/java/com/bionova/config/DatabaseMigrator.java', 'utf8');

// The third UNION ALL in get_user_dashboard is at function offset 18953
// Function starts at 27841
const funcStart = 27841;
const unionPos = funcStart + 18953;

console.log('Third UNION ALL at file position:', unionPos);
console.log('Context around it:');
console.log(JSON.stringify(c.slice(unionPos - 600, unionPos + 600)));
