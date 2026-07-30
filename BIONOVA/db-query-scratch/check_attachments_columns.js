const { Client } = require('pg');

const client = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await client.connect();
  const res1 = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'attachments_master'
  `);
  console.log("--- attachments_master columns ---");
  console.log(res1.rows);
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
