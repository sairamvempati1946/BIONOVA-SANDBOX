const { Client } = require('pg');
const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  const res = await dbClient.query(`
    SELECT 
      p.prj_id, 
      p.prj_cd, 
      p.prj_nm,
      COALESCE((
        SELECT ROUND(
          (SUM(
            CASE 
              WHEN UPPER(tsm_all.status_nm) = 'COMPLETED' OR UPPER(tsm_all.status_nm) = 'CLOSED' THEN 1.0
              WHEN UPPER(tsm_all.status_nm) = 'WIP' OR UPPER(tsm_all.status_nm) = 'IN PROGRESS' THEN 
                CASE 
                  WHEN UPPER(t_all.sub_status) = 'UNDER REVIEW' THEN 0.8
                  WHEN UPPER(t_all.sub_status) = 'REWORK' THEN 0.2
                  ELSE 0.5
                END
              ELSE 0.0
            END
          ) / NULLIF(COUNT(*), 0)) * 100, 0)
        FROM task_live_master t_all
        JOIN milestone_live_master ml_all ON ml_all.m_id = t_all.m_id
        LEFT JOIN task_status_master tsm_all ON tsm_all.status_id = t_all.task_sts
        WHERE ml_all.prj_id = p.prj_id
          AND t_all.emp_id = 7
          AND COALESCE(UPPER(tsm_all.status_nm), '') <> 'DRAFT'
      ), 0) AS calculated_progress
    FROM project_live_master p
    WHERE p.prj_id IN (24, 6, 12, 19)
    ORDER BY p.prj_nm;
  `);
  console.log('Calculated project progress for Emp 7:');
  console.log(res.rows);
  await dbClient.end();
}

main().catch(console.error);
