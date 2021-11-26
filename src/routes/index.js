import { Router } from 'express';

import { handleUserAuthenticate } from '../services/authenticate';
import userRoute from './user/route.js';
import configRoute from './config.route.js';
import transactionRoute from './transaction/route.js';
require('dotenv').config();

const routes = Router();

routes.use('/', handleUserAuthenticate, userRoute());
routes.use('/', configRoute());
routes.use('/', transactionRoute());

export default routes;
