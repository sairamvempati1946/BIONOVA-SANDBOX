const { Client } = require('pg');
const client = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await client.connect();
  console.log("Terminating blocking database backends...");
  const res = await client.query(`
    SELECT pid, query, state FROM pg_stat_activity 
    WHERE pid <> pg_backend_pid() AND state != 'idle';
  `);
  console.log("Active processes to terminate:", res.rows);

  for (const row of res.rows) {
    try {
      await client.query('SELECT pg_terminate_backend($1)', [row.pid]);
      console.log(`Terminated PID ${row.pid}`);
    } catch (e) {
      console.error(`Failed to terminate PID ${row.pid}:`, e.message);
    }
  }
  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  await client.end();
});
