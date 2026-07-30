const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const p_emp_id = 5;
  const res = await dbClient.query(`
    WITH temp_all_tasks AS (
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
       'PROJECT' AS task_source
     FROM task_live_master t
     LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
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
       'INDIVIDUAL' AS task_source
     FROM employee_individual_task_master t
     LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
     WHERE (t.emp_id = $1 OR t.emp_task_id IN (
       SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = $1 AND pc.emp_task_id IS NOT NULL
     )) AND COALESCE(t.sts, true) = true
    )
    SELECT
      task_id,
      task_nm,
      status_nm,
      sub_status,
      end_dt,
      (end_dt < CURRENT_DATE) as is_before_today,
      (sub_status = 'Overdue' OR (status_nm <> 'Completed' AND end_dt IS NOT NULL AND end_dt < CURRENT_DATE)) as is_overdue_by_proc
    FROM temp_all_tasks;
  `, [p_emp_id]);

  console.table(res.rows.map(r => ({
    id: r.task_id,
    name: r.task_nm,
    status: r.status_nm,
    sub: r.sub_status,
    end: r.end_dt ? r.end_dt.toISOString().split('T')[0] : null,
    is_before_today: r.is_before_today,
    is_overdue: r.is_overdue_by_proc
  })));

  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
