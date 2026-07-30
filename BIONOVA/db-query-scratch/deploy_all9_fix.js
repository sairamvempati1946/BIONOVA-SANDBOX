const { Client } = require('pg');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

const sqlGetUserDashboard = `
CREATE OR REPLACE FUNCTION public.get_user_dashboard(p_emp_id bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE 
  v_today          DATE := CURRENT_DATE; 
  v_emp            RECORD; 
  v_full_name      TEXT; 
  v_total_tasks    INT := 0; 
  v_completed      INT := 0; 
  v_overdue        INT := 0; 
  v_due_today      INT := 0; 
  v_wip            INT := 0; 
  v_under_review   INT := 0; 
  v_open           INT := 0; 
  v_reassigned     INT := 0; 
  v_rework         INT := 0; 
  v_draft          INT := 0; 
  v_my_prj_count   BIGINT := 0; 
  v_todo_list      jsonb; 
  v_upcoming       jsonb; 
  v_my_projects    jsonb; 
  v_metrics_trends jsonb; 
  v_recent_activity jsonb; 
  v_performance    jsonb; 
  v_productivity   INT := 100; 
  v_quality        INT := 100; 
BEGIN 
  /* 1. Employee Profile Details */ 
  SELECT em.emp_id, em.fst_nm, em.lst_nm, em.photo_url, 
         dm.desig_nm, dept.dept_nm 
  INTO v_emp 
  FROM employee_master em 
  LEFT JOIN designation_master dm   ON dm.desig_id = em.desig_id 
  LEFT JOIN department_master  dept ON dept.dept_id = em.dept_id 
  WHERE em.emp_id = p_emp_id; 

  v_full_name := TRIM(COALESCE(v_emp.fst_nm,'')||' '||COALESCE(v_emp.lst_nm,'')); 

  /* 2. Task Counts from BOTH project tasks and individual assignments using Temporary Table */ 
  DROP TABLE IF EXISTS temp_all_tasks; 
  CREATE TEMPORARY TABLE temp_all_tasks ON COMMIT DROP AS 
    SELECT 
      t.task_id, 
      t.task_nm, 
      t.st_dt, 
      t.end_dt, 
      COALESCE(t.act_cmp_dt, CASE WHEN UPPER(tsm.status_nm) IN ('CLOSED', 'COMPLETED') THEN t.end_dt ELSE NULL END) AS act_cmp_dt, 
      t.no_of_days, 
      t.task_sts, 
      tsm.status_nm, 
      t.sub_status,
      COALESCE(p.prj_cd || ' - ' || m.mlstn_ttl, '') AS project_info, 
      COALESCE(p.prj_cd, '') AS prj_cd, 
      CASE 
        WHEN t.emp_id = p_emp_id THEN 'Executor' 
        WHEN t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.task_id IS NOT NULL AND pc.ordr_id = 1) THEN 'Reviewer' 
        WHEN t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.task_id IS NOT NULL AND pc.ordr_id = 2) THEN 'Approver' 
        ELSE 'Executor' 
      END AS user_badge, 
      pm.priority_nm, 
      'PROJECT' AS task_source 
    FROM task_live_master t 
    LEFT JOIN milestone_live_master m ON m.m_id = t.m_id 
    LEFT JOIN project_live_master p ON p.prj_id = m.prj_id 
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts 
    LEFT JOIN task_priority_master pm ON pm.priority_id = t.priority 
    WHERE (t.emp_id = p_emp_id OR t.task_id IN ( 
      SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.task_id IS NOT NULL
    )) AND COALESCE(UPPER(tsm.status_nm), '') <> 'DRAFT' AND (t.st_dt IS NULL OR t.st_dt <= v_today OR UPPER(tsm.status_nm) IN ('CLOSED', 'COMPLETED'))
 
    UNION ALL 
 
    SELECT 
      t.emp_task_id AS task_id, 
      t.task_nm, 
      t.st_dt, 
      t.end_dt, 
      CASE WHEN UPPER(tsm.status_nm) IN ('CLOSED', 'COMPLETED') THEN t.end_dt ELSE NULL END AS act_cmp_dt, 
      (t.end_dt - t.st_dt) AS no_of_days, 
      t.task_sts, 
      tsm.status_nm, 
      t.sub_status,
      COALESCE(INITCAP(t.task_asgn_to), 'Internal') AS project_info, 
      COALESCE(INITCAP(t.task_asgn_to), 'Internal') AS prj_cd, 
      CASE 
        WHEN t.emp_id = p_emp_id THEN 'Executor' 
        WHEN t.emp_task_id IN (SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.emp_task_id IS NOT NULL AND pc.ordr_id = 1) THEN 'Reviewer' 
        WHEN t.emp_task_id IN (SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.emp_task_id IS NOT NULL AND pc.ordr_id = 2) THEN 'Approver' 
        ELSE 'Executor' 
      END AS user_badge, 
      pm.priority_nm, 
      'INDIVIDUAL' AS task_source 
    FROM employee_individual_task_master t 
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts 
    LEFT JOIN task_priority_master pm ON pm.priority_id = t.priority 
    WHERE (t.emp_id = p_emp_id OR t.emp_task_id IN ( 
      SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.emp_task_id IS NOT NULL
    )) AND COALESCE(t.sts, true) = true AND COALESCE(UPPER(tsm.status_nm), '') <> 'DRAFT' AND (t.st_dt IS NULL OR t.st_dt <= v_today OR UPPER(tsm.status_nm) IN ('CLOSED', 'COMPLETED'))
  ; 
 
  SELECT 
    COUNT(*), 
    COUNT(*) FILTER (WHERE UPPER(status_nm) IN ('CLOSED', 'COMPLETED')), 
    COUNT(*) FILTER (WHERE UPPER(status_nm) = 'OVER_DUE' OR (UPPER(status_nm) NOT IN ('CLOSED', 'COMPLETED') AND end_dt IS NOT NULL AND end_dt < v_today)), 
    COUNT(*) FILTER (WHERE UPPER(status_nm) NOT IN ('CLOSED', 'COMPLETED') AND end_dt = v_today), 
    COUNT(*) FILTER (WHERE (UPPER(status_nm) = 'WIP' OR UPPER(status_nm) = 'IN PROGRESS')), 
    COUNT(*) FILTER (WHERE (UPPER(status_nm) = 'WIP' OR UPPER(status_nm) = 'IN PROGRESS') AND UPPER(sub_status) = 'UNDER REVIEW'), 
    COUNT(*) FILTER (WHERE UPPER(status_nm) = 'OPEN' OR status_nm IS NULL), 
    COUNT(*) FILTER (WHERE (UPPER(status_nm) = 'WIP' OR UPPER(status_nm) = 'IN PROGRESS') AND UPPER(sub_status) = 'REASSIGN'), 
    COUNT(*) FILTER (WHERE (UPPER(status_nm) = 'WIP' OR UPPER(status_nm) = 'IN PROGRESS') AND UPPER(sub_status) = 'REWORK'), 
    COUNT(*) FILTER (WHERE UPPER(status_nm) = 'DRAFT') 
  INTO v_total_tasks, v_completed, v_overdue, v_due_today, 
       v_wip, v_under_review, v_open, v_reassigned, v_rework, v_draft 
  FROM temp_all_tasks; 

  /* 3. Projects Count (Only active projects) */ 
  SELECT COUNT(DISTINCT m.prj_id) INTO v_my_prj_count 
  FROM task_live_master t 
  JOIN milestone_live_master m ON m.m_id = t.m_id 
  JOIN project_live_master p ON p.prj_id = m.prj_id 
  WHERE (t.emp_id = p_emp_id OR t.task_id IN ( 
    SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.task_id IS NOT NULL 
  )) AND p.prj_sts = 'LIVE'; 

  /* 4. To-Do List (Limit 5, ordered by end_dt) */ 
  WITH all_todo AS ( 
    SELECT 
      t.task_id, 
      t.task_cd,
      t.task_nm, 
      t.st_dt, 
      t.end_dt, 
      t.task_sts, 
      tsm.status_nm, 
      COALESCE(p.prj_cd || ' - ' || m.mlstn_ttl, '') AS project_info, 
      CASE 
        WHEN t.emp_id = p_emp_id THEN 'Executor' 
        WHEN t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.task_id IS NOT NULL AND pc.ordr_id = 1) THEN 'Reviewer' 
        WHEN t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.task_id IS NOT NULL AND pc.ordr_id = 2) THEN 'Approver' 
        ELSE 'Executor' 
      END AS user_badge, 
      pm.priority_nm, 
      'PROJECT' AS task_source,
      ( 
        SELECT jsonb_agg(jsonb_build_object( 
          'empId', em.emp_id, 
          'fullName', TRIM(COALESCE(em.fst_nm,'')||' '||COALESCE(em.lst_nm,'')), 
          'photoUrl', em.photo_url, 
          'role', CASE WHEN t.emp_id = em.emp_id THEN 'Executor' ELSE 'Reviewer/Approver' END 
        )) 
        FROM employee_master em 
        WHERE em.emp_id = t.emp_id 
           OR em.emp_id IN (SELECT pc.emp_id FROM process_config pc WHERE pc.task_id = t.task_id AND pc.task_id IS NOT NULL) 
      ) AS employees 
    FROM task_live_master t 
    LEFT JOIN milestone_live_master m ON m.m_id = t.m_id 
    LEFT JOIN project_live_master p ON p.prj_id = m.prj_id 
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts 
    LEFT JOIN task_priority_master pm ON pm.priority_id = t.priority 
    WHERE (t.emp_id = p_emp_id OR t.task_id IN ( 
      SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.task_id IS NOT NULL 
    )) 

    UNION ALL 

    SELECT 
      t.emp_task_id AS task_id, 
      t.task_cd,
      t.task_nm, 
      t.st_dt, 
      t.end_dt, 
      t.task_sts, 
      tsm.status_nm, 
      COALESCE(INITCAP(t.task_asgn_to), 'Internal') AS project_info, 
      CASE 
        WHEN t.emp_id = p_emp_id THEN 'Executor' 
        WHEN t.emp_task_id IN (SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.emp_task_id IS NOT NULL AND pc.ordr_id = 1) THEN 'Reviewer' 
        WHEN t.emp_task_id IN (SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.emp_task_id IS NOT NULL AND pc.ordr_id = 2) THEN 'Approver' 
        ELSE 'Executor' 
      END AS user_badge, 
      pm.priority_nm, 
      'INDIVIDUAL' AS task_source,
      ( 
        SELECT jsonb_agg(jsonb_build_object( 
          'empId', em.emp_id, 
          'fullName', TRIM(COALESCE(em.fst_nm,'')||' '||COALESCE(em.lst_nm,'')), 
          'photoUrl', em.photo_url, 
          'role', CASE WHEN t.emp_id = em.emp_id THEN 'Executor' ELSE 'Reviewer/Approver' END 
        )) 
        FROM employee_master em 
        WHERE em.emp_id = t.emp_id 
           OR em.emp_id IN (SELECT pc.emp_id FROM process_config pc WHERE pc.emp_task_id = t.emp_task_id AND pc.emp_task_id IS NOT NULL) 
      ) AS employees 
    FROM employee_individual_task_master t 
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts 
    LEFT JOIN task_priority_master pm ON pm.priority_id = t.priority 
    WHERE (t.emp_id = p_emp_id OR t.emp_task_id IN ( 
      SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.emp_task_id IS NOT NULL 
    )) AND COALESCE(t.sts, true) = true 
  ) 
  SELECT jsonb_agg(sub) INTO v_todo_list 
  FROM ( 
    SELECT jsonb_build_object( 
      'taskId', t.task_id, 
      'taskCode', COALESCE(t.task_cd, CASE WHEN t.task_source = 'INDIVIDUAL' THEN 'IND-' || t.task_id ELSE 'TSK-' || t.task_id END),
      'taskNm', t.task_nm, 
      'project', t.project_info, 
      'endDt', t.end_dt, 
      'status', t.status_nm, 
      'isOverdue', (UPPER(t.status_nm) = 'OVER_DUE' OR (UPPER(t.status_nm) NOT IN ('COMPLETED', 'CLOSED') AND t.end_dt < v_today)), 
      'isDueToday', (UPPER(t.status_nm) NOT IN ('COMPLETED', 'CLOSED') AND t.end_dt = v_today), 
      'priority', CASE COALESCE(t.priority_nm, 'MEDIUM') 
                    WHEN 'LOW' THEN 'Low' 
                    WHEN 'NORMAL' THEN 'Medium' 
                    WHEN 'MEDIUM' THEN 'Medium' 
                    WHEN 'HIGH' THEN 'High' 
                    WHEN 'CRITICAL' THEN 'High' 
                    ELSE 'Medium' 
                  END, 
      'badge', t.user_badge, 
      'taskSource', t.task_source,
      'employees', COALESCE(t.employees, '[]'::jsonb) 
    ) AS sub 
    FROM all_todo t 
    WHERE UPPER(COALESCE(t.status_nm, '')) NOT IN ('COMPLETED', 'CLOSED') 
      AND (t.st_dt IS NULL OR t.st_dt <= v_today) 
    ORDER BY t.end_dt ASC NULLS LAST 
    LIMIT 5 
  ) x; 

  /* 5. Upcoming Tasks (Limit 5, ordered by end_dt) */ 
  WITH all_upcoming AS ( 
    SELECT 
      t.task_id, 
      t.task_cd,
      t.task_nm, 
      t.st_dt, 
      t.end_dt, 
      t.no_of_days, 
      t.task_sts, 
      tsm.status_nm, 
      COALESCE(p.prj_cd, '') AS prj_cd, 
      pm.priority_nm, 
      'PROJECT' AS task_source,
      ( 
        SELECT jsonb_agg(jsonb_build_object( 
          'empId', em.emp_id, 
          'fullName', TRIM(COALESCE(em.fst_nm,'')||' '||COALESCE(em.lst_nm,'')), 
          'photoUrl', em.photo_url, 
          'role', CASE WHEN t.emp_id = em.emp_id THEN 'Executor' ELSE 'Reviewer/Approver' END 
        )) 
        FROM employee_master em 
        WHERE em.emp_id = t.emp_id 
           OR em.emp_id IN (SELECT pc.emp_id FROM process_config pc WHERE pc.task_id = t.task_id AND pc.task_id IS NOT NULL) 
      ) AS employees 
    FROM task_live_master t 
    LEFT JOIN milestone_live_master m ON m.m_id = t.m_id 
    LEFT JOIN project_live_master p ON p.prj_id = m.prj_id 
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts 
    LEFT JOIN task_priority_master pm ON pm.priority_id = t.priority 
    WHERE (t.emp_id = p_emp_id OR t.task_id IN ( 
      SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.task_id IS NOT NULL 
    )) 

    UNION ALL 

    SELECT 
      t.emp_task_id AS task_id, 
      t.task_cd,
      t.task_nm, 
      t.st_dt, 
      t.end_dt, 
      (t.end_dt - t.st_dt) AS no_of_days, 
      t.task_sts, 
      tsm.status_nm, 
      COALESCE(INITCAP(t.task_asgn_to), 'Internal') AS prj_cd, 
      pm.priority_nm, 
      'INDIVIDUAL' AS task_source,
      ( 
        SELECT jsonb_agg(jsonb_build_object( 
          'empId', em.emp_id, 
          'fullName', TRIM(COALESCE(em.fst_nm,'')||' '||COALESCE(em.lst_nm,'')), 
          'photoUrl', em.photo_url, 
          'role', CASE WHEN t.emp_id = em.emp_id THEN 'Executor' ELSE 'Reviewer/Approver' END 
        )) 
        FROM employee_master em 
        WHERE em.emp_id = t.emp_id 
           OR em.emp_id IN (SELECT pc.emp_id FROM process_config pc WHERE pc.emp_task_id = t.emp_task_id AND pc.emp_task_id IS NOT NULL) 
      ) AS employees 
    FROM employee_individual_task_master t 
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts 
    LEFT JOIN task_priority_master pm ON pm.priority_id = t.priority 
    WHERE (t.emp_id = p_emp_id OR t.emp_task_id IN ( 
      SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.emp_task_id IS NOT NULL 
    )) AND COALESCE(t.sts, true) = true 
  ) 
  SELECT jsonb_agg(sub) INTO v_upcoming 
  FROM ( 
    SELECT jsonb_build_object( 
      'taskId', t.task_id, 
      'taskCode', COALESCE(t.task_cd, CASE WHEN t.task_source = 'INDIVIDUAL' THEN 'IND-' || t.task_id ELSE 'TSK-' || t.task_id END),
      'taskNm', t.task_nm, 
      'prjCd', t.prj_cd, 
      'stDt', t.st_dt, 
      'endDt', t.end_dt, 
      'durationDays', t.no_of_days, 
      'priority', CASE COALESCE(t.priority_nm, 'MEDIUM') 
                    WHEN 'LOW' THEN 'Low' 
                    WHEN 'NORMAL' THEN 'Medium' 
                    WHEN 'MEDIUM' THEN 'Medium' 
                    WHEN 'HIGH' THEN 'High' 
                    WHEN 'CRITICAL' THEN 'High' 
                    ELSE 'Medium' 
                  END, 
      'employees', COALESCE(t.employees, '[]'::jsonb) 
    ) AS sub 
    FROM all_upcoming t 
    WHERE UPPER(t.status_nm) NOT IN ('COMPLETED', 'CLOSED') AND t.st_dt > v_today 
    ORDER BY t.end_dt ASC NULLS LAST 
    LIMIT 5 
  ) x; 

  /* 6. User Projects list with details and progress */ 
  SELECT jsonb_agg(sub) INTO v_my_projects 
  FROM ( 
    SELECT jsonb_build_object( 
      'projectId',     p.prj_id, 
      'projectName',   p.prj_nm, 
      'projectCode',   p.prj_cd, 
      'clientName',    COALESCE(cm.coy_nm, (SELECT coy_nm FROM company_master LIMIT 1), ''), 
      'plantName',     COALESCE(pm.plt_nm, (SELECT plt_nm FROM plant_master LIMIT 1), ''), 
      'location',      COALESCE(cm.ct_vlg, (SELECT ct_vlg FROM company_master LIMIT 1), ''), 
      'logo',          p.logo, 
      'role',          COALESCE(pa.access_type, 'Team Member'), 
      'status',        CASE 
                         WHEN p.prj_sts = 'HOLD' THEN 'On Hold' 
                         WHEN p.prj_sts = 'CLOSED' THEN 'Completed' 
                         ELSE 'In Progress' 
                       END, 
      'dueDate',       p.end_dt, 
      'tasksAssigned', COUNT(t.task_id), 
      'openTasks',     COUNT(t.task_id) FILTER (WHERE UPPER(tsm.status_nm) NOT IN ('COMPLETED', 'CLOSED')), 
      'closedTasks',   COUNT(t.task_id) FILTER (WHERE UPPER(tsm.status_nm) IN ('COMPLETED', 'CLOSED')),
      'progress',      COALESCE((
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
          ) / NULLIF(COUNT(t_all.task_id), 0)) * 100, 0)
        FROM task_live_master t_all
        JOIN milestone_live_master ml_all ON ml_all.m_id = t_all.m_id
        LEFT JOIN task_status_master tsm_all ON tsm_all.status_id = t_all.task_sts
        WHERE ml_all.prj_id = p.prj_id
          AND (t_all.emp_id = p_emp_id OR t_all.task_id IN (
            SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.task_id IS NOT NULL
          ))
          AND COALESCE(UPPER(tsm_all.status_nm), '') <> 'DRAFT'
      ), 0)
    ) AS sub 
    FROM task_live_master t 
    JOIN milestone_live_master  ml ON ml.m_id   = t.m_id 
    JOIN project_live_master    p  ON p.prj_id  = ml.prj_id 
    LEFT JOIN company_master    cm ON cm.coy_id = p.coy_id 
    LEFT JOIN plant_master      pm ON pm.plt_id = p.plt_id 
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts 
    LEFT JOIN project_access pa ON pa.prj_id = p.prj_id AND pa.emp_id = p_emp_id AND pa.sts = true 
    WHERE (t.emp_id = p_emp_id OR t.task_id IN ( 
      SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.task_id IS NOT NULL 
    )) AND p.prj_sts IN ('LIVE', 'CLOSED', 'HOLD') 
    GROUP BY p.prj_id, p.prj_nm, p.prj_cd, p.logo, cm.coy_nm, pm.plt_nm, cm.ct_vlg, p.prj_sts, pa.access_type, p.end_dt 
    ORDER BY p.prj_nm 
  ) x; 

  /* 8. Trend and Weekly Change Calculations */ 
  DECLARE 
    trend_rec RECORD; 
  BEGIN 
    WITH days AS ( 
      SELECT (v_today - i * INTERVAL '1 day')::DATE AS d 
      FROM generate_series(6, 0, -1) AS i 
    ), 
    trend_data AS ( 
      SELECT 
        d, 
        (SELECT COUNT(*) FROM temp_all_tasks WHERE st_dt <= d) AS assigned_count, 
        (SELECT COUNT(*) FROM temp_all_tasks WHERE st_dt <= d AND UPPER(status_nm) = 'OPEN' AND (act_cmp_dt IS NULL OR act_cmp_dt > d)) AS open_count, 
        (SELECT COUNT(*) FROM temp_all_tasks WHERE st_dt <= d AND (UPPER(status_nm) = 'WIP' OR UPPER(status_nm) = 'IN PROGRESS') AND (act_cmp_dt IS NULL OR act_cmp_dt > d)) AS wip_count, 
        (SELECT COUNT(*) FROM temp_all_tasks WHERE end_dt < d AND (act_cmp_dt IS NULL OR act_cmp_dt > d)) AS overdue_count, 
        (SELECT COUNT(*) FROM temp_all_tasks WHERE act_cmp_dt <= d) AS completed_count, 
        (SELECT COUNT(DISTINCT m.prj_id) 
         FROM task_live_master t_tr 
         JOIN milestone_live_master m ON m.m_id = t_tr.m_id 
         JOIN project_live_master p_tr ON p_tr.prj_id = m.prj_id 
         WHERE (t_tr.emp_id = p_emp_id OR t_tr.task_id IN ( 
           SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.task_id IS NOT NULL 
         )) AND p_tr.prj_sts = 'LIVE' AND p_tr.st_dt <= d) AS projects_count 
      FROM days 
      ORDER BY d 
    ) 
    SELECT 
      jsonb_object_agg(metric, jsonb_build_object( 
        'trend', trend_array, 
        'weeklyChange', GREATEST(0, current_val - seven_days_ago_val) 
      )) 
    INTO v_metrics_trends 
    FROM ( 
      SELECT 
        'assignedTasks' AS metric, 
        (SELECT jsonb_agg(assigned_count) FROM trend_data) AS trend_array, 
        (SELECT assigned_count FROM trend_data WHERE d = v_today) AS current_val, 
        COALESCE((SELECT assigned_count FROM trend_data LIMIT 1), 0) AS seven_days_ago_val 
      UNION ALL 
      SELECT 
        'openTasks' AS metric, 
        (SELECT jsonb_agg(open_count) FROM trend_data) AS trend_array, 
        (SELECT open_count FROM trend_data WHERE d = v_today) AS current_val, 
        COALESCE((SELECT open_count FROM trend_data LIMIT 1), 0) AS seven_days_ago_val 
      UNION ALL 
      SELECT 
        'inProgress' AS metric, 
        (SELECT jsonb_agg(wip_count) FROM trend_data) AS trend_array, 
        (SELECT wip_count FROM trend_data WHERE d = v_today) AS current_val, 
        COALESCE((SELECT wip_count FROM trend_data LIMIT 1), 0) AS seven_days_ago_val 
      UNION ALL 
      SELECT 
        'overdueTasks' AS metric, 
        (SELECT jsonb_agg(overdue_count) FROM trend_data) AS trend_array, 
        (SELECT overdue_count FROM trend_data WHERE d = v_today) AS current_val, 
        COALESCE((SELECT overdue_count FROM trend_data LIMIT 1), 0) AS seven_days_ago_val 
      UNION ALL 
      SELECT 
        'closedTasks' AS metric, 
        (SELECT jsonb_agg(completed_count) FROM trend_data) AS trend_array, 
        (SELECT completed_count FROM trend_data WHERE d = v_today) AS current_val, 
        COALESCE((SELECT completed_count FROM trend_data LIMIT 1), 0) AS seven_days_ago_val 
      UNION ALL 
      SELECT 
        'completedTasks' AS metric, 
        (SELECT jsonb_agg(completed_count) FROM trend_data) AS trend_array, 
        (SELECT completed_count FROM trend_data WHERE d = v_today) AS current_val, 
        COALESCE((SELECT completed_count FROM trend_data LIMIT 1), 0) AS seven_days_ago_val 
      UNION ALL 
      SELECT 
        'myProjects' AS metric, 
        (SELECT jsonb_agg(projects_count) FROM trend_data) AS trend_array, 
        (SELECT projects_count FROM trend_data WHERE d = v_today) AS current_val, 
        COALESCE((SELECT projects_count FROM trend_data LIMIT 1), 0) AS seven_days_ago_val 
    ) x; 
  END; 

  /* 9. Recent Activity List */ 
  SELECT jsonb_agg(sub) INTO v_recent_activity 
  FROM ( 
    SELECT jsonb_build_object( 
      'logId',      al.log_id, 
      'entityTyp',  al.entity_typ, 
      'entityId',   al.entity_id, 
      'statusFrom', al.status_from, 
      'statusTo',   al.status_to, 
      'logDt',      al.log_dt, 
      'message',    CASE 
                      WHEN al.entity_typ = 'TASK' THEN 
                        'Task "' || COALESCE(t.task_nm, 'Unknown Task') || '" updated from ' || al.status_from || ' to ' || al.status_to 
                      WHEN al.entity_typ = 'MILESTONE' THEN 
                        'Milestone "' || COALESCE(m.mlstn_ttl, 'Unknown Milestone') || '" updated from ' || al.status_from || ' to ' || al.status_to 
                      WHEN al.entity_typ = 'PROJECT' THEN 
                        'Project "' || COALESCE(p.prj_nm, 'Unknown Project') || '" updated from ' || al.status_from || ' to ' || al.status_to 
                      ELSE 'Activity log updated' 
                    END, 
      'projectName', COALESCE(p.prj_nm, p_ind.prj_nm, 'Internal') 
    ) AS sub 
    FROM activity_log_transaction al 
    LEFT JOIN task_live_master t ON al.entity_typ = 'TASK' AND t.task_id = al.entity_id 
    LEFT JOIN milestone_live_master m ON 
      (al.entity_typ = 'MILESTONE' AND m.m_id = al.entity_id) OR 
      (al.entity_typ = 'TASK' AND m.m_id = t.m_id) 
    LEFT JOIN project_live_master p ON 
      (al.entity_typ = 'PROJECT' AND p.prj_id = al.entity_id) OR 
      (m.prj_id = p.prj_id) 
    LEFT JOIN employee_individual_task_master ind ON al.entity_typ = 'TASK' AND ind.emp_task_id = al.entity_id 
    LEFT JOIN (SELECT DISTINCT prj_cd, prj_nm FROM project_live_master) p_ind ON p_ind.prj_cd = ind.task_asgn_to 
    WHERE 
      (al.entity_typ = 'TASK' AND (t.emp_id = p_emp_id OR ind.emp_id = p_emp_id OR t.task_id IN ( 
         SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.task_id IS NOT NULL 
      ) OR ind.emp_task_id IN ( 
         SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.emp_task_id IS NOT NULL 
      ))) 
      OR (p.prj_id IN ( 
         SELECT DISTINCT ml_sub.prj_id 
         FROM task_live_master t_sub 
         JOIN milestone_live_master ml_sub ON ml_sub.m_id = t_sub.m_id 
         WHERE t_sub.emp_id = p_emp_id OR t_sub.task_id IN ( 
           SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.task_id IS NOT NULL 
         ) 
      )) 
    ORDER BY al.log_dt DESC 
    LIMIT 5 
  ) x; 

  SELECT COALESCE( 
    ROUND( 
      (COUNT(*) FILTER (WHERE UPPER(status_nm) IN ('CLOSED', 'COMPLETED') AND (act_cmp_dt IS NULL OR act_cmp_dt <= end_dt))::NUMERIC / 
       NULLIF(COUNT(*) FILTER (WHERE UPPER(status_nm) IN ('CLOSED', 'COMPLETED')), 0)) * 100, 
      0 
    )::INT, 
    100 
  ) INTO v_productivity 
  FROM temp_all_tasks; 

  v_quality := GREATEST(50, 100 - ((v_reassigned + v_rework) * 5)); 

  v_performance := jsonb_build_object( 
    'productivity', jsonb_build_object( 
      'score', v_productivity, 
      'rating', CASE 
                  WHEN v_productivity >= 90 THEN 'Excellent' 
                  WHEN v_productivity >= 75 THEN 'Good' 
                  WHEN v_productivity >= 50 THEN 'Satisfactory' 
                  ELSE 'Needs Improvement' 
                END 
    ), 
    'taskCompletion', jsonb_build_object( 
      'score', CASE WHEN v_total_tasks > 0 THEN ROUND((v_completed::NUMERIC/v_total_tasks)*100,0)::INT ELSE 100 END, 
      'rating', CASE 
                  WHEN (CASE WHEN v_total_tasks > 0 THEN (v_completed::NUMERIC/v_total_tasks)*100 ELSE 100 END) >= 90 THEN 'Excellent' 
                  WHEN (CASE WHEN v_total_tasks > 0 THEN (v_completed::NUMERIC/v_total_tasks)*100 ELSE 100 END) >= 75 THEN 'Good' 
                  WHEN (CASE WHEN v_total_tasks > 0 THEN (v_completed::NUMERIC/v_total_tasks)*100 ELSE 100 END) >= 50 THEN 'Satisfactory' 
                  ELSE 'Needs Improvement' 
                END 
    ), 
    'qualityScore', jsonb_build_object( 
      'score', v_quality, 
      'rating', CASE 
                  WHEN v_quality >= 90 THEN 'Excellent' 
                  WHEN v_quality >= 75 THEN 'Good' 
                  WHEN v_quality >= 50 THEN 'Satisfactory' 
                  ELSE 'Needs Improvement' 
                END 
    ) 
  ); 

  /* 7. Combined response return */ 
  RETURN jsonb_build_object( 
    'profile', jsonb_build_object( 
      'empId', p_emp_id, 'fullName', v_full_name, 
      'role', COALESCE(v_emp.desig_nm, 'Site Engineer'), 
      'department', COALESCE(v_emp.dept_nm, 'Projects Department'), 
      'photoUrl', v_emp.photo_url), 
    'summary', jsonb_build_object( 
      'totalTasks', v_total_tasks,
      'myTasksCount', (v_total_tasks - v_completed - v_overdue), 
      'closedTasksCount', v_completed,
      'closedCount', v_completed,
      'overdueTasksCount', v_overdue, 
      'dueTodayCount', v_due_today, 
      'myProjectsCount', v_my_prj_count, 
      'overallCompletion', CASE WHEN v_total_tasks > 0 
        THEN ROUND((v_completed::NUMERIC/v_total_tasks)*100,2) ELSE 0 END), 
    'taskStatusCounts', jsonb_build_object( 
      'Closed', v_completed, 'In Progress', v_wip, 
      'Under Review', v_under_review, 'Overdue', v_overdue, 
      'Open', v_open, 'Reassigned', v_reassigned, 
      'Rework', v_rework, 'Draft', v_draft), 
    'todoList',      COALESCE(v_todo_list, '[]'::jsonb), 
    'upcomingTasks', COALESCE(v_upcoming, '[]'::jsonb), 
    'myProjects',    COALESCE(v_my_projects, '[]'::jsonb), 
    'metricsTrends', COALESCE(v_metrics_trends, '{}'::jsonb), 
    'recentActivity', COALESCE(v_recent_activity, '[]'::jsonb), 
    'performance',   v_performance 
  ); 
END; 
$function$;
`;

const sqlGetMyTasksData = `
CREATE OR REPLACE FUNCTION public.get_my_tasks_data(p_emp_id bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE 
  v_today          DATE := CURRENT_DATE; 
  v_tasks          jsonb; 
BEGIN 
  WITH combined_tasks AS ( 
    SELECT 
      t.task_id AS task_id, 
      t.task_cd AS task_cd, 
      t.task_nm AS task_nm, 
      t.task_desc AS task_desc, 
      t.task_asgn_to AS task_asgn_to, 
      t.emp_id AS emp_id, 
      t.ext_emp_id AS ext_emp_id, 
      t.task_dep_flg AS task_dep_flg, 
      t.task_dep_typ AS task_dep_typ, 
      t.dep_task_id AS dep_task_id, 
      t.no_of_days AS no_of_days, 
      t.wrk_days AS wrk_days, 
      t.chk_flg AS chk_flg, 
      t.atta_flg AS atta_flg, 
      t.atta_file_id AS atta_file_id, 
      t.note_txt AS note_txt, 
      t.st_dt AS st_dt, 
      t.end_dt AS end_dt, 
      COALESCE(t.act_cmp_dt, CASE WHEN UPPER(tsm.status_nm) IN ('CLOSED', 'COMPLETED') THEN t.end_dt ELSE NULL END) AS act_cmp_dt, 
      t.prcs_flg AS prcs_flg, 
      t.prcs_yes_actn AS prcs_yes_actn, 
      tsm.status_nm AS status_nm, 
      t.sub_status AS sub_status, 
      pm.priority_nm AS priority_nm, 
      t.addl_rem AS addl_rem, 
      false AS is_individual, 
      p.prj_nm AS project_name, 
      m.mlstn_ttl AS milestone_title, 
      pc_rev.emp_id AS reviewer_id, 
      TRIM(COALESCE(e_rev.fst_nm,'')||' '||COALESCE(e_rev.lst_nm,'')) AS reviewer_name, 
      pc_app.emp_id AS approver_id, 
      TRIM(COALESCE(e_app.fst_nm,'')||' '||COALESCE(e_app.lst_nm,'')) AS approver_name, 
      chk.total AS chk_total, 
      chk.completed AS chk_completed 
    FROM task_live_master t 
    LEFT JOIN milestone_live_master m ON m.m_id = t.m_id 
    LEFT JOIN project_live_master p ON p.prj_id = m.prj_id 
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts 
    LEFT JOIN task_priority_master pm ON pm.priority_id = t.priority 
    LEFT JOIN process_config pc_rev ON pc_rev.task_id = t.task_id AND pc_rev.ordr_id = 1 
    LEFT JOIN employee_master e_rev ON e_rev.emp_id = pc_rev.emp_id 
    LEFT JOIN process_config pc_app ON pc_app.task_id = t.task_id AND pc_app.ordr_id = 2 
    LEFT JOIN employee_master e_app ON e_app.emp_id = pc_app.emp_id 
    LEFT JOIN LATERAL ( 
      SELECT 
        COALESCE(SUM(1 + LENGTH(chk_nm) - LENGTH(REPLACE(chk_nm, ',', ''))), 0) AS total, 
        COALESCE(SUM(CASE WHEN chk_sts = true THEN 1 + LENGTH(chk_nm) - LENGTH(REPLACE(chk_nm, ',', '')) ELSE 0 END), 0) AS completed 
      FROM checklist_master 
      WHERE task_id = t.task_id AND sts = true 
    ) chk ON true 
    WHERE (t.emp_id = p_emp_id OR pc_rev.emp_id = p_emp_id OR pc_app.emp_id = p_emp_id OR t.task_id IN (SELECT tm.task_id FROM team_members tm WHERE tm.emp_id = p_emp_id AND tm.task_id IS NOT NULL)) 

    UNION ALL 

    SELECT 
      t.emp_task_id AS task_id, 
      t.task_cd AS task_cd, 
      t.task_nm AS task_nm, 
      t.task_desc AS task_desc, 
      t.task_asgn_to AS task_asgn_to, 
      t.emp_id AS emp_id, 
      NULL::bigint AS ext_emp_id, 
      false AS task_dep_flg, 
      NULL::varchar AS task_dep_typ, 
      NULL::bigint AS dep_task_id, 
      (t.end_dt - t.st_dt) AS no_of_days, 
      NULL::integer AS wrk_days, 
      t.chk_flg AS chk_flg, 
      t.atta_flg AS atta_flg, 
      NULL::integer AS atta_file_id, 
      NULL::varchar AS note_txt, 
      t.st_dt AS st_dt, 
      t.end_dt AS end_dt, 
      CASE WHEN UPPER(tsm.status_nm) IN ('CLOSED', 'COMPLETED') THEN t.end_dt ELSE NULL END AS act_cmp_dt, 
      t.prcs_flg AS prcs_flg, 
      t.prcs_yes_actn AS prcs_yes_actn, 
      tsm.status_nm AS status_nm, 
      t.sub_status AS sub_status, 
      pm.priority_nm AS priority_nm, 
      t.remarks AS addl_rem, 
      true AS is_individual, 
      'Individual Task' AS project_name, 
      '-' AS milestone_title, 
      pc_rev.emp_id AS reviewer_id, 
      TRIM(COALESCE(e_rev.fst_nm,'')||' '||COALESCE(e_rev.lst_nm,'')) AS reviewer_name, 
      pc_app.emp_id AS approver_id, 
      TRIM(COALESCE(e_app.fst_nm,'')||' '||COALESCE(e_app.lst_nm,'')) AS approver_name, 
      chk.total AS chk_total, 
      chk.completed AS chk_completed 
    FROM employee_individual_task_master t 
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts 
    LEFT JOIN task_priority_master pm ON pm.priority_id = t.priority 
    LEFT JOIN process_config pc_rev ON pc_rev.emp_task_id = t.emp_task_id AND pc_rev.ordr_id = 1 
    LEFT JOIN employee_master e_rev ON e_rev.emp_id = pc_rev.emp_id 
    LEFT JOIN process_config pc_app ON pc_app.emp_task_id = t.emp_task_id AND pc_app.ordr_id = 2 
    LEFT JOIN employee_master e_app ON e_app.emp_id = pc_app.emp_id 
    LEFT JOIN LATERAL ( 
      SELECT 
        COALESCE(SUM(1 + LENGTH(chk_nm) - LENGTH(REPLACE(chk_nm, ',', ''))), 0) AS total, 
        COALESCE(SUM(CASE WHEN chk_sts = true THEN 1 + LENGTH(chk_nm) - LENGTH(REPLACE(chk_nm, ',', '')) ELSE 0 END), 0) AS completed 
      FROM checklist_master 
      WHERE emp_task_id = t.emp_task_id AND sts = true 
    ) chk ON true 
    WHERE COALESCE(t.sts, true) = true AND (t.emp_id = p_emp_id OR pc_rev.emp_id = p_emp_id OR pc_app.emp_id = p_emp_id OR t.emp_task_id IN (SELECT tm.emp_task_id FROM team_members tm WHERE tm.emp_id = p_emp_id AND tm.emp_task_id IS NOT NULL)) 
  ), 
  calculated_tasks AS ( 
    SELECT 
      t.*, 
      CASE 
        WHEN t.priority_nm IS NOT NULL THEN 
          CASE 
            WHEN UPPER(t.priority_nm) = 'LOW' THEN 'Low' 
            WHEN UPPER(t.priority_nm) = 'NORMAL' THEN 'Normal' 
            WHEN UPPER(t.priority_nm) = 'MEDIUM' THEN 'Medium' 
            WHEN UPPER(t.priority_nm) = 'HIGH' THEN 'High' 
            WHEN UPPER(t.priority_nm) IN ('CRITICAL', 'ATMOST CRITICAL') THEN 'Critical' 
            ELSE t.priority_nm 
          END 
        WHEN t.end_dt IS NOT NULL THEN 
          CASE 
            WHEN ( 
              COALESCE( 
                CASE WHEN UPPER(t.status_nm) IN ('CLOSED', 'COMPLETED', 'UNDER_REVIEW', 'SUBMIT_REVIEW') 
                     THEN COALESCE(t.act_cmp_dt, v_today) 
                     ELSE v_today 
                END, v_today) - t.end_dt 
            ) = 0 THEN 'High' 
            WHEN ( 
              COALESCE( 
                CASE WHEN UPPER(t.status_nm) IN ('CLOSED', 'COMPLETED', 'UNDER_REVIEW', 'SUBMIT_REVIEW') 
                     THEN COALESCE(t.act_cmp_dt, v_today) 
                     ELSE v_today 
                END, v_today) - t.end_dt 
            ) = 1 THEN 'Critical' 
            WHEN ( 
              COALESCE( 
                CASE WHEN UPPER(t.status_nm) IN ('CLOSED', 'COMPLETED', 'UNDER_REVIEW', 'SUBMIT_REVIEW') 
                     THEN COALESCE(t.act_cmp_dt, v_today) 
                     ELSE v_today 
                END, v_today) - t.end_dt 
            ) >= 2 THEN 'Critical' 
            ELSE 'Low' 
          END 
        ELSE 'Medium' 
      END AS final_priority, 
      CASE 
        WHEN UPPER(t.status_nm) IN ('CLOSED', 'COMPLETED') THEN 'Closed' 
        WHEN UPPER(t.status_nm) = 'HOLD' THEN 'Hold' 
        WHEN UPPER(t.status_nm) = 'DRAFT' THEN 'Draft' 
        WHEN UPPER(t.status_nm) IN ('WIP', 'IN_PROGRESS', 'UNDER_REVIEW', 'SUBMIT_REVIEW') THEN 'In Progress' 
        ELSE 'Open' 
      END AS progress_sts, 
      CASE 
        WHEN t.sub_status = 'Under Review' OR UPPER(t.status_nm) IN ('UNDER_REVIEW', 'SUBMIT_REVIEW') THEN 'Under Review' 
        WHEN t.sub_status = 'Rework' OR UPPER(t.status_nm) = 'REWORK' THEN 'Rework' 
        WHEN t.sub_status = 'Reassign' OR UPPER(t.status_nm) = 'REASSIGN' THEN 'Reassign' 
        ELSE 'None' 
      END AS process_sts, 
      CASE 
        WHEN UPPER(t.status_nm) IN ('CLOSED', 'COMPLETED') THEN 
          CASE 
            WHEN t.end_dt IS NOT NULL THEN 
              CASE 
                WHEN COALESCE(t.act_cmp_dt, v_today) < t.end_dt THEN 'Lead' 
                WHEN COALESCE(t.act_cmp_dt, v_today) = t.end_dt THEN 'On Time' 
                ELSE 'Lag' 
              END 
            ELSE 'On Time' 
          END 
        ELSE 
          CASE 
            WHEN t.end_dt IS NOT NULL THEN 
              CASE 
                WHEN v_today < t.end_dt THEN 'On Time' 
                WHEN v_today = t.end_dt THEN 'Due Today' 
                ELSE 'Overdue' 
              END 
            ELSE 'On Time' 
          END 
      END AS time_sts 
    FROM combined_tasks t 
  ), 
  final_tasks AS ( 
    SELECT 
      t.*, 
      CASE 
        WHEN NOT COALESCE(t.prcs_flg, false) THEN 
          CASE 
            WHEN UPPER(t.status_nm) IN ('CLOSED', 'COMPLETED') THEN 100 
            WHEN t.chk_total > 0 THEN ROUND((t.chk_completed::numeric / t.chk_total) * 100)::integer 
            ELSE 0 
          END 
        ELSE 
          CASE 
            WHEN UPPER(t.status_nm) IN ('CLOSED', 'COMPLETED') THEN 100 
            WHEN UPPER(t.status_nm) = 'UNDER_REVIEW' THEN 95 
            WHEN UPPER(t.status_nm) = 'SUBMIT_REVIEW' THEN 90 
            WHEN t.chk_total > 0 THEN ROUND((t.chk_completed::numeric / t.chk_total) * 100)::integer 
            ELSE 0 
          END 
      END AS progress_pct 
    FROM calculated_tasks t 
  ) 
  SELECT COALESCE(jsonb_agg( 
    jsonb_build_object( 
      'id', COALESCE(t.task_cd, CASE WHEN t.is_individual THEN 'IND-' || t.task_id ELSE 'TSK-' || t.task_id END), 
      'taskId', t.task_id, 
      'isIndividual', t.is_individual, 
      'title', t.task_nm, 
      'project', COALESCE(t.project_name, 'Unknown Project'), 
      'milestone', COALESCE(t.milestone_title, 'Unknown Milestone'), 
      'priority', t.final_priority, 
      'dueDate', COALESCE(t.end_dt::text, ''), 
      'status', t.progress_sts, 
      'progressSts', t.progress_sts, 
      'processSts', t.process_sts, 
      'timeSts', t.time_sts, 
      'progress', t.progress_pct, 
      'rawStatus', t.status_nm, 
      'description', COALESCE(t.task_desc, ''), 
      'assignedBy', CASE WHEN t.is_individual THEN 'Task Manager' ELSE 'Project Manager' END, 
      'rawTask', jsonb_build_object( 
        'taskId', t.task_id, 
        'mId', CASE WHEN t.is_individual THEN NULL ELSE t.task_id END, 
        'taskCd', t.task_cd, 
        'taskNm', t.task_nm, 
        'taskDesc', t.task_desc, 
        'empId', t.emp_id, 
        'extEmpId', t.ext_emp_id, 
        'taskDepFlg', t.task_dep_flg, 
        'taskDepTyp', t.task_dep_typ, 
        'depTaskId', t.dep_task_id, 
        'noOfDays', t.no_of_days, 
        'wrkDays', t.wrk_days, 
        'chkFlg', t.chk_flg, 
        'attaFlg', t.atta_flg, 
        'attaFileId', t.atta_file_id, 
        'noteTxt', t.note_txt, 
        'stDt', COALESCE(t.st_dt::text, ''), 
        'endDt', COALESCE(t.end_dt::text, ''), 
        'actCmpDt', COALESCE(t.act_cmp_dt::text, ''), 
        'prcsFlg', t.prcs_flg, 
        'prcsYesActn', t.prcs_yes_actn, 
        'taskSts', t.status_nm, 
        'subStatus', t.sub_status, 
        'priority', t.priority_nm, 
        'addlRem', t.addl_rem, 
        'reviewerId', t.reviewer_id, 
        'approverId', t.approver_id, 
        'reviewerNm', t.reviewer_name, 
        'approverNm', t.approver_name 
      ) 
    ) 
  ), '[]'::jsonb) INTO v_tasks 
  FROM final_tasks t; 

  RETURN v_tasks; 
END; $function$;
`;

const sqlGetUserMyTasks = `
CREATE OR REPLACE FUNCTION public.get_user_my_tasks(p_emp_id bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE 
  v_today          DATE := CURRENT_DATE; 
  v_emp_email      TEXT; 
  v_is_admin       BOOLEAN := false; 
  v_tasks          jsonb; 
  v_employees      jsonb; 
BEGIN 
  SELECT email INTO v_emp_email FROM employee_master WHERE emp_id = p_emp_id; 
  IF v_emp_email = 'vsv.vempati@gmail.com' THEN 
    v_is_admin := true; 
  END IF; 

  DROP TABLE IF EXISTS temp_my_tasks_raw; 
  CREATE TEMPORARY TABLE temp_my_tasks_raw ON COMMIT DROP AS 
  ( 
    SELECT 
      t.task_id, 
      t.task_cd, 
      t.task_nm, 
      t.task_desc, 
      t.task_asgn_to, 
      t.emp_id, 
      t.ext_emp_id, 
      t.task_dep_flg, 
      t.task_dep_typ, 
      t.dep_task_id, 
      t.no_of_days, 
      t.wrk_days, 
      t.chk_flg, 
      t.atta_flg, 
      t.atta_file_id, 
      t.note_txt, 
      t.st_dt, 
      t.end_dt, 
      COALESCE(t.act_cmp_dt, CASE WHEN UPPER(tsm.status_nm) IN ('CLOSED', 'COMPLETED') THEN t.end_dt ELSE NULL END) AS act_cmp_dt, 
      t.prcs_flg, 
      t.prcs_yes_actn, 
      tsm.status_nm AS task_sts, 
      pm.priority_nm AS priority, 
      t.addl_rem, 
      t.m_id, 
      false AS is_individual, 
      COALESCE( 
        (SELECT pc.emp_id FROM process_config pc WHERE pc.task_id = t.task_id AND pc.ordr_id = 1 LIMIT 1), 
        NULL 
      ) AS reviewer_id, 
      COALESCE( 
        (SELECT pc.emp_id FROM process_config pc WHERE pc.task_id = t.task_id AND pc.ordr_id = 2 LIMIT 1), 
        NULL 
      ) AS approver_id, 
      COALESCE( 
        (SELECT COUNT(*) FROM checklist_master chk WHERE chk.task_id = t.task_id AND chk.is_live = true AND chk.sts = true), 
        0 
      ) AS chk_total, 
      COALESCE( 
        (SELECT COUNT(*) FROM checklist_master chk WHERE chk.task_id = t.task_id AND chk.is_live = true AND chk.sts = true AND chk.chk_sts = true), 
        0 
      ) AS chk_completed 
    FROM task_live_master t 
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts 
    LEFT JOIN task_priority_master pm ON pm.priority_id = t.priority 
    WHERE (t.emp_id = p_emp_id OR t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.task_id IS NOT NULL))

    UNION ALL 

    SELECT 
      t.emp_task_id AS task_id, 
      t.task_cd, 
      t.task_nm, 
      t.task_desc, 
      t.task_asgn_to, 
      t.emp_id, 
      NULL AS ext_emp_id, 
      NULL AS task_dep_flg, 
      NULL AS task_dep_typ, 
      NULL AS dep_task_id, 
      NULL AS no_of_days, 
      NULL AS wrk_days, 
      t.chk_flg, 
      t.atta_flg, 
      NULL AS atta_file_id, 
      NULL AS note_txt, 
      t.st_dt, 
      t.end_dt, 
      CASE WHEN UPPER(tsm.status_nm) IN ('CLOSED', 'COMPLETED') THEN t.end_dt ELSE NULL END AS act_cmp_dt, 
      t.prcs_flg, 
      t.prcs_yes_actn, 
      tsm.status_nm AS task_sts, 
      pm.priority_nm AS priority, 
      t.remarks AS addl_rem, 
      NULL AS m_id, 
      true AS is_individual, 
      COALESCE( 
        (SELECT pc.emp_id FROM process_config pc WHERE pc.emp_task_id = t.emp_task_id AND pc.ordr_id = 1 LIMIT 1), 
        NULL 
      ) AS reviewer_id, 
      COALESCE( 
        (SELECT pc.emp_id FROM process_config pc WHERE pc.emp_task_id = t.emp_task_id AND pc.ordr_id = 2 LIMIT 1), 
        NULL 
      ) AS approver_id, 
      COALESCE( 
        (SELECT COUNT(*) FROM checklist_master chk WHERE chk.emp_task_id = t.emp_task_id AND chk.sts = true), 
        0 
      ) AS chk_total, 
      COALESCE( 
        (SELECT COUNT(*) FROM checklist_master chk WHERE chk.emp_task_id = t.emp_task_id AND chk.sts = true AND chk.chk_sts = true), 
        0 
      ) AS chk_completed 
    FROM employee_individual_task_master t 
    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts 
    LEFT JOIN task_priority_master pm ON pm.priority_id = t.priority 
    WHERE COALESCE(t.sts, true) = true AND (t.emp_id = p_emp_id OR t.emp_task_id IN (SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.emp_task_id IS NOT NULL))
  ); 

  SELECT jsonb_agg(sub) INTO v_tasks 
  FROM ( 
    SELECT 
      t.task_id AS "taskId", 
      t.task_cd AS "taskCd", 
      t.task_nm AS "taskNm", 
      t.task_desc AS "taskDesc", 
      t.task_asgn_to AS "taskAsgnTo", 
      t.emp_id AS "empId", 
      t.ext_emp_id AS "extEmpId", 
      t.task_dep_flg AS "taskDepFlg", 
      t.task_dep_typ AS "taskDepTyp", 
      t.dep_task_id AS "depTaskId", 
      t.no_of_days AS "noOfDays", 
      t.wrk_days AS "wrkDays", 
      t.chk_flg AS "chkFlg", 
      t.atta_flg AS "attaFlg", 
      t.atta_file_id AS "attaFileId", 
      t.note_txt AS "noteTxt", 
      t.st_dt AS "stDt", 
      t.end_dt AS "endDt", 
      t.act_cmp_dt AS "actCmpDt", 
      t.prcs_flg AS "prcsFlg", 
      t.prcs_yes_actn AS "prcsYesActn", 
      t.task_sts AS "taskSts", 
      t.priority AS "priority", 
      t.addl_rem AS "addlRem", 
      t.m_id AS "mId", 
      t.is_individual AS "isIndividual", 
      t.reviewer_id AS "reviewerId", 
      t.approver_id AS "approverId", 
      CASE 
        WHEN UPPER(t.task_sts) IN ('CLOSED', 'COMPLETED') THEN 100 
        WHEN t.prcs_flg = true AND UPPER(t.task_sts) = 'UNDER_REVIEW' THEN 95 
        WHEN t.prcs_flg = true AND UPPER(t.task_sts) = 'SUBMIT_REVIEW' THEN 90 
        WHEN t.chk_total > 0 THEN ROUND((t.chk_completed::NUMERIC / t.chk_total) * 100)::INT 
        ELSE 0 
      END AS "progress", 
      CASE 
        WHEN t.is_individual THEN 'Individual Task' 
        ELSE COALESCE(p.prj_nm, 'Unknown Project') 
      END AS "projectName", 
      CASE 
        WHEN t.is_individual THEN 'Internal' 
        ELSE COALESCE(p.prj_cd, '') 
      END AS "projectCode", 
      CASE 
        WHEN t.is_individual THEN '-' 
        ELSE COALESCE(m.mlstn_ttl, 'Unknown Milestone') 
      END AS "milestoneTitle" 
    FROM temp_my_tasks_raw t 
    LEFT JOIN milestone_live_master m ON m.m_id = t.m_id 
    LEFT JOIN project_live_master p ON p.prj_id = m.prj_id 
    WHERE v_is_admin = true 
       OR t.emp_id = p_emp_id 
       OR t.reviewer_id = p_emp_id 
       OR t.approver_id = p_emp_id 
  ) sub; 

  SELECT jsonb_agg(sub_emp) INTO v_employees 
  FROM ( 
    SELECT 
      emp_id AS "empId", 
      email AS "email", 
      TRIM(COALESCE(fst_nm,'')||' '||COALESCE(lst_nm,'')) AS "employeeName", 
      photo_url AS "photoUrl" 
    FROM employee_master 
    WHERE sts = true 
  ) sub_emp; 

  RETURN jsonb_build_object( 
    'tasks', COALESCE(v_tasks, '[]'::jsonb), 
    'employees', COALESCE(v_employees, '[]'::jsonb) 
  ); 
END; $function$;
`;

async function main() {
  await dbClient.connect();
  console.log("Updating get_user_dashboard with all reviewer/approver roles...");
  await dbClient.query(sqlGetUserDashboard);
  console.log("Updating get_my_tasks_data with all reviewer/approver roles...");
  await dbClient.query(sqlGetMyTasksData);
  console.log("Updating get_user_my_tasks with all reviewer/approver roles...");
  await dbClient.query(sqlGetUserMyTasks);
  console.log("Successfully deployed updated stored procedures!");

  const resDash = await dbClient.query('SELECT get_user_dashboard(5) as data');
  console.log("\n=== UPDATED GET_USER_DASHBOARD(5) SUMMARY ===");
  console.log(resDash.rows[0].data.summary);
  console.log(resDash.rows[0].data.taskStatusCounts);

  const resMyTasks = await dbClient.query('SELECT get_my_tasks_data(5) as data');
  const tasks = resMyTasks.rows[0].data || [];
  const closed = tasks.filter(t => t.status === 'Closed' || t.rawStatus === 'Closed' || t.progress === 100);
  console.log(`\n=== UPDATED GET_MY_TASKS_DATA(5) TOTAL: ${tasks.length}, CLOSED: ${closed.length} ===`);
  console.table(closed.map(t => ({ id: t.id, title: t.title, status: t.status, rawStatus: t.rawStatus, myRole: t.assignedBy })));

  await dbClient.end();
}

main().catch(console.error);
