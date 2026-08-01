import { createClient } from 'redis';
import { env } from './env.js';

let redisAvailable = false;

export const redisClient = createClient({
  url: env.REDIS_URL,
  socket: {
    // Don't retry automatically — we handle reconnection manually if needed
    reconnectStrategy: false,
    connectTimeout: 3000, // 3 second timeout
  },
});

redisClient.on('error', () => {
  // Suppress repeated error logs — we already warn at startup
  if (redisAvailable) {
    console.error('Redis connection lost.');
    redisAvailable = false;
  }
});
redisClient.on('connect', () => {
  console.log('Redis Connected');
  redisAvailable = true;
});

export const isRedisAvailable = () => redisAvailable;

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error(`Error connecting to Redis: ${error.message}`);
    console.warn('⚠ Server will start without Redis. Idempotency features will be unavailable.');
  }
};
