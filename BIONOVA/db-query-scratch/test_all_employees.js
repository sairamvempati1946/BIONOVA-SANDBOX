const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  
  // Get all employee IDs
  const empRes = await dbClient.query("SELECT emp_id, fst_nm, lst_nm FROM employee_master ORDER BY emp_id;");
  console.log(`Auditing ${empRes.rows.length} employees...`);

  for (const emp of empRes.rows) {
    const dashboardRes = await dbClient.query("SELECT public.get_user_dashboard($1) AS dashboard;", [emp.emp_id]);
    const d = dashboardRes.rows[0].dashboard;
    if (!d) continue;

    const sc = d.taskStatusCounts || {};
    const completed = sc["Completed"] || 0;
    const wip = sc["In Progress"] || 0;
    const overdue = sc["Overdue"] || 0;
    const open = sc["Open"] || 0;
    const draft = sc["Draft"] || 0;

    // Simulate backend DTO mapper behavior
    const myTasksCount = d.summary?.myTasksCount || 0;
    const completedTasksCount = d.summary?.completedTasksCount || 0;
    const overdueTasksCount = d.summary?.overdueTasksCount || 0;
    
    // In DTO: myTasksCount + completedTasksCount + overdueTasksCount
    const assignedVal = myTasksCount + completedTasksCount + overdueTasksCount;
    const calculatedSum = completed + wip + overdue + open + draft;

    console.log(`Emp ${emp.emp_id} (${emp.fst_nm} ${emp.lst_nm || ''}):`);
    console.log(`  Assigned: ${assignedVal}`);
    console.log(`  Completed: ${completed}, WIP: ${wip}, Overdue: ${overdue}, Open: ${open}, Draft: ${draft}`);
    console.log(`  Sum of categories: ${calculatedSum}`);
    
    if (assignedVal !== calculatedSum) {
      console.error(`  ❌ DISCREPANCY: Assigned (${assignedVal}) != Sum (${calculatedSum})`);
    } else {
      console.log(`  ✅ MATCH`);
    }
  }

  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
