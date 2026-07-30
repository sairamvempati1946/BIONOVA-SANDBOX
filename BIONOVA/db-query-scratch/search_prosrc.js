const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const res = await dbClient.query(`
    SELECT prosrc 
    FROM pg_proc 
    WHERE proname = 'get_user_dashboard'
  `);
  const src = res.rows[0].prosrc;
  const matchIdx = src.indexOf("'progress'");
  if (matchIdx !== -1) {
    console.log("Found progress at index", matchIdx, ":\n", src.substring(matchIdx, matchIdx + 800));
  } else {
    console.log("Not found 'progress'");
  }
  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
