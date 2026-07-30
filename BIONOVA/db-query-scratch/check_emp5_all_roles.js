const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();

  console.log("=== EMP 5 TASKS WHERE EMP 5 IS EXECUTOR, REVIEWER OR APPROVER ===");

  const res = await dbClient.query(`
    WITH combined AS (
      SELECT t.task_id, t.task_cd, t.task_nm, tsm.status_nm, 'PROJECT' AS src,
             'Executor' AS my_role
      FROM task_live_master t
      LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
      WHERE t.emp_id = 5

      UNION ALL

      SELECT t.task_id, t.task_cd, t.task_nm, tsm.status_nm, 'PROJECT' AS src,
             'Reviewer/Approver' AS my_role
      FROM task_live_master t
      LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
      WHERE t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = 5 AND pc.is_live = true)
        AND t.emp_id <> 5

      UNION ALL

      SELECT t.emp_task_id AS task_id, t.task_cd, t.task_nm, tsm.status_nm, 'INDIVIDUAL' AS src,
             'Executor' AS my_role
      FROM employee_individual_task_master t
      LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
      WHERE t.emp_id = 5 AND COALESCE(t.sts, true) = true

      UNION ALL

      SELECT t.emp_task_id AS task_id, t.task_cd, t.task_nm, tsm.status_nm, 'INDIVIDUAL' AS src,
             'Reviewer/Approver' AS my_role
      FROM employee_individual_task_master t
      LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
      WHERE t.emp_task_id IN (SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = 5 AND pc.emp_task_id IS NOT NULL)
        AND t.emp_id <> 5 AND COALESCE(t.sts, true) = true
    )
    SELECT * FROM combined
  `);

  console.table(res.rows);

  const closed = res.rows.filter(r => (r.status_nm || '').toUpperCase() === 'CLOSED' || (r.status_nm || '').toUpperCase() === 'COMPLETED');
  console.log(`\nTotal tasks found: ${res.rows.length}`);
  console.log(`Total CLOSED tasks found: ${closed.length}`);
  console.log("CLOSED TASKS DETAILS:");
  console.table(closed);

  await dbClient.end();
}

main().catch(console.error);
