const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const empIds = [5, 7, 9, 30, 31];
  for (const empId of empIds) {
    console.log(`\n================ EMP ID: ${empId} ================`);
    
    // Check raw task count for this user in DB
    const rawTasks = await dbClient.query(`
      SELECT t.task_id, tsm.status_nm, t.end_dt
      FROM task_live_master t
      LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
      WHERE t.emp_id = $1 OR t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = $1 AND pc.is_live = true)
    `, [empId]);
    
    const rawIndTasks = await dbClient.query(`
      SELECT t.emp_task_id, tsm.status_nm, t.end_dt
      FROM employee_individual_task_master t
      LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
      WHERE (t.emp_id = $1 OR t.emp_task_id IN (SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = $1 AND pc.emp_task_id IS NOT NULL))
      AND COALESCE(t.sts, true) = true
    `, [empId]);

    console.log("RAW PROJECT TASKS:", rawTasks.rows);
    console.log("RAW INDIVIDUAL TASKS:", rawIndTasks.rows);

    try {
      const resDash = await dbClient.query('SELECT get_user_dashboard($1) as data', [empId]);
      console.log("get_user_dashboard summary:", resDash.rows[0].data.summary);
      console.log("get_user_dashboard taskStatusCounts:", resDash.rows[0].data.taskStatusCounts);
    } catch (e) {
      console.error("get_user_dashboard error:", e.message);
    }

    try {
      const resMyTasks = await dbClient.query('SELECT get_user_my_tasks($1) as data', [empId]);
      const tasks = resMyTasks.rows[0].data.tasks || [];
      const closedCount = tasks.filter(t => (t.taskSts || '').toUpperCase() === 'CLOSED' || (t.taskSts || '').toUpperCase() === 'COMPLETED' || t.progress === 100).length;
      console.log(`get_user_my_tasks total tasks: ${tasks.length}, closed tasks count: ${closedCount}`);
    } catch (e) {
      console.error("get_user_my_tasks error:", e.message);
    }

    try {
      const resMyTasksData = await dbClient.query('SELECT get_my_tasks_data($1) as data', [empId]);
      const tasks = resMyTasksData.rows[0].data || [];
      const closedCount = tasks.filter(t => (t.status || '').toUpperCase() === 'CLOSED' || (t.status || '').toUpperCase() === 'COMPLETED' || t.progress === 100).length;
      console.log(`get_my_tasks_data total tasks: ${tasks.length}, closed tasks count: ${closedCount}`);
    } catch (e) {
      console.error("get_my_tasks_data error:", e.message);
    }
  }
  await dbClient.end();
}

main().catch(console.error);
