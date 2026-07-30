const { Client } = require('pg');
const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const res = await dbClient.query(`
    SELECT t.task_id, t.task_nm, t.no_of_days, t.wrk_days, t.task_sts, tsm.status_nm, t.sub_status
    FROM task_live_master t
    JOIN milestone_live_master ml ON ml.m_id = t.m_id
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    WHERE ml.prj_id = 24
    AND (t.emp_id = 7 OR t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = 7))
  `);
  console.log('Emp 7 tasks for BioNova (Project 24):', res.rows);
  await dbClient.end();
}

main().catch(console.error);
