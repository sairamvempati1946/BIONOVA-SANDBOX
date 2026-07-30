const fs = require('fs');
const file = 'd:/sample/bionova-backend/src/main/java/com/bionova/config/DatabaseMigrator.java';
let content = fs.readFileSync(file, 'utf8');

// Find start and end of the corrupted all_todo CTE section
// Start: the beginning of "WITH all_todo AS" in todo list section
// End: "SELECT jsonb_agg(sub) INTO v_todo_list"

// Use indexOf with unique surrounding context
const CTEstart = content.indexOf('WITH all_todo AS ( " +\n                    "    SELECT " +\n                    "      t.task_id,');
const CTEend = content.indexOf('SELECT jsonb_agg(sub) INTO v_todo_list');

console.log('CTEstart:', CTEstart);
console.log('CTEend:', CTEend);

if (CTEstart === -1 || CTEend === -1) {
  console.log('ERROR: markers not found!');
  process.exit(1);
}

// Build the replacement by reading lines (avoid escaping issues)
// We'll construct line by line using array
const Q = '"'; // double quote shorthand
const P = "'"; // single quote shorthand

const lines = [
  `WITH all_todo AS ( ${Q} +`,
  `                    ${Q}    SELECT ${Q} +`,
  `                    ${Q}      t.task_id, ${Q} +`,
  `                    ${Q}      t.task_nm, ${Q} +`,
  `                    ${Q}      t.st_dt, ${Q} +`,
  `                    ${Q}      t.end_dt, ${Q} +`,
  `                    ${Q}      t.task_sts, ${Q} +`,
  `                    ${Q}      tsm.status_nm, ${Q} +`,
  `                    ${Q}      t.sub_status, ${Q} +`,
  `                    ${Q}      COALESCE(p.prj_cd || ${P} - ${P} || m.mlstn_ttl, ${P}${P}) AS project_info, ${Q} +`,
  `                    ${Q}      CASE ${Q} +`,
  `                    ${Q}        WHEN t.emp_id = p_emp_id THEN ${P}Executor${P} ${Q} +`,
  `                    ${Q}        WHEN t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.is_live = true AND pc.ordr_id = 1) THEN ${P}Reviewer${P} ${Q} +`,
  `                    ${Q}        WHEN t.task_id IN (SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.is_live = true AND pc.ordr_id = 2) THEN ${P}Approver${P} ${Q} +`,
  `                    ${Q}        ELSE ${P}Executor${P} ${Q} +`,
  `                    ${Q}      END AS user_badge, ${Q} +`,
  `                    ${Q}      ${P}PROJECT${P} AS task_source, ${Q} +`,
  `                    ${Q}      pm.priority_nm, ${Q} +`,
  `                    ${Q}      ( ${Q} +`,
  `                    ${Q}        SELECT jsonb_agg(jsonb_build_object( ${Q} +`,
  `                    ${Q}          ${P}empId${P}, em.emp_id, ${Q} +`,
  `                    ${Q}          ${P}fullName${P}, TRIM(COALESCE(em.fst_nm,${P}${P})||${P} ${P}||COALESCE(em.lst_nm,${P}${P})), ${Q} +`,
  `                    ${Q}          ${P}photoUrl${P}, em.photo_url, ${Q} +`,
  `                    ${Q}          ${P}role${P}, CASE WHEN t.emp_id = em.emp_id THEN ${P}Executor${P} ELSE ${P}Reviewer/Approver${P} END ${Q} +`,
  `                    ${Q}        )) ${Q} +`,
  `                    ${Q}        FROM employee_master em ${Q} +`,
  `                    ${Q}        WHERE em.emp_id = t.emp_id ${Q} +`,
  `                    ${Q}           OR em.emp_id IN (SELECT pc.emp_id FROM process_config pc WHERE pc.task_id = t.task_id AND pc.is_live = true) ${Q} +`,
  `                    ${Q}      ) AS employees ${Q} +`,
  `                    ${Q}    FROM task_live_master t ${Q} +`,
  `                    ${Q}    LEFT JOIN milestone_live_master m ON m.m_id = t.m_id ${Q} +`,
  `                    ${Q}    LEFT JOIN project_live_master p ON p.prj_id = m.prj_id ${Q} +`,
  `                    ${Q}    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts ${Q} +`,
  `                    ${Q}    LEFT JOIN task_priority_master pm ON pm.priority_id = t.priority ${Q} +`,
  `                    ${Q}    WHERE (t.emp_id = p_emp_id OR t.task_id IN ( ${Q} +`,
  `                    ${Q}      SELECT pc.task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.is_live = true ${Q} +`,
  `                    ${Q}    )) ${Q} +`,
  `                    ${Q} ${Q} +`,
  `                    ${Q}    UNION ALL ${Q} +`,
  `                    ${Q} ${Q} +`,
  `                    ${Q}    SELECT ${Q} +`,
  `                    ${Q}      t.emp_task_id AS task_id, ${Q} +`,
  `                    ${Q}      t.task_nm, ${Q} +`,
  `                    ${Q}      t.st_dt, ${Q} +`,
  `                    ${Q}      t.end_dt, ${Q} +`,
  `                    ${Q}      t.task_sts, ${Q} +`,
  `                    ${Q}      tsm.status_nm, ${Q} +`,
  `                    ${Q}      t.sub_status, ${Q} +`,
  `                    ${Q}      COALESCE(INITCAP(t.task_asgn_to), ${P}Internal${P}) AS project_info, ${Q} +`,
  `                    ${Q}      CASE ${Q} +`,
  `                    ${Q}        WHEN t.emp_id = p_emp_id THEN ${P}Executor${P} ${Q} +`,
  `                    ${Q}        WHEN t.emp_task_id IN (SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.emp_task_id IS NOT NULL AND pc.ordr_id = 1) THEN ${P}Reviewer${P} ${Q} +`,
  `                    ${Q}        WHEN t.emp_task_id IN (SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.emp_task_id IS NOT NULL AND pc.ordr_id = 2) THEN ${P}Approver${P} ${Q} +`,
  `                    ${Q}        ELSE ${P}Executor${P} ${Q} +`,
  `                    ${Q}      END AS user_badge, ${Q} +`,
  `                    ${Q}      ${P}INDIVIDUAL${P} AS task_source, ${Q} +`,
  `                    ${Q}      pm.priority_nm, ${Q} +`,
  `                    ${Q}      ( ${Q} +`,
  `                    ${Q}        SELECT jsonb_agg(jsonb_build_object( ${Q} +`,
  `                    ${Q}          ${P}empId${P}, em.emp_id, ${Q} +`,
  `                    ${Q}          ${P}fullName${P}, TRIM(COALESCE(em.fst_nm,${P}${P})||${P} ${P}||COALESCE(em.lst_nm,${P}${P})), ${Q} +`,
  `                    ${Q}          ${P}photoUrl${P}, em.photo_url, ${Q} +`,
  `                    ${Q}          ${P}role${P}, CASE WHEN t.emp_id = em.emp_id THEN ${P}Executor${P} ELSE ${P}Reviewer/Approver${P} END ${Q} +`,
  `                    ${Q}        )) ${Q} +`,
  `                    ${Q}        FROM employee_master em ${Q} +`,
  `                    ${Q}        WHERE em.emp_id = t.emp_id ${Q} +`,
  `                    ${Q}           OR em.emp_id IN (SELECT pc.emp_id FROM process_config pc WHERE pc.emp_task_id = t.emp_task_id AND pc.emp_task_id IS NOT NULL) ${Q} +`,
  `                    ${Q}      ) AS employees ${Q} +`,
  `                    ${Q}    FROM employee_individual_task_master t ${Q} +`,
  `                    ${Q}    LEFT JOIN task_status_master tsm ON tsm.status_id = t.task_sts ${Q} +`,
  `                    ${Q}    LEFT JOIN task_priority_master pm ON pm.priority_id = t.priority ${Q} +`,
  `                    ${Q}    WHERE (t.emp_id = p_emp_id OR t.emp_task_id IN ( ${Q} +`,
  `                    ${Q}      SELECT pc.emp_task_id FROM process_config pc WHERE pc.emp_id = p_emp_id AND pc.emp_task_id IS NOT NULL ${Q} +`,
  `                    ${Q}    )) AND COALESCE(t.sts, true) = true ${Q} +`,
  `                    ${Q}  ) ${Q} +`,
  `                    ${Q}  `,
];

const replacement = lines.join('\n');

const before = content.slice(0, CTEstart);
const after = content.slice(CTEend);
const fixed = before + replacement + after;

fs.writeFileSync(file, fixed, 'utf8');
console.log('SUCCESS! File written.');
console.log('Size diff:', fixed.length - content.length);

// Verify
const check = fs.readFileSync(file, 'utf8');
const projCount = (check.match(/'PROJECT' AS task_source/g) || []).length;
const indivCount = (check.match(/'INDIVIDUAL' AS task_source/g) || []).length;
console.log("PROJECT task_source count:", projCount);
console.log("INDIVIDUAL task_source count:", indivCount);
