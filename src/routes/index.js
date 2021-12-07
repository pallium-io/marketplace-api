import { Router } from 'express';

import { handleUserAuthenticate } from '../services/authenticate';
import userRoute from './user/route';
import configRoute from './config.route';
import transactionRoute from './transaction/route';

require('dotenv').config();

const routes = Router();

routes.use('/', handleUserAuthenticate, userRoute());
routes.use('/', configRoute());
routes.use('/', transactionRoute());

export default routes;
