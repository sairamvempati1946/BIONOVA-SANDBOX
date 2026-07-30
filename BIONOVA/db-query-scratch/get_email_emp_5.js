const { Client } = require('pg');

const client = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT emp_id, email, fst_nm, lst_nm FROM employee_master WHERE emp_id = 5');
  console.log(res.rows[0]);
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
