const { Client } = require('pg');

const client = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT p.prj_id, p.prj_nm, COUNT(t.task_id) as total_tasks,
           COUNT(t.task_id) FILTER (WHERE tsm.status_nm = 'COMPLETED') as completed_tasks
    FROM project_live_master p
    JOIN milestone_live_master ml ON p.prj_id = ml.prj_id
    JOIN task_live_master t ON ml.m_id = t.m_id
    LEFT JOIN task_status_master tsm ON t.task_sts = tsm.status_id
    GROUP BY p.prj_id, p.prj_nm
  `);
  console.log(res.rows);
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
