const { Client } = require('pg');
const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();

  console.log('=== Emp 5 Project Counts with pc.is_live = true ===');
  const res5 = await dbClient.query(`
    SELECT 
      p.prj_id, p.prj_cd, p.prj_nm,
      COUNT(t.task_id) AS tasks_assigned,
      COUNT(t.task_id) FILTER (WHERE UPPER(tsm.status_nm) NOT IN ('COMPLETED', 'CLOSED')) AS open_tasks,
      COUNT(t.task_id) FILTER (WHERE UPPER(tsm.status_nm) IN ('COMPLETED', 'CLOSED')) AS closed_tasks,
      COALESCE(ROUND(
        (SUM(
          CASE 
            WHEN UPPER(tsm.status_nm) IN ('COMPLETED', 'CLOSED') THEN 1.0
            WHEN UPPER(tsm.status_nm) IN ('WIP', 'IN PROGRESS') THEN 
              CASE 
                WHEN UPPER(t.sub_status) = 'UNDER REVIEW' THEN 0.8
                WHEN UPPER(t.sub_status) = 'REWORK' THEN 0.2
                ELSE 0.5
              END
            ELSE 0.0
          END
        ) / NULLIF(COUNT(t.task_id), 0)) * 100, 0), 0) AS progress
    FROM task_live_master t 
    JOIN milestone_live_master  ml ON ml.m_id   = t.m_id 
    JOIN project_live_master    p  ON p.prj_id  = ml.prj_id 
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts 
    WHERE (t.emp_id = 5 OR t.task_id IN ( 
      SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = 5 AND pc.is_live = true 
    )) AND p.prj_sts IN ('LIVE', 'CLOSED', 'HOLD') 
    GROUP BY p.prj_id, p.prj_nm, p.prj_cd, p.prj_sts 
    ORDER BY p.prj_nm;
  `);
  console.log(res5.rows);

  await dbClient.end();
}

main().catch(console.error);
