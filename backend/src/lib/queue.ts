import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const redisConnection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
};

// Queue for asynchronous lecture processing jobs
export const lectureProcessingQueue = new Queue("lecture-processing", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,   // Keep last 100 completed jobs
    removeOnFail: 50,        // Keep last 50 failed jobs
    attempts: 3,             // Retry up to 3 times on failure
    backoff: {
      type: "exponential",
      delay: 5000,           // Start with 5s backoff
    },
  },
});

export { redisConnection };
