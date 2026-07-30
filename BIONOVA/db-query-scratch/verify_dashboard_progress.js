const { Client } = require('pg');
const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();

  console.log('=== Emp 5 Dashboard Response myProjects ===');
  const res5 = await dbClient.query('SELECT get_user_dashboard(5) as dash');
  console.log(res5.rows[0].dash.myProjects.map(p => ({
    id: p.projectId,
    name: p.projectName,
    tasksAssigned: p.tasksAssigned,
    closedTasks: p.closedTasks,
    progress: p.progress
  })));

  console.log('=== Emp 7 Dashboard Response myProjects ===');
  const res7 = await dbClient.query('SELECT get_user_dashboard(7) as dash');
  console.log(res7.rows[0].dash.myProjects.map(p => ({
    id: p.projectId,
    name: p.projectName,
    tasksAssigned: p.tasksAssigned,
    closedTasks: p.closedTasks,
    progress: p.progress
  })));

  await dbClient.end();
}

main().catch(console.error);
