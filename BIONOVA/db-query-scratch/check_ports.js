const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true); // Port is in use (server is running)
        } else {
          resolve(false);
        }
      })
      .once('listening', () => {
        server.close();
        resolve(false); // Port is free (server not running)
      })
      .listen(port);
  });
}

async function main() {
  const backend = await checkPort(8080);
  const frontend = await checkPort(5173);
  console.log(`Backend (8080) running: ${backend}`);
  console.log(`Frontend (5173) running: ${frontend}`);
}

main();
