const { Client } = require('pg');
const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();

  const res = await dbClient.query(`
    SELECT t.task_id, t.task_cd, t.task_nm, t.m_id, ml.mlstn_ttl, t.emp_id, t.task_sts, tsm.status_nm, t.sub_status,
      CASE WHEN t.emp_id = 5 THEN 'Executor' ELSE 'ProcessConfig' END as role_type
    FROM task_live_master t
    JOIN milestone_live_master ml ON ml.m_id = t.m_id
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    WHERE ml.prj_id = 24
      AND (t.emp_id = 5 OR t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = 5))
    ORDER BY t.task_id;
  `);

  console.log('All tasks for Emp 5 in Project 24 (BioNova):');
  console.log(res.rows);

  await dbClient.end();
}

main().catch(console.error);
