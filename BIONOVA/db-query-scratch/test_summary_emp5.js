const { Client } = require('pg');
const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  
  // 1. Summary Cards Query
  const summaryRes = await dbClient.query(`
    WITH emp_tasks AS (
      SELECT t.task_id, tsm.status_nm, t.end_dt
      FROM task_live_master t
      LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
      WHERE (t.emp_id = 5 OR t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = 5))
      AND COALESCE(UPPER(tsm.status_nm), '') <> 'DRAFT'
      UNION ALL
      SELECT t.emp_task_id AS task_id, tsm.status_nm, t.end_dt
      FROM employee_individual_task_master t
      LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
      WHERE (t.emp_id = 5 OR t.emp_task_id IN (SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = 5 AND pc.emp_task_id IS NOT NULL))
      AND COALESCE(t.sts, true) = true AND COALESCE(UPPER(tsm.status_nm), '') <> 'DRAFT'
    ),
    emp_projects AS (
      SELECT COUNT(DISTINCT m.prj_id) as my_projects_count
      FROM task_live_master t
      JOIN milestone_live_master m ON m.m_id = t.m_id
      JOIN project_live_master p ON p.prj_id = m.prj_id
      WHERE (t.emp_id = 5 OR t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = 5))
      AND p.prj_sts = 'LIVE'
    )
    SELECT 
      COUNT(*) AS assigned_tasks,
      COUNT(*) FILTER (WHERE UPPER(status_nm) = 'OPEN') AS open_tasks,
      COUNT(*) FILTER (WHERE UPPER(status_nm) IN ('WIP', 'IN PROGRESS')) AS in_progress_tasks,
      COUNT(*) FILTER (WHERE UPPER(status_nm) <> 'CLOSED' AND UPPER(status_nm) <> 'COMPLETED' AND end_dt IS NOT NULL AND end_dt < CURRENT_DATE) AS overdue_tasks,
      COUNT(*) FILTER (WHERE UPPER(status_nm) IN ('CLOSED', 'COMPLETED')) AS closed_tasks,
      (SELECT my_projects_count FROM emp_projects) AS my_projects
    FROM emp_tasks;
  `);

  console.log('Summary Cards Output for Emp 5:');
  console.log(summaryRes.rows[0]);

  await dbClient.end();
}

main().catch(console.error);
