const fs = require('fs');
const c = fs.readFileSync('d:/sample/bionova-backend/src/main/java/com/bionova/config/DatabaseMigrator.java', 'utf8');

let i = -1;
const search = "'PROJECT' AS task_source";
while ((i = c.indexOf(search, i+1)) !== -1) {
  console.log('\n=== At position', i, '===');
  console.log(JSON.stringify(c.slice(Math.max(0, i-120), i+120)));
}

console.log('\n=== INDIVIDUAL occurrences ===');
i = -1;
const search2 = "'INDIVIDUAL' AS task_source";
while ((i = c.indexOf(search2, i+1)) !== -1) {
  console.log('\n=== At position', i, '===');
  console.log(JSON.stringify(c.slice(Math.max(0, i-120), i+120)));
}
