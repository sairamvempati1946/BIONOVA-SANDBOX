const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await client.connect();
  console.log("Fetching user dashboard for employee 5...");
  const res = await client.query('SELECT get_user_dashboard(5) AS dashboard');
  const filePath = path.join(__dirname, 'dashboard_emp_5.json');
  fs.writeFileSync(filePath, JSON.stringify(res.rows[0].dashboard, null, 2), 'utf8');
  console.log(`Saved output to ${filePath}`);
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
