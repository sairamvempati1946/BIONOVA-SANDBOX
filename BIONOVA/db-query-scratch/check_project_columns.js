const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const res = await dbClient.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'project_live_master'
  `);
  console.log(res.rows.map(r => r.column_name));
  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
