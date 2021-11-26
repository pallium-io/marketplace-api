import Joi from 'joi';
import logger from '../external-libs/winston';
require('dotenv').config();

const schema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().default(9000),
  CORS_ENABLED: Joi.boolean().default(false),
  CORS_WHITE_LIST: Joi.string().default(null),

  JWT_PREFIX: Joi.string()
    .optional()
    .default('x-token'),
  JWT_HEADER_NAME: Joi.string()
    .optional()
    .default('x-token'),
  JWT_HEADER_NAME_REFRESH: Joi.string()
    .optional()
    .default('x-refresh-token'),
  JWT_ACCESS_TOKEN_SECRET: Joi.string()
    .optional()
    .required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string()
    .optional()
    .required(),
  JWT_EXPIRATION: Joi.number()
    .empty('')
    .default(60 * 60 * 24),
  JWT_EXPIRATION_REFRESH: Joi.number()
    .empty('')
    .default(60 * 60 * 24 * 7),

  MONGO_HOST: Joi.string().default('localhost'),
  MONGO_PORT: Joi.number().default(27017),
  MONGO_USERNAME: Joi.string()
    .empty('')
    .default(null),
  MONGO_PASSWORD: Joi.string()
    .empty('')
    .default(null),
  MONGO_NAME: Joi.string().default('restful-db'),
  MONGO_COLLECTION_PREFIX: Joi.string().default('col'),

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string()
    .empty('')
    .default(null),
  REDIS_TLS: Joi.string().default('0'),

  AMQP_HOST: Joi.string().default('localhost'),
  AMQP_PORT: Joi.number().default(5672),
  AMQP_USERNAME: Joi.string()
    .empty('')
    .default(null),
  AMQP_PASSWORD: Joi.string()
    .empty('')
    .default(null),
  AMQP_QUEUE_SC_EVENT: Joi.string().default(null),

  CACHE_TTL_QUERY: Joi.number()
    .empty('')
    .default(60 * 15),
  CACHE_TTL_ID: Joi.number()
    .empty('')
    .default(60 * 30),
  CACHE_TTL_PASSCODE: Joi.number()
    .empty('')
    .default(60 * 30),
  CACHE_AUTH_TOKEN_KEY_PREFIX: Joi.string()
    .empty('')
    .default('auth'),
  MAXIMUM_LIMIT_SIZE: Joi.number()
    .empty('')
    .default(500)
});

const envConfig = () => {
  try {
    const validConfigs = schema.validate(process.env, {
      abortEarly: true, // throw error right in first check
      allowUnknown: true
    });

    if (validConfigs.error) throw validConfigs.error;
    const config = {
      env: validConfigs.value.NODE_ENV,
      port: validConfigs.value.PORT,
      cors: {
        allowed: validConfigs.value.CORS_ENABLED,
        whitelist: JSON.parse(validConfigs.value.CORS_WHITE_LIST)
      },
      mongo: {
        host: validConfigs.value.MONGO_HOST,
        port: validConfigs.value.MONGO_PORT,
        username: validConfigs.value.MONGO_USERNAME,
        password: validConfigs.value.MONGO_PASSWORD,
        name: validConfigs.value.MONGO_NAME,
        prefix: validConfigs.value.MONGO_COLLECTION_PREFIX
      },
      redis: {
        host: validConfigs.value.REDIS_HOST,
        port: validConfigs.value.REDIS_PORT,
        password: validConfigs.value.REDIS_PASSWORD,
        dbName: validConfigs.value.REDIS_DBNAME
      },
      amqp: {
        host: validConfigs.value.AMQP_HOST,
        port: validConfigs.value.AMQP_PORT,
        username: validConfigs.value.AMQP_USERNAME,
        password: validConfigs.value.AMQP_PASSWORD,
        queueSCEvent: validConfigs.value.AMQP_QUEUE_SC_EVENT
      },
      jwt: {
        prefix: validConfigs.value.JWT_PREFIX,
        header: validConfigs.value.JWT_HEADER_NAME,
        headerRefresh: validConfigs.value.JWT_HEADER_NAME_REFRESH,
        secret: validConfigs.value.JWT_ACCESS_TOKEN_SECRET,
        secretRefresh: validConfigs.value.JWT_REFRESH_TOKEN_SECRET,
        expiration: validConfigs.value.JWT_EXPIRATION,
        expirationRefresh: validConfigs.value.JWT_EXPIRATION_REFRESH
      },
      cache: {
        ttlQuery: validConfigs.value.CACHE_TTL_QUERY,
        ttlId: validConfigs.value.CACHE_TTL_ID,
        ttlPasscode: validConfigs.value.CACHE_TTL_PASSCODE,
        authTokenPrefix: validConfigs.value.CACHE_AUTH_TOKEN_KEY_PREFIX
      },
      limitQuerySize: validConfigs.value.MAXIMUM_LIMIT_SIZE
    };

    logger.info('EnvConfig: Initialized');
    console.log('config: ', config);
    return config;
  } catch (error) {
    logger.error(`EnvConfig ${error} with details ${JSON.stringify(error.details)}`);
    throw new Error(error);
  }
};

export default envConfig();
