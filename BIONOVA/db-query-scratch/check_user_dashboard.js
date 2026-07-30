const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const res = await dbClient.query(`
    SELECT public.get_user_dashboard(5) AS dashboard;
  `);
  console.log(JSON.stringify(res.rows[0].dashboard, null, 2));
  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
