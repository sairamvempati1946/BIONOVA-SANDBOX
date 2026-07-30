const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const sql = fs.readFileSync(path.join(__dirname, '../bionova-backend/sql_check.sql'), 'utf8');
  await dbClient.query(sql);
  console.log('Successfully applied sql_check.sql stored procedure update to Supabase DB!');

  const testRes = await dbClient.query('SELECT get_user_dashboard(7) as dash');
  console.log('Dashboard output for emp 7:');
  console.log('closedTasksCount:', testRes.rows[0].dash.summary.closedTasksCount);
  console.log('closedCount:', testRes.rows[0].dash.summary.closedCount);
  console.log('taskStatusCounts:', testRes.rows[0].dash.taskStatusCounts);
  console.log('metricsTrends closedTasks:', testRes.rows[0].dash.metricsTrends.closedTasks);
  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
