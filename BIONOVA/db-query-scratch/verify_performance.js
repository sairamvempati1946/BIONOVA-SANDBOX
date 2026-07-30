

async function main() {
  console.log("--- Fetching Auth Token for Employee 5 ---");
  const authRes = await fetch('http://localhost:8080/api/auth/temp-token?email=vkpraveen216@gmail.com');
  const { token } = await authRes.json();
  console.log("Token retrieved successfully.");

  console.log("\n--- Fetching User Dashboard Data ---");
  const dashRes = await fetch('http://localhost:8080/api/user-dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await dashRes.json();
  console.log("Dashboard response status:", dashRes.status);
  console.log("\nPerformance Metrics:");
  console.log("Productivity (Efficiency):", data.productivity);
  console.log("Task Completion (On Time Delivery):", data.taskCompletion);
  console.log("Quality Score:", data.qualityScore);
  
  console.log("\nCounts for Verification:");
  console.log("Total Tasks:", data.myTasksCount + data.completedTasksCount + data.overdueTasksCount);
  console.log("Completed Tasks:", data.completedTasksCount);
  console.log("Overdue Tasks:", data.overdueTasksCount);
}

main().catch(console.error);
