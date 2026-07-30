const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const res = await dbClient.query(`
    SELECT jsonb_agg(sub) as my_projects
    FROM (
      SELECT jsonb_build_object(
        'projectId',     p.prj_id,
        'projectName',   p.prj_nm,
        'projectCode',   p.prj_cd,
        'clientName',    COALESCE(cm.coy_nm, (SELECT coy_nm FROM company_master LIMIT 1), ''),
        'plantName',     COALESCE(pm.plt_nm, (SELECT plt_nm FROM plant_master LIMIT 1), ''),
        'location',      COALESCE(cm.ct_vlg, (SELECT ct_vlg FROM company_master LIMIT 1), ''),
        'logo',          p.logo,
        'role',          COALESCE(pa.access_type, 'Team Member'),
        'status',        CASE
                           WHEN p.prj_sts = 'HOLD' THEN 'On Hold'
                           WHEN p.prj_sts = 'CLOSED' THEN 'Completed'
                           ELSE 'In Progress'
                         END,
        'dueDate',       p.end_dt,
        'tasksAssigned', COUNT(t.task_id),
        'openTasks',     COUNT(t.task_id) FILTER (WHERE COALESCE(LOWER(tsm.status_nm), '') <> 'completed'),
        'progress',      (
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
        )
      ) AS sub
      FROM task_live_master t
      JOIN milestone_live_master  ml ON ml.m_id   = t.m_id
      JOIN project_live_master    p  ON p.prj_id  = ml.prj_id
      LEFT JOIN company_master    cm ON cm.coy_id = p.coy_id
      LEFT JOIN plant_master      pm ON pm.plt_id = p.plt_id
      LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
      LEFT JOIN (
        SELECT DISTINCT ON (prj_id, emp_id) prj_id, emp_id, access_type
        FROM project_access
        WHERE sts = true
      ) pa ON pa.prj_id = p.prj_id AND pa.emp_id = 7
      WHERE (t.emp_id = 7 OR t.task_id IN (
        SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = 7 AND pc.is_live = true
      )) AND p.prj_sts IN ('LIVE', 'CLOSED', 'HOLD')
      GROUP BY p.prj_id, p.prj_nm, p.prj_cd, p.logo, cm.coy_nm, pm.plt_nm, cm.ct_vlg, p.prj_sts, pa.access_type, p.end_dt
      ORDER BY p.prj_nm
    ) x
  `);
  console.log(JSON.stringify(res.rows[0].my_projects, null, 2));
  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
