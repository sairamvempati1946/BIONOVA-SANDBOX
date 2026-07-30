const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  console.log("Restoring task 17 status back to WIP (status_id = 3)...");
  await dbClient.query("UPDATE task_live_master SET task_sts = 3, sub_status = NULL, act_cmp_dt = NULL WHERE task_id = 17");
  console.log("Restored successfully!");
  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
