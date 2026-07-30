const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();

  console.log("=== CHECKING TEAM MEMBERS TABLE FOR EMP 5 ===");
  const tm = await dbClient.query('SELECT * FROM team_members WHERE emp_id = 5');
  console.table(tm.rows);

  console.log("=== CHECKING ALL CLOSED TASKS WITH ANY LINK TO EMP 5 ===");
  const res = await dbClient.query(`
    SELECT 'task_live_master' AS tbl, t.task_id, t.task_cd, t.task_nm, tsm.status_nm, t.emp_id
    FROM task_live_master t
    JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    WHERE UPPER(tsm.status_nm) IN ('CLOSED', 'COMPLETED')
      AND (t.emp_id = 5 OR t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = 5))

    UNION ALL

    SELECT 'employee_individual_task_master' AS tbl, t.emp_task_id AS task_id, t.task_cd, t.task_nm, tsm.status_nm, t.emp_id
    FROM employee_individual_task_master t
    JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    WHERE UPPER(tsm.status_nm) IN ('CLOSED', 'COMPLETED')
      AND (t.emp_id = 5 OR t.emp_task_id IN (SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = 5 AND pc.emp_task_id IS NOT NULL))
  `);
  console.table(res.rows);

  await dbClient.end();
}

main().catch(console.error);
