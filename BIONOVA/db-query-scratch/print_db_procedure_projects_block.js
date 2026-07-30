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
  const lines = src.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('User Projects list')) {
      console.log(`Found 'User Projects list' at line ${idx + 1}`);
      for (let i = idx; i <= idx + 25; i++) {
        console.log(`  ${i + 1}: ${lines[i]}`);
      }
    }
  });
  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
