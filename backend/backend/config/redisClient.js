import { createClient } from "redis";

let redisClient;

try {
  redisClient = createClient({
    url: "redis://127.0.0.1:6379",
  });

  redisClient.on("error", () => {
    console.warn("⚠️ Redis not available, using DB only");
  });

  await redisClient.connect();
  console.log("✅ Redis Connected");
} catch (err) {
  console.warn("⚠️ Redis connection skipped");
}

export default redisClient;
