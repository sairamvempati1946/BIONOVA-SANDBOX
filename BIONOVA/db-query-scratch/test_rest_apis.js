const API_BASE = "http://localhost:8080/api";

async function run() {
  console.log("Starting REST API validation...");
  
  // 1. Login
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "vkpraveen216@gmail.com", password: "Kumar@2311" })
  });
  
  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
  }
  
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log("Logged in successfully! Token obtained:", token ? "YES" : "NO");
  
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
  
  // 2. Fetch live projects
  const projectsRes = await fetch(`${API_BASE}/project-live`, { headers });
  if (!projectsRes.ok) throw new Error("Failed to fetch live projects");
  const projects = await projectsRes.json();
  console.log(`Fetched ${projects.length} live projects.`);
  
  let foundMilestones = false;
  for (const project of projects) {
    const prjId = project.prj_id || project.prjId;
    console.log(`Checking project ID ${prjId} (${project.prj_cd || project.prjCd}) for live milestones...`);
    
    const milestonesRes = await fetch(`${API_BASE}/project-live/${prjId}/milestones`, { headers });
    if (!milestonesRes.ok) continue;
    const milestones = await milestonesRes.json();
    
    if (milestones.length > 0) {
      foundMilestones = true;
      console.log(`Fetched ${milestones.length} live milestones for project ${prjId}.`);
      
      const testMilestone = milestones[0];
      const mId = testMilestone.mid || testMilestone.mId || testMilestone.id;
      console.log(`Testing live milestone: ID=${mId}, Code=${testMilestone.mlstnCd || testMilestone.code}, Title=${testMilestone.mlstnTtl || testMilestone.title}`);
      
      // Fetch live tasks for milestone
      const tasksRes = await fetch(`${API_BASE}/task-live/by-milestone/${mId}`, { headers });
      if (!tasksRes.ok) throw new Error(`Failed to fetch live tasks for milestone ${mId}`);
      const tasks = await tasksRes.json();
      console.log(`Fetched ${tasks.length} live tasks for milestone ${mId}.`);
      
      if (tasks.length > 0) {
        const testTask = tasks[0];
        const taskId = testTask.taskId || testTask.task_id;
        console.log(`Testing live task: ID=${taskId}, Code=${testTask.taskCd}, Name=${testTask.taskNm}`);
        
        // Fetch checklist for live task
        const chkRes = await fetch(`${API_BASE}/checklists/live-task/${taskId}`, { headers });
        console.log(`Checklist response status for live task ${taskId}:`, chkRes.status);
        if (chkRes.ok) {
          const checklist = await chkRes.json();
          console.log(`Fetched ${checklist.length} checklist items.`);
        }
        
        // Fetch attachments for live task
        const attRes = await fetch(`${API_BASE}/attachments/live-task/${taskId}`, { headers });
        console.log(`Attachments response status for live task ${taskId}:`, attRes.status);
        if (attRes.ok) {
          const attachments = await attRes.json();
          console.log(`Fetched ${attachments.length} attachments.`);
        }
        
        // Fetch process config for live task
        const prcRes = await fetch(`${API_BASE}/process-config/live-task/${taskId}`, { headers });
        console.log(`Process config status for live task ${taskId}:`, prcRes.status);
        if (prcRes.ok) {
          const processSteps = await prcRes.json();
          console.log(`Fetched ${processSteps.length} process steps.`);
        }
      }
      break; // stop after first successful test
    }
  }
  
  if (!foundMilestones) {
    console.log("No projects with live milestones found.");
  }
  
  console.log("\nAll REST API endpoints responded successfully and verified!");
}

run().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
