const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const res = await dbClient.query(`
    SELECT 
      t.task_id,
      t.task_nm,
      t.emp_id,
      tsm.status_nm
    FROM task_live_master t
    JOIN milestone_live_master ml ON ml.m_id = t.m_id
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    WHERE ml.prj_id = 11;
  `);
  console.table(res.rows);
  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
