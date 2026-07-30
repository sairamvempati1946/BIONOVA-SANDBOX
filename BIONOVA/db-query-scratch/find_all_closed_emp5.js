const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();

  console.log("=== ALL CLOSED PROJECT TASKS IN SYSTEM ===");
  const allClosedPrj = await dbClient.query(`
    SELECT t.task_id, t.task_cd, t.task_nm, t.emp_id AS executor_id,
           e.fst_nm || ' ' || e.lst_nm AS executor_name,
           (SELECT pc.emp_id FROM process_config pc WHERE pc.task_id = t.task_id AND pc.is_live = true AND pc.ordr_id = 1 LIMIT 1) AS live_rev_id,
           (SELECT pc.emp_id FROM process_config pc WHERE pc.task_id = t.task_id AND pc.is_live = true AND pc.ordr_id = 2 LIMIT 1) AS live_app_id
    FROM task_live_master t
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    LEFT JOIN employee_master e ON e.emp_id = t.emp_id
    WHERE tsm.status_nm = 'Closed'
  `);
  console.table(allClosedPrj.rows);

  console.log("\n=== ALL CLOSED INDIVIDUAL TASKS IN SYSTEM ===");
  const allClosedInd = await dbClient.query(`
    SELECT t.emp_task_id, t.task_cd, t.task_nm, t.emp_id AS executor_id,
           e.fst_nm || ' ' || e.lst_nm AS executor_name,
           (SELECT pc.emp_id FROM process_config pc WHERE pc.emp_task_id = t.emp_task_id AND (pc.is_live = true OR pc.is_live IS NULL) AND pc.ordr_id = 1 LIMIT 1) AS live_rev_id,
           (SELECT pc.emp_id FROM process_config pc WHERE pc.emp_task_id = t.emp_task_id AND (pc.is_live = true OR pc.is_live IS NULL) AND pc.ordr_id = 2 LIMIT 1) AS live_app_id,
           (SELECT jsonb_agg(jsonb_build_object('pc_id', pc.pc_id, 'emp_id', pc.emp_id, 'is_live', pc.is_live, 'ordr_id', pc.ordr_id))
            FROM process_config pc WHERE pc.emp_task_id = t.emp_task_id) AS all_pc
    FROM employee_individual_task_master t
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    LEFT JOIN employee_master e ON e.emp_id = t.emp_id
    WHERE tsm.status_nm = 'Closed'
  `);
  console.table(allClosedInd.rows.map(r => ({
    emp_task_id: r.emp_task_id,
    task_cd: r.task_cd,
    task_nm: r.task_nm,
    executor: r.executor_name,
    live_rev: r.live_rev_id,
    live_app: r.live_app_id,
    all_pc: JSON.stringify(r.all_pc)
  })));

  await dbClient.end();
}

main().catch(console.error);
