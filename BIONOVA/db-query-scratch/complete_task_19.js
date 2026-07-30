const axios = require('axios');

async function main() {
  try {
    console.log("Logging in...");
    const loginRes = await axios.post("http://localhost:8080/api/auth/login", {
      email: "vkpraveen216@gmail.com",
      password: "Kumar@2311"
    });
    const token = loginRes.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log("Login successful!");

    const taskId = 19;

    // Fetch initial task state
    console.log(`\nFetching task ${taskId} details...`);
    const tasksRes = await axios.get("http://localhost:8080/api/task-live", { headers });
    const task = tasksRes.data.find(t => t.taskId === taskId);
    if (!task) {
      console.log(`Task ${taskId} not found!`);
      return;
    }
    console.log(`Current Status: ${task.taskSts ? task.taskSts.statusNm : 'null'} (SubStatus: ${task.subStatus})`);

    // Reset status to OPEN in database if it is not OPEN (using SQL direct database connection to reset)
    const { Client } = require('pg');
    const dbClient = new Client({
      connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
    });
    await dbClient.connect();
    console.log("Resetting task 19 to status_id = 2 (Open) and clearing sub_status...");
    await dbClient.query("UPDATE task_live_master SET task_sts = 2, sub_status = NULL, act_cmp_dt = NULL WHERE task_id = 19");
    await dbClient.end();
    console.log("Task reset done in database!");

    // Start Task
    console.log("\nStarting task...");
    await axios.post(`http://localhost:8080/api/process/task/${taskId}/start`, { empId: 5 }, { headers });

    // Fetch checklists
    console.log("Completing checklist items...");
    const chkRes = await axios.get(`http://localhost:8080/api/checklists/live-task/${taskId}`, { headers });
    for (const item of chkRes.data) {
      if (!item.chkSts) {
        await axios.patch(`http://localhost:8080/api/checklists/${item.chkId}/complete`, {}, { headers });
        console.log(`Completed checklist item: ${item.chkNm}`);
      }
    }

    // Submit for review
    console.log("Submitting task for review...");
    await axios.post(`http://localhost:8080/api/process/task/${taskId}/submit`, { empId: 5, remarks: "Ready for review" }, { headers });

    // Fetch dashboard to see progress before final completion (WIP with Under Review status is 80% weight)
    console.log("\nFetching dashboard before final approval...");
    const dashResMid = await axios.get("http://localhost:8080/api/user-dashboard", { headers });
    dashResMid.data.myProjects.forEach(p => {
      console.log(`- Project: ${p.projectName}: Progress = ${p.progress}%, Lead/Lag = ${p.leadLagStatus}`);
    });

    // Checker Action
    console.log("\nChecker Action...");
    await axios.post(`http://localhost:8080/api/process/task/${taskId}/checker-action`, { empId: 8, decision: "YES", remarks: "Checked" }, { headers });

    // Approver/Reviewer Action
    console.log("Approver/Reviewer Action...");
    await axios.post(`http://localhost:8080/api/process/task/${taskId}/reviewer-action`, { empId: 7, decision: "YES", remarks: "Approved" }, { headers });

    // Fetch dashboard again to see progress after task is Completed (100% weight)
    console.log("\nFetching dashboard after completion...");
    const dashResFinal = await axios.get("http://localhost:8080/api/user-dashboard", { headers });
    dashResFinal.data.myProjects.forEach(p => {
      console.log(`- Project: ${p.projectName}: Progress = ${p.progress}%, Lead/Lag = ${p.leadLagStatus}`);
    });

  } catch (err) {
    console.error("Error running script:", err.response ? err.response.data : err.message);
  }
}

main();
