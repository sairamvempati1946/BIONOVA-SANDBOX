const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  
  console.log("--- PROJECTS ---");
  const prjs = await dbClient.query("SELECT prj_id, prj_nm, prj_sts FROM project_live_master WHERE prj_id IN (12, 19)");
  console.log(prjs.rows);

  console.log("--- MILESTONES ---");
  const mls = await dbClient.query("SELECT m_id, prj_id FROM milestone_live_master WHERE prj_id IN (12, 19)");
  console.log(mls.rows);

  console.log("--- TASKS FOR PROJECT 12 & 19 ---");
  const tasks = await dbClient.query(`
    SELECT t.task_id, t.task_nm, t.task_sts, tsm.status_nm, ml.prj_id
    FROM task_live_master t
    JOIN milestone_live_master ml ON ml.m_id = t.m_id
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    WHERE ml.prj_id IN (12, 19)
  `);
  console.log(tasks.rows);

  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
