const { Client } = require('pg');

const client = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await client.connect();
  const res1 = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'task_live_master'
  `);
  console.log("--- task_live_master columns ---");
  console.log(res1.rows.map(r => r.column_name));

  const res2 = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'employee_individual_task_master'
  `);
  console.log("\n--- employee_individual_task_master columns ---");
  console.log(res2.rows.map(r => r.column_name));

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
