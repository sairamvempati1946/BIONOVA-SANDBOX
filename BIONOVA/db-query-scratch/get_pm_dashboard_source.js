const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const res = await dbClient.query(`
    SELECT prosrc 
    FROM pg_proc 
    WHERE proname = 'get_pm_dashboard'
  `);
  if (res.rows.length > 0) {
    const src = res.rows[0].prosrc;
    fs.writeFileSync(path.join(__dirname, 'get_pm_dashboard.sql'), src);
    console.log("Dumped get_pm_dashboard source to get_pm_dashboard.sql");
  } else {
    console.log("get_pm_dashboard procedure not found");
  }
  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
