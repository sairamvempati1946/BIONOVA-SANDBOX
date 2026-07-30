const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  for (const empId of [5, 8]) {
    // Get Employee Name
    const empRes = await dbClient.query('SELECT fst_nm, lst_nm FROM employee_master WHERE emp_id = $1', [empId]);
    const empName = empRes.rows[0] ? `${empRes.rows[0].fst_nm} ${empRes.rows[0].lst_nm}`.trim() : `Emp ${empId}`;

    console.log(`\n=== EMPLOYEE ID: ${empId} (${empName}) ===`);

    const dashRes = await dbClient.query('SELECT get_user_dashboard($1) as data', [empId]);
    const data = dashRes.rows[0].data;

    console.log("Dashboard Summary:");
    console.log(data.summary);
    console.log("\nTask Status Counts Breakdown:");
    console.log(data.taskStatusCounts);

    const myTasksDataRes = await dbClient.query('SELECT get_my_tasks_data($1) as data', [empId]);
    const myTasks = myTasksDataRes.rows[0].data || [];
    
    const breakdown = {};
    myTasks.forEach(t => {
      const sts = t.status || 'Unknown';
      breakdown[sts] = (breakdown[sts] || 0) + 1;
    });

    console.log("\nMy Tasks List Breakdown by Status:");
    console.log(breakdown);
    console.log(`Total My Tasks List Count: ${myTasks.length}`);
  }
  await dbClient.end();
}

main().catch(console.error);
