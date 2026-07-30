const { Client } = require('pg');
const fs = require('fs');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const procs = ['get_user_dashboard', 'get_user_my_tasks', 'get_my_tasks_data', 'get_pm_dashboard'];
  for (const p of procs) {
    const res = await dbClient.query(`
      SELECT p.proname, pg_get_functiondef(p.oid) as def
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = $1
    `, [p]);
    if (res.rows.length > 0) {
      console.log(`Found procedure: ${p}, writing to ${p}.sql`);
      fs.writeFileSync(`./${p}_db_dump.sql`, res.rows[0].def);
    } else {
      console.log(`Procedure NOT found: ${p}`);
    }
  }
  await dbClient.end();
}

main().catch(console.error);
