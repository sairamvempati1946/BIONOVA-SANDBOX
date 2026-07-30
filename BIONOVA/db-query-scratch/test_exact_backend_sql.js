const { Client } = require('pg');
const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();

  console.log('=== Emp 5 Project Progress (Exact SQL matching Projects.jsx) ===');
  const res5 = await dbClient.query(`
    SELECT 
      p.prj_id, p.prj_cd, p.prj_nm,
      COUNT(t_all.task_id) AS total_assigned,
      COUNT(t_all.task_id) FILTER (WHERE UPPER(tsm_all.status_nm) IN ('COMPLETED', 'CLOSED')) AS closed_tasks,
      COALESCE(ROUND(
        (SUM(
          CASE 
            WHEN UPPER(tsm_all.status_nm) IN ('COMPLETED', 'CLOSED') THEN 1.0
            WHEN UPPER(tsm_all.status_nm) IN ('WIP', 'IN PROGRESS') THEN 
              CASE 
                WHEN UPPER(t_all.sub_status) = 'UNDER REVIEW' THEN 0.8
                WHEN UPPER(t_all.sub_status) = 'REWORK' THEN 0.2
                ELSE 0.5
              END
            ELSE 0.0
          END
        ) / NULLIF(COUNT(t_all.task_id), 0)) * 100, 0), 0) AS progress
    FROM project_live_master p
    JOIN milestone_live_master ml_all ON ml_all.prj_id = p.prj_id
    JOIN task_live_master t_all ON t_all.m_id = ml_all.m_id
    LEFT JOIN task_status_master tsm_all ON tsm_all.status_id = t_all.task_sts
    WHERE (t_all.emp_id = 5 OR t_all.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = 5 AND pc.is_live = true))
      AND COALESCE(UPPER(tsm_all.status_nm), '') <> 'DRAFT'
      AND p.prj_sts IN ('LIVE', 'CLOSED', 'HOLD')
    GROUP BY p.prj_id, p.prj_cd, p.prj_nm
    ORDER BY p.prj_nm;
  `);
  console.log(res5.rows);

  console.log('=== Emp 7 Project Progress (Exact SQL matching Projects.jsx) ===');
  const res7 = await dbClient.query(`
    SELECT 
      p.prj_id, p.prj_cd, p.prj_nm,
      COUNT(t_all.task_id) AS total_assigned,
      COUNT(t_all.task_id) FILTER (WHERE UPPER(tsm_all.status_nm) IN ('COMPLETED', 'CLOSED')) AS closed_tasks,
      COALESCE(ROUND(
        (SUM(
          CASE 
            WHEN UPPER(tsm_all.status_nm) IN ('COMPLETED', 'CLOSED') THEN 1.0
            WHEN UPPER(tsm_all.status_nm) IN ('WIP', 'IN PROGRESS') THEN 
              CASE 
                WHEN UPPER(t_all.sub_status) = 'UNDER REVIEW' THEN 0.8
                WHEN UPPER(t_all.sub_status) = 'REWORK' THEN 0.2
                ELSE 0.5
              END
            ELSE 0.0
          END
        ) / NULLIF(COUNT(t_all.task_id), 0)) * 100, 0), 0) AS progress
    FROM project_live_master p
    JOIN milestone_live_master ml_all ON ml_all.prj_id = p.prj_id
    JOIN task_live_master t_all ON t_all.m_id = ml_all.m_id
    LEFT JOIN task_status_master tsm_all ON tsm_all.status_id = t_all.task_sts
    WHERE (t_all.emp_id = 7 OR t_all.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = 7 AND pc.is_live = true))
      AND COALESCE(UPPER(tsm_all.status_nm), '') <> 'DRAFT'
      AND p.prj_sts IN ('LIVE', 'CLOSED', 'HOLD')
    GROUP BY p.prj_id, p.prj_cd, p.prj_nm
    ORDER BY p.prj_nm;
  `);
  console.log(res7.rows);

  await dbClient.end();
}

main().catch(console.error);
