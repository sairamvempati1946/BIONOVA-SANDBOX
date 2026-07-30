const { Client } = require('pg');
const axios = require('axios');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  
  // Find all tasks of project 12
  const tasksRes = await dbClient.query(`
    SELECT t.task_id, t.task_nm, tsm.status_nm
    FROM task_live_master t
    JOIN milestone_live_master ml ON t.m_id = ml.m_id
    LEFT JOIN task_status_master tsm ON t.task_sts = tsm.status_id
    WHERE ml.prj_id = 12
  `);
  console.log("Tasks of EcoGas Plant:");
  console.log(tasksRes.rows);

  const taskId = tasksRes.rows[0].task_id;
  console.log(`\nUsing Task ID ${taskId} for testing.`);

  console.log("Logging in...");
  const loginRes = await axios.post("http://localhost:8080/api/auth/login", {
    email: "vkpraveen216@gmail.com",
    password: "Kumar@2311"
  });
  const token = loginRes.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  console.log(`Resetting task ${taskId} to Open (status_id = 2)...`);
  await dbClient.query("UPDATE task_live_master SET task_sts = 2, sub_status = NULL, act_cmp_dt = NULL WHERE task_id = $1", [taskId]);

  // Start Task
  console.log("\nStarting task...");
  try {
    await axios.post(`http://localhost:8080/api/process/task/${taskId}/start`, { empId: 5 }, { headers });
  } catch (e) {
    console.log("Start task message/error:", e.response ? e.response.data : e.message);
  }

  // Complete checklist
  console.log("Completing checklist items...");
  const chkRes = await axios.get(`http://localhost:8080/api/checklists/live-task/${taskId}`, { headers });
  for (const item of chkRes.data) {
    if (!item.chkSts) {
      await axios.patch(`http://localhost:8080/api/checklists/${item.chkId}/complete`, {}, { headers });
    }
  }

  // Submit for review
  console.log("Submitting task...");
  try {
    await axios.post(`http://localhost:8080/api/process/task/${taskId}/submit`, { empId: 5, remarks: "Ready" }, { headers });
  } catch (e) {
    console.log("Submit message/error:", e.response ? e.response.data : e.message);
  }

  // Fetch project-live progress
  console.log("\nFetching project-live progress from backend before approval (WIP is 50% / Under Review is 80%):");
  const projRes = await axios.get("http://localhost:8080/api/project-live/12", { headers });
  console.log(`Backend-enriched Project Progress: ${projRes.data.progress}%`);

  // Force task completion for testing (using SQL to complete it directly, then triggering status cascade update if needed)
  console.log("\nCompleting task via SQL...");
  await dbClient.query("UPDATE task_live_master SET task_sts = 5, sub_status = NULL, act_cmp_dt = NOW() WHERE task_id = $1", [taskId]);

  // Fetch project-live progress after completion
  const projResAfter = await axios.get("http://localhost:8080/api/project-live/12", { headers });
  console.log(`Backend-enriched Project Progress after task completion: ${projResAfter.data.progress}%`);

  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
