const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const res = await dbClient.query(`
    SELECT 
      p.prj_id,
      p.prj_nm,
      (
        SELECT ROUND(
          CASE WHEN COUNT(t_all.task_id) > 0
            THEN (
              (
                COUNT(t_all.task_id) FILTER (WHERE COALESCE(LOWER(tsm_all.status_nm), '') = 'completed')::NUMERIC +
                COUNT(t_all.task_id) FILTER (WHERE COALESCE(LOWER(tsm_all.status_nm), '') IN ('under review', 'under_review', 'submit review', 'submit_review')) * 0.8 +
                COUNT(t_all.task_id) FILTER (WHERE COALESCE(LOWER(tsm_all.status_nm), '') IN ('wip', 'in progress', 'in_progress')) * 0.5
              ) / COUNT(t_all.task_id)
            ) * 100
            ELSE 0 END, 0)
        FROM task_live_master t_all
        JOIN milestone_live_master ml_all ON ml_all.m_id = t_all.m_id
        LEFT JOIN task_status_master tsm_all ON tsm_all.status_id = t_all.task_sts
        WHERE ml_all.prj_id = p.prj_id
      ) as progress
    FROM task_live_master t
    JOIN milestone_live_master  ml ON ml.m_id   = t.m_id
    JOIN project_live_master    p  ON p.prj_id  = ml.prj_id
    WHERE t.emp_id = 7
    GROUP BY p.prj_id, p.prj_nm
  `);
  console.log(res.rows);
  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
