const { Client } = require('pg');

const client = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT e.emp_id, e.email, e.fst_nm, e.lst_nm, p.emp_password 
    FROM employee_master e
    LEFT JOIN employee_password_master p ON e.emp_id = p.emp_id
    LIMIT 10
  `);
  console.log(res.rows);
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
