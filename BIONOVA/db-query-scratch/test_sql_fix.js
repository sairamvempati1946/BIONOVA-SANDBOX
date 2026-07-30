const { Client } = require('pg');
const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const res = await dbClient.query(`
    SELECT 
      COUNT(*) as total, 
      COUNT(*) FILTER (WHERE UPPER(tsm.status_nm) = 'COMPLETED' OR UPPER(tsm.status_nm) = 'CLOSED') AS closed_count
    FROM task_live_master t 
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts
    WHERE (t.emp_id = 7 OR t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = 7))
    AND COALESCE(UPPER(tsm.status_nm), '') <> 'DRAFT'
    AND (t.st_dt IS NULL OR t.st_dt <= CURRENT_DATE OR UPPER(tsm.status_nm) IN ('CLOSED', 'COMPLETED'))
  `);
  console.log('Result with fixed condition:', res.rows);
  await dbClient.end();
}

main().catch(console.error);
