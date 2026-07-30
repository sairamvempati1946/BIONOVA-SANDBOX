const fs = require('fs');

const logFile = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\e3f8c679-58fe-4a76-8098-2c8881007609\\.system_generated\\logs\\overview.txt';

if (fs.existsSync(logFile)) {
  const content = fs.readFileSync(logFile, 'utf8');
  let index = content.toLowerCase().indexOf("const handlesubmit");
  while (index !== -1) {
    console.log("Found 'const handleSubmit' at index:", index);
    console.log(content.substring(index - 100, index + 1500));
    index = content.toLowerCase().indexOf("const handlesubmit", index + 1);
  }
} else {
  console.log("Log file not found");
}
