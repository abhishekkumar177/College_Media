const { parentPort } = require("worker_threads");

parentPort.on("message", (data) => {
  // Example heavy computation
  let result = 0;
  for (let i = 0; i < data.iterations; i++) {
    result += Math.sqrt(i * Math.random());
  }

  parentPort.postMessage({
    success: true,
    result,
  });
});
