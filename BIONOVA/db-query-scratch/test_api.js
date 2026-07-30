const axios = require('axios');

async function main() {
  try {
    console.log("Logging in...");
    const loginRes = await axios.post("http://localhost:8080/api/auth/login", {
      email: "vkpraveen216@gmail.com",
      password: "Kumar@2311"
    });
    const token = loginRes.data.token;
    console.log("Login successful! Token received.");

    console.log("Fetching user dashboard...");
    const dashboardRes = await axios.get("http://localhost:8080/api/user-dashboard", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = dashboardRes.data;
    console.log("Overall Completion Percentage:", data.overallCompletionPercentage);
    console.log("\nMy Projects:");
    data.myProjects.forEach(p => {
      console.log(`- Project: ${p.projectName} (${p.projectCode})`);
      console.log(`  Progress: ${p.progress}%`);
      console.log(`  Lead/Lag Status: ${p.leadLagStatus} (${p.leadLagLabel}, Color: ${p.leadLagColor}, Variance: ${p.daysVariance} days)`);
      console.log(`  Tasks Assigned: ${p.tasksAssigned}, Open Tasks: ${p.openTasks}`);
    });
  } catch (err) {
    console.error("API Request failed:", err.response ? err.response.data : err.message);
  }
}

main();
