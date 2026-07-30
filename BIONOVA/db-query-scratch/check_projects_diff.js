const { Client } = require('pg');
const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();
  
  const res1 = await dbClient.query('SELECT get_user_dashboard(7) as dash');
  console.log('--- Dashboard myProjects (3) ---');
  console.log(res1.rows[0].dash.myProjects.map(p => ({ id: p.projectId, code: p.projectCode, name: p.projectName, status: p.status })));
  console.log('myProjectsCount in summary:', res1.rows[0].dash.summary.myProjectsCount);

  const res2 = await dbClient.query(`
    SELECT p.prj_id, p.prj_cd, p.prj_nm, p.prj_sts
    FROM task_live_master t 
    JOIN milestone_live_master ml ON ml.m_id = t.m_id 
    JOIN project_live_master p ON p.prj_id = ml.prj_id 
    WHERE (t.emp_id = 7 OR t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = 7))
    AND p.prj_sts IN ('LIVE', 'CLOSED', 'HOLD') 
    GROUP BY p.prj_id, p.prj_nm, p.prj_cd, p.prj_sts
  `);
  console.log('--- Query Projects (4) ---');
  console.log(res2.rows);

  await dbClient.end();
}

main().catch(console.error);
