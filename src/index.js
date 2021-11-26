import createError from 'http-errors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { apiDocumentation } from './docs/apidoc';
import smartContractEvent from './services/smartContractEvent';

import { connect as connectMongoDB } from './external-libs/mongoose';
import MessageQueueService from './external-libs/rabbitmq';
import logger from './external-libs/winston';

import routes from './routes';
import config from './configs';
import initAdmin from './utils/createUser';

require('dotenv').config();

async function init() {
  const app = express();

  const MessageQueue = new MessageQueueService();
  await MessageQueue.connect();

  // parse application/json, application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  let corsOptions = {
    origin(origin, callback) {
      if (!origin || config.cors.whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed access!'));
      }
    }
  };

  if (!config.cors.allowed) {
    corsOptions = {};
  }

  // Create the rate limit rule
  const apiRequestLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // limit each IP to 20 requests per windowMs
    handler: function(req, res) {
      return res.status(429).json({
        error: 'You sent too many requests. Please wait a while then try again'
      });
    }
  });

  // Use the limit rule as an application middleware
  app.use(apiRequestLimiter);
  app.use(compression());
  app.use(cors(corsOptions));
  app.use(helmet());

  // catch 404 and forward to error handler
  app.use((err, req, res, next) => {
    next(createError(404));
  });

  // error handler
  app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({ message: 'Not allowed access!' });
  });

  app.get('/', (req, res) => {
    res.status(404).json();
  });

  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      name: 'RESTful Service',
      version: '1.0',
      status: 'green'
    });
  });

  app.use('/documentation', swaggerUi.serve, swaggerUi.setup(apiDocumentation));

  connectMongoDB()
    .then(db => {
      logger.info('Mongo connect successful!');
      // init user admin
      initAdmin(db.models.User);
      // Listening Event Emit on SmartContract
      smartContractEvent({ messageQueue: MessageQueue });
      // Use Route
      app.use('/api/v1', routes);
      // The `listen` method launches a web server.
      app.listen(config.port, () => {
        logger.info(`🚀 Server ready at http://localhost:${config.port}/api/v1`);
        logger.info(`🚀 Server health check at http://localhost:${config.port}/health`);
        logger.info(`🚀 API Document at http://localhost:${config.port}/documentation`);
      });
    })
    .catch(error => {
      logger.error(error);
      process.exit(1);
    });
}

init();
