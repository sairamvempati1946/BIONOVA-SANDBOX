const { Client } = require('pg');
const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const res = await dbClient.query(`
    SELECT t.task_id, t.task_nm, t.st_dt, t.task_sts, tsm.status_nm, t.emp_id
    FROM task_live_master t
    JOIN milestone_live_master ml ON ml.m_id = t.m_id
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    WHERE ml.prj_id = 6
    AND (t.emp_id = 7 OR t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = 7))
  `);
  console.log('Project 6 tasks for emp 7:', res.rows);

  const pcRes = await dbClient.query(`
    SELECT pc.* FROM process_config pc WHERE pc.task_id IN (SELECT t.task_id FROM task_live_master t JOIN milestone_live_master ml ON ml.m_id = t.m_id WHERE ml.prj_id = 6)
  `);
  console.log('Project 6 process_config:', pcRes.rows);

  await dbClient.end();
}

main().catch(console.error);
