const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const res = await dbClient.query(`
    SELECT line_number, line 
    FROM (
      SELECT row_number() over () as line_number, unnest(string_to_array(prosrc, chr(10))) as line 
      FROM pg_proc 
      WHERE proname = 'get_user_dashboard'
    ) x 
    WHERE line LIKE '%progress%' OR line LIKE '%t_all%'
  `);
  res.rows.forEach(r => {
    console.log(r.line_number + ": " + r.line.trim());
  });
  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
