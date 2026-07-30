const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const res = await dbClient.query(`
    SELECT 
      task_id, 
      task_nm, 
      end_dt::text as end_dt_text, 
      CURRENT_DATE::text as current_date_text,
      (end_dt < CURRENT_DATE) as is_before
    FROM task_live_master 
    WHERE task_id = 7;
  `);
  console.log(res.rows[0]);
  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
