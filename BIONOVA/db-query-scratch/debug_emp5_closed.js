const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const empId = 5;

  console.log("=== PROJECT TASKS FOR EMP 5 ===");
  const prjTasks = await dbClient.query(`
    SELECT 
      t.task_id, 
      t.task_cd, 
      t.task_nm, 
      t.task_sts, 
      tsm.status_nm, 
      t.st_dt, 
      t.end_dt,
      t.emp_id AS executor_id,
      (SELECT pc.emp_id FROM process_config pc WHERE pc.task_id = t.task_id AND pc.is_live = true AND pc.ordr_id = 1 LIMIT 1) AS rev_id,
      (SELECT pc.emp_id FROM process_config pc WHERE pc.task_id = t.task_id AND pc.is_live = true AND pc.ordr_id = 2 LIMIT 1) AS app_id
    FROM task_live_master t
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    WHERE t.emp_id = $1 OR t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = $1 AND pc.is_live = true)
  `, [empId]);
  console.table(prjTasks.rows);

  console.log("\n=== INDIVIDUAL TASKS FOR EMP 5 ===");
  const indTasks = await dbClient.query(`
    SELECT 
      t.emp_task_id AS task_id, 
      t.task_cd, 
      t.task_nm, 
      t.task_sts, 
      tsm.status_nm, 
      t.st_dt, 
      t.end_dt,
      t.emp_id AS executor_id,
      (SELECT pc.emp_id FROM process_config pc WHERE pc.emp_task_id = t.emp_task_id AND (pc.is_live = true OR pc.is_live IS NULL) AND pc.ordr_id = 1 LIMIT 1) AS rev_id,
      (SELECT pc.emp_id FROM process_config pc WHERE pc.emp_task_id = t.emp_task_id AND (pc.is_live = true OR pc.is_live IS NULL) AND pc.ordr_id = 2 LIMIT 1) AS app_id
    FROM employee_individual_task_master t
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    WHERE (t.emp_id = $1 OR t.emp_task_id IN (SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = $1 AND pc.emp_task_id IS NOT NULL AND (pc.is_live = true OR pc.is_live IS NULL)))
      AND COALESCE(t.sts, true) = true
  `, [empId]);
  console.table(indTasks.rows);

  console.log("\n=== ALL CLOSED TASKS FOR EMP 5 ===");
  const allClosedPrj = prjTasks.rows.filter(t => (t.status_nm || '').toUpperCase() === 'CLOSED' || (t.status_nm || '').toUpperCase() === 'COMPLETED');
  const allClosedInd = indTasks.rows.filter(t => (t.status_nm || '').toUpperCase() === 'CLOSED' || (t.status_nm || '').toUpperCase() === 'COMPLETED');
  console.log("Closed Project Tasks:", allClosedPrj);
  console.log("Closed Individual Tasks:", allClosedInd);
  console.log(`Total Closed Project: ${allClosedPrj.length}, Total Closed Individual: ${allClosedInd.length}, Grand Total Closed: ${allClosedPrj.length + allClosedInd.length}`);

  // Let's also check get_my_tasks_data(5) output in detail
  const myTasksRes = await dbClient.query('SELECT get_my_tasks_data(5) as data');
  const myTasks = myTasksRes.rows[0].data || [];
  const closedMyTasks = myTasks.filter(t => (t.status || '').toUpperCase() === 'CLOSED' || (t.status || '').toUpperCase() === 'COMPLETED' || t.progress === 100);
  console.log("\n=== GET_MY_TASKS_DATA(5) CLOSED TASKS LIST ===");
  console.table(closedMyTasks.map(t => ({ id: t.id, title: t.title, status: t.status, rawStatus: t.rawStatus, isIndividual: t.isIndividual, progress: t.progress })));

  await dbClient.end();
}

main().catch(console.error);
