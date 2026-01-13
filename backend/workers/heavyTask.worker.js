const { parentPort } = require("worker_threads");

parentPort.on("message", (data) => {
  // heavy computation here
  const result = data.reduce((a, b) => a + b, 0);
  parentPort.postMessage(result);
});
