const { Client } = require('pg');
const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const res1 = await dbClient.query('SELECT t.task_id, t.task_nm, t.st_dt, t.end_dt, tsm.status_nm FROM task_live_master t LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts WHERE t.task_id IN (42, 43)');
  console.log('Tasks 42 & 43 details:', res1.rows);

  const res2 = await dbClient.query(`
    SELECT t.task_id, t.task_nm, t.st_dt, tsm.status_nm,
      (t.st_dt IS NULL OR t.st_dt <= CURRENT_DATE) as date_check,
      (t.emp_id = 7 OR t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = 7 AND pc.is_live = true)) as user_check
    FROM task_live_master t 
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    WHERE t.task_id IN (42, 43)
  `);
  console.log('Detailed check for 42 & 43:', res2.rows);

  const res3 = await dbClient.query(`
    SELECT pc.* FROM process_config pc WHERE pc.task_id IN (42, 43)
  `);
  console.log('Process config for 42 & 43:', res3.rows);

  await dbClient.end();
}

main().catch(console.error);
