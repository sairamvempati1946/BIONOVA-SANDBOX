const fs = require('fs');
const file = 'd:/sample/bionova-backend/src/main/java/com/bionova/config/DatabaseMigrator.java';
let content = fs.readFileSync(file, 'utf8');

// The project tasks branch has user_badge then goes straight to pm.priority_nm
// The INDIVIDUAL branch already has 'INDIVIDUAL' AS task_source between them
// We need to insert 'PROJECT' AS task_source in the project branch

// Strategy: find the exact text unique to the project branch (uses pc.task_id)
// and add task_source before pm.priority_nm

// Find where project branch ends its user_badge and starts pm.priority_nm
// Unique marker in project branch: "pc.ordr_id = 2) THEN 'Approver'"  followed by...
// "END AS user_badge, " + [NO task_source] + "pm.priority_nm"

// The project branch sequence (unique because it uses pc.task_id, not pc.emp_task_id):
const projectBranchMarker = 'pc WHERE pc.emp_id = p_emp_id AND pc.is_live = true AND pc.ordr_id = 2) THEN \'Approver\' " +\n                    "        ELSE \'Executor\' " +\n                    "      END AS user_badge, " +\n                    "      pm.priority_nm,';

console.log('Project branch marker found:', content.includes(projectBranchMarker));

const replacement = "pc WHERE pc.emp_id = p_emp_id AND pc.is_live = true AND pc.ordr_id = 2) THEN 'Approver' \" +\n                    \"        ELSE 'Executor' \" +\n                    \"      END AS user_badge, \" +\n                    \"      'PROJECT' AS task_source, \" +\n                    \"      pm.priority_nm,";

const fixed = content.replace(projectBranchMarker, replacement);
if (fixed === content) {
  console.log('ERROR: No replacement made!');
  process.exit(1);
} else {
  fs.writeFileSync(file, fixed, 'utf8');
  console.log('SUCCESS: task_source PROJECT added to project branch!');
}
