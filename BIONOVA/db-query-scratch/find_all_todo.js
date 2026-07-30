const fs = require('fs');
const c = fs.readFileSync('d:/sample/bionova-backend/src/main/java/com/bionova/config/DatabaseMigrator.java', 'utf8');

// Find ALL WITH all_todo occurrences
let i = -1;
const search = 'WITH all_todo AS';
while ((i = c.indexOf(search, i+1)) !== -1) {
  console.log('WITH all_todo AS at position:', i);
  console.log(JSON.stringify(c.slice(i, i+60)));
  console.log('---');
}
