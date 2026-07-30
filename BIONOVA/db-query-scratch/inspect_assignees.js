const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const res = await dbClient.query(`
    SELECT t.task_id, t.task_nm, t.emp_id, e.fst_nm, e.email, tsm.status_nm, ml.prj_id
    FROM task_live_master t
    LEFT JOIN employee_master e ON t.emp_id = e.emp_id
    LEFT JOIN task_status_master tsm ON t.task_sts = tsm.status_id
    JOIN milestone_live_master ml ON ml.m_id = t.m_id
    WHERE ml.prj_id IN (12, 19)
  `);
  console.log(res.rows);
  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
