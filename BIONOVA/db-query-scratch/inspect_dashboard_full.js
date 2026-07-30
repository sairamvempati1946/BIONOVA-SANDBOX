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

    console.log("Fetching user dashboard...");
    const res = await axios.get("http://localhost:8080/api/user-dashboard", { headers });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
