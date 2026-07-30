const { Client } = require('pg');
const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();

  console.log('=== Emp 5 with pc.is_live = true ===');
  const res5 = await dbClient.query(`
    SELECT 
      p.prj_id, p.prj_cd, p.prj_nm,
      COUNT(t_all.task_id) AS total_assigned,
      COUNT(t_all.task_id) FILTER (WHERE UPPER(tsm_all.status_nm) IN ('COMPLETED', 'CLOSED')) AS closed_tasks,
      COALESCE(ROUND(
        (COUNT(t_all.task_id) FILTER (WHERE UPPER(tsm_all.status_nm) IN ('COMPLETED', 'CLOSED'))::NUMERIC 
         / NULLIF(COUNT(t_all.task_id), 0)) * 100, 0), 0) AS closed_pct
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

  console.log('=== Emp 7 with pc.is_live = true ===');
  const res7 = await dbClient.query(`
    SELECT 
      p.prj_id, p.prj_cd, p.prj_nm,
      COUNT(t_all.task_id) AS total_assigned,
      COUNT(t_all.task_id) FILTER (WHERE UPPER(tsm_all.status_nm) IN ('COMPLETED', 'CLOSED')) AS closed_tasks,
      COALESCE(ROUND(
        (COUNT(t_all.task_id) FILTER (WHERE UPPER(tsm_all.status_nm) IN ('COMPLETED', 'CLOSED'))::NUMERIC 
         / NULLIF(COUNT(t_all.task_id), 0)) * 100, 0), 0) AS closed_pct
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
