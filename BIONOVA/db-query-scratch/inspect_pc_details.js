const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();

  console.log("=== ALL PROCESS_CONFIG ENTRIES FOR EMP 5 ===");
  const pcAll = await dbClient.query(`
    SELECT pc.*, 
           t.task_cd AS prj_task_cd, t.task_nm AS prj_task_nm, tsm_p.status_nm AS prj_sts,
           ind.task_cd AS ind_task_cd, ind.task_nm AS ind_task_nm, tsm_i.status_nm AS ind_sts
    FROM process_config pc
    LEFT JOIN task_live_master t ON t.task_id = pc.task_id
    LEFT JOIN task_status_master tsm_p ON tsm_p.status_id = t.task_sts
    LEFT JOIN employee_individual_task_master ind ON ind.emp_task_id = pc.emp_task_id
    LEFT JOIN task_status_master tsm_i ON tsm_i.status_id = ind.task_sts
    WHERE pc.emp_id = 5
  `);
  console.table(pcAll.rows.map(r => ({
    pc_id: r.pc_id,
    is_live: r.is_live,
    ordr_id: r.ordr_id,
    task_id: r.task_id,
    prj_cd: r.prj_task_cd,
    prj_nm: r.prj_task_nm,
    prj_sts: r.prj_sts,
    emp_task_id: r.emp_task_id,
    ind_cd: r.ind_task_cd,
    ind_nm: r.ind_task_nm,
    ind_sts: r.ind_sts
  })));

  await dbClient.end();
}

main().catch(console.error);
