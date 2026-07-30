const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const ids = [40, 41, 42, 43, 33];
  
  console.log("Checking in task_live_master:");
  const res1 = await dbClient.query(`
    SELECT t.task_id, t.task_nm, t.emp_id, tsm.status_nm
    FROM task_live_master t
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    WHERE t.task_id = ANY($1)
  `, [ids]);
  console.table(res1.rows);

  console.log("Checking in employee_individual_task_master:");
  const res2 = await dbClient.query(`
    SELECT t.emp_task_id, t.task_nm, t.emp_id, tsm.status_nm, t.sts
    FROM employee_individual_task_master t
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    WHERE t.emp_task_id = ANY($1)
  `, [ids]);
  console.table(res2.rows);

  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
