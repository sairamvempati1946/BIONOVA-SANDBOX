const axios = require('axios');

async function main() {
  try {
    console.log("Logging in...");
    const loginRes = await axios.post("http://localhost:8080/api/auth/login", {
      email: "vkpraveen216@gmail.com",
      password: "Kumar@2311"
    });
    const token = loginRes.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log("\nFetching live projects...");
    const projRes = await axios.get("http://localhost:8080/api/project-live", { headers });
    projRes.data.forEach(p => {
      console.log(`- Project: ${p.prjNm} (ID: ${p.prjId})`);
      console.log(`  progress field: ${p.progress}`);
      console.log(`  leadLagSts: ${p.leadLagSts}`);
      console.log(`  raw keys:`, Object.keys(p));
    });
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

main();
