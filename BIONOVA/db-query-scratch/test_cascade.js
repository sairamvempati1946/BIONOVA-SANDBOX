
const { Client } = require('pg');

const client = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function getProjectState(projectId) {
  // Query DB directly to check the exact state of project, milestones and tasks
  const projRes = await client.query('SELECT prj_id, prj_nm, prj_sts FROM project_live_master WHERE prj_id = $1', [projectId]);
  const msRes = await client.query('SELECT m_id, mlstn_ttl, mlstn_sts FROM milestone_live_master WHERE prj_id = $1 ORDER BY m_id', [projectId]);
  
  const tasksRes = await client.query(`
    SELECT t.task_id, t.task_nm, t.m_id, tsm.status_nm 
    FROM task_live_master t
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    WHERE t.m_id IN (SELECT m_id FROM milestone_live_master WHERE prj_id = $1)
    ORDER BY t.task_id
  `, [projectId]);

  return {
    project: projRes.rows[0],
    milestones: msRes.rows,
    tasks: tasksRes.rows
  };
}

async function main() {
  await client.connect();
  const projectId = 6;

  console.log("--- Fetching Auth Token ---");
  const authRes = await fetch('http://localhost:8080/api/auth/temp-token?email=vsv.vempati@gmail.com');
  const { token } = await authRes.json();
  console.log("Token retrieved successfully.");

  console.log("\n--- STATE BEFORE UPDATE ---");
  let state = await getProjectState(projectId);
  console.log("Project:", state.project);
  console.log("Milestones count:", state.milestones.length);
  state.milestones.forEach(m => console.log(`  Milestone [ID ${m.m_id}]: ${m.mlstn_ttl} -> Status: ${m.mlstn_sts}`));
  console.log("Tasks count:", state.tasks.length);
  state.tasks.forEach(t => console.log(`  Task [ID ${t.task_id}]: ${t.task_nm} -> Status: ${t.status_nm}`));

  console.log("\n--- UPDATING PROJECT STATUS TO 'HOLD' ---");
  const holdRes = await fetch(`http://localhost:8080/api/project-live/${projectId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ prjSts: 'HOLD' })
  });
  console.log("Status update response:", holdRes.status);

  console.log("\n--- STATE AFTER HOLD ---");
  state = await getProjectState(projectId);
  console.log("Project:", state.project);
  state.milestones.forEach(m => console.log(`  Milestone [ID ${m.m_id}]: ${m.mlstn_ttl} -> Status: ${m.mlstn_sts}`));
  state.tasks.forEach(t => console.log(`  Task [ID ${t.task_id}]: ${t.task_nm} -> Status: ${t.status_nm}`));

  console.log("\n--- UPDATING PROJECT STATUS BACK TO 'LIVE' ---");
  const liveRes = await fetch(`http://localhost:8080/api/project-live/${projectId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ prjSts: 'LIVE' })
  });
  console.log("Status update response:", liveRes.status);

  console.log("\n--- STATE AFTER LIVE RESTORATION ---");
  state = await getProjectState(projectId);
  console.log("Project:", state.project);
  state.milestones.forEach(m => console.log(`  Milestone [ID ${m.m_id}]: ${m.mlstn_ttl} -> Status: ${m.mlstn_sts}`));
  state.tasks.forEach(t => console.log(`  Task [ID ${t.task_id}]: ${t.task_nm} -> Status: ${t.status_nm}`));

  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  await client.end();
  process.exit(1);
});
