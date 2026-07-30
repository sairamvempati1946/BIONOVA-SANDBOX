const { Client } = require('pg');
const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  
  // 1. Count Only Query
  const countRes = await dbClient.query(`
    SELECT COUNT(DISTINCT m.prj_id) AS total_projects_count
    FROM task_live_master t
    JOIN milestone_live_master m ON m.m_id = t.m_id
    JOIN project_live_master p ON p.prj_id = m.prj_id
    WHERE (t.emp_id = 5 OR t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = 5))
    AND p.prj_sts = 'LIVE';
  `);
  console.log('--- Project Count Only ---');
  console.log(countRes.rows[0]);

  // 2. Details Query
  const detailsRes = await dbClient.query(`
    SELECT 
      p.prj_id AS project_id, 
      p.prj_cd AS project_code,
      p.prj_nm AS project_name, 
      COALESCE(cm.coy_nm, 'N/A') AS client_name, 
      COALESCE(pm.plt_nm, 'N/A') AS plant_name, 
      p.prj_sts AS project_status, 
      p.end_dt AS due_date, 
      COUNT(t.task_id) AS tasks_assigned, 
      COUNT(t.task_id) FILTER (WHERE UPPER(tsm.status_nm) NOT IN ('COMPLETED', 'CLOSED')) AS open_tasks, 
      COUNT(t.task_id) FILTER (WHERE UPPER(tsm.status_nm) IN ('COMPLETED', 'CLOSED')) AS closed_tasks
    FROM task_live_master t 
    JOIN milestone_live_master ml ON ml.m_id = t.m_id 
    JOIN project_live_master p ON p.prj_id = ml.prj_id 
    LEFT JOIN company_master cm ON cm.coy_id = p.coy_id 
    LEFT JOIN plant_master pm ON pm.plt_id = p.plt_id 
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts 
    WHERE (t.emp_id = 5 OR t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = 5))
    AND p.prj_sts IN ('LIVE', 'CLOSED', 'HOLD') 
    GROUP BY p.prj_id, p.prj_nm, p.prj_cd, cm.coy_nm, pm.plt_nm, p.prj_sts, p.end_dt 
    ORDER BY p.prj_nm;
  `);
  console.log('--- Project Details List ---');
  console.log(detailsRes.rows);

  await dbClient.end();
}

main().catch(console.error);
