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

    console.log("Fetching task 19...");
    const tasksRes = await axios.get("http://localhost:8080/api/task-live", { headers });
    const task19 = tasksRes.data.find(t => t.taskId === 19);
    console.log("Task 19 JSON:");
    console.log(JSON.stringify(task19, null, 2));

    const task21 = tasksRes.data.find(t => t.taskId === 21);
    console.log("Task 21 JSON:");
    console.log(JSON.stringify(task21, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
