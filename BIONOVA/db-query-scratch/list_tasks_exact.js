const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const p_emp_id = 5;
  const v_today = '2026-07-16'; // Using the context time

  const res = await dbClient.query(`
    SELECT
       t.task_id,
       t.task_nm,
       t.st_dt,
       t.end_dt,
       t.act_cmp_dt,
       t.no_of_days,
       t.task_sts,
       tsm.status_nm,
       t.sub_status,
       COALESCE(p.prj_cd || ' - ' || m.mlstn_ttl, '') AS project_info,
       COALESCE(p.prj_cd, '') AS prj_cd,
       CASE
         WHEN t.emp_id = $1 THEN 'Executor'
         WHEN t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = $1 AND pc.is_live = true AND pc.ordr_id = 1) THEN 'Reviewer'
         WHEN t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = $1 AND pc.is_live = true AND pc.ordr_id = 2) THEN 'Approver'
         ELSE 'Executor'
       END AS user_badge,
       pm.priority_nm,
       'PROJECT' AS task_source
     FROM task_live_master t
     LEFT JOIN milestone_live_master m ON m.m_id = t.m_id
     LEFT JOIN project_live_master p ON p.prj_id = m.prj_id
     LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
     LEFT JOIN task_priority_master pm ON pm.priority_id = t.priority
     WHERE (t.emp_id = $1 OR t.task_id IN (
       SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = $1 AND pc.is_live = true
     ))
     UNION ALL
     SELECT
       t.emp_task_id AS task_id,
       t.task_nm,
       t.st_dt,
       t.end_dt,
       CASE WHEN tsm.status_nm = 'Completed' THEN t.end_dt ELSE NULL END AS act_cmp_dt,
       (t.end_dt - t.st_dt) AS no_of_days,
       t.task_sts,
       tsm.status_nm,
       t.sub_status,
       COALESCE(INITCAP(t.task_asgn_to), 'Internal') AS project_info,
       COALESCE(INITCAP(t.task_asgn_to), 'Internal') AS prj_cd,
       CASE
         WHEN t.emp_id = $1 THEN 'Executor'
         WHEN t.emp_task_id IN (SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = $1 AND pc.emp_task_id IS NOT NULL AND pc.ordr_id = 1) THEN 'Reviewer'
         WHEN t.emp_task_id IN (SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = $1 AND pc.emp_task_id IS NOT NULL AND pc.ordr_id = 2) THEN 'Approver'
         ELSE 'Executor'
       END AS user_badge,
       pm.priority_nm,
       'INDIVIDUAL' AS task_source
     FROM employee_individual_task_master t
     LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
     LEFT JOIN task_priority_master pm ON pm.priority_id = t.priority
     WHERE (t.emp_id = $1 OR t.emp_task_id IN (
       SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = $1 AND pc.emp_task_id IS NOT NULL
     )) AND COALESCE(t.sts, true) = true
  `, [p_emp_id]);

  console.log(`Total tasks: ${res.rows.length}`);
  console.table(res.rows.map(r => ({
    id: r.task_id,
    name: r.task_nm,
    end: r.end_dt ? r.end_dt.toISOString().split('T')[0] : null,
    status: r.status_nm,
    sub: r.sub_status,
    badge: r.user_badge,
    source: r.task_source
  })));

  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
