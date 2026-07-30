const { Client } = require('pg');
const axios = require('axios');

const dbClient = new Client({
  connectionString: "postgres://postgres.daaoeapbouspxcuprsqx:Atirath%402026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepareThreshold=0"
});

async function main() {
  await dbClient.connect();

  console.log("Logging in...");
  const loginRes = await axios.post("http://localhost:8080/api/auth/login", {
    email: "vkpraveen216@gmail.com",
    password: "Kumar@2311"
  });
  const token = loginRes.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  console.log("\nSetting task 17 to Completed (status_id = 4)...");
  await dbClient.query("UPDATE task_live_master SET task_sts = 4, sub_status = NULL, act_cmp_dt = NOW() WHERE task_id = 17");

  // Fetch project-live progress after completion
  const projResAfter = await axios.get("http://localhost:8080/api/project-live/12", { headers });
  console.log(`Backend-enriched Project Progress after task completion: ${projResAfter.data.progress}%`);

  await dbClient.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
