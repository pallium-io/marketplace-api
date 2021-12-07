import Redis from 'ioredis';
import config from '../configs';

export const RedisConfigOption = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.dbName,
  retry_strategy: options => Math.max(options.attempt * 100, 3000)
};
const redis = new Redis(RedisConfigOption);

export default redis;
