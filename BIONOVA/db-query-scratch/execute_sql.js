const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await client.connect();
  console.log("Connected to database successfully!");

  const sqlPath = path.join(__dirname, 'get_user_dashboard.sql');
  console.log("Reading SQL from:", sqlPath);
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log("Executing SQL...");
  await client.query(sql);
  console.log("SQL executed successfully!");

  await client.end();
}

main().catch(err => {
  console.error("Error executing SQL:", err);
  process.exit(1);
});
