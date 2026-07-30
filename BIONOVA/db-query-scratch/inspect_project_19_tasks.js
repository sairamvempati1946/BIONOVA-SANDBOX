const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const res = await dbClient.query(`
    SELECT t.task_id, t.task_nm, t.wrk_days, t.no_of_days, t.task_sts, tsm.status_nm, t.sub_status
    FROM task_live_master t
    JOIN milestone_live_master ml ON t.m_id = ml.m_id
    LEFT JOIN task_status_master tsm ON t.task_sts = tsm.status_id
    WHERE ml.prj_id = 19
  `);
  console.log(res.rows);
  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
