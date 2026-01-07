import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://127.0.0.1:6379",
});

redisClient.on("error", () => {
  // silent fallback
});

(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis Connected");
  } catch {
    console.log("⚠️ Redis not available, continuing without cache");
  }
})();

export default redisClient;
