const fs = require('fs');
const c = fs.readFileSync('d:/sample/bionova-backend/src/main/java/com/bionova/config/DatabaseMigrator.java', 'utf8');

// Find the actual CTE structure - look for all "SELECT" blocks with task_live_master
// around position 31548 going back to find the start
const slice = c.slice(30800, 37000);
console.log(JSON.stringify(slice));
