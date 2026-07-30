const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();

  const codes = ['INDTSK-004', 'TSK-001', 'TSK-003', 'INDTSK-102', 'TSK-367', 'INDTSK-104', 'INDTSK-103', 'TSK-370'];

  console.log("=== CHECKING TASK CODES SHOWN IN SCREENSHOT IN PROJECT TASKS ===");
  const prj = await dbClient.query(`
    SELECT t.task_id, t.task_cd, t.task_nm, tsm.status_nm, t.emp_id,
           e.fst_nm || ' ' || e.lst_nm AS executor_name,
           pc_rev.emp_id AS rev_id, e_rev.fst_nm || ' ' || e_rev.lst_nm AS rev_name,
           pc_app.emp_id AS app_id, e_app.fst_nm || ' ' || e_app.lst_nm AS app_name
    FROM task_live_master t
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    LEFT JOIN employee_master e ON e.emp_id = t.emp_id
    LEFT JOIN process_config pc_rev ON pc_rev.task_id = t.task_id AND pc_rev.is_live = true AND pc_rev.ordr_id = 1
    LEFT JOIN employee_master e_rev ON e_rev.emp_id = pc_rev.emp_id
    LEFT JOIN process_config pc_app ON pc_app.task_id = t.task_id AND pc_app.is_live = true AND pc_app.ordr_id = 2
    LEFT JOIN employee_master e_app ON e_app.emp_id = pc_app.emp_id
    WHERE t.task_cd IN (${codes.map((_, i) => `$${i + 1}`).join(',')})
  `, codes);
  console.table(prj.rows);

  console.log("\n=== CHECKING TASK CODES SHOWN IN SCREENSHOT IN INDIVIDUAL TASKS ===");
  const ind = await dbClient.query(`
    SELECT t.emp_task_id, t.task_cd, t.task_nm, tsm.status_nm, t.emp_id,
           e.fst_nm || ' ' || e.lst_nm AS executor_name,
           pc_rev.emp_id AS rev_id, e_rev.fst_nm || ' ' || e_rev.lst_nm AS rev_name,
           pc_app.emp_id AS app_id, e_app.fst_nm || ' ' || e_app.lst_nm AS app_name
    FROM employee_individual_task_master t
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    LEFT JOIN employee_master e ON e.emp_id = t.emp_id
    LEFT JOIN process_config pc_rev ON pc_rev.emp_task_id = t.emp_task_id AND (pc_rev.is_live = true OR pc_rev.is_live IS NULL) AND pc_rev.ordr_id = 1
    LEFT JOIN employee_master e_rev ON e_rev.emp_id = pc_rev.emp_id
    LEFT JOIN process_config pc_app ON pc_app.emp_task_id = t.emp_task_id AND (pc_app.is_live = true OR pc_app.is_live IS NULL) AND pc_app.ordr_id = 2
    LEFT JOIN employee_master e_app ON e_app.emp_id = pc_app.emp_id
    WHERE t.task_cd IN (${codes.map((_, i) => `$${i + 1}`).join(',')}) OR t.task_cd ILIKE '%004%' OR t.task_cd ILIKE '%102%' OR t.task_cd ILIKE '%103%'
  `, codes);
  console.table(ind.rows);

  await dbClient.end();
}

main().catch(console.error);
