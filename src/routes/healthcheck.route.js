// healthcheck.routes.js: return a 2xx response when your server is healthy, else send a 5xx response
import { Router } from 'express';

const router = Router();
export default () => {
  router.get('/', async (_req, res) => {
    // optional: add further things to check (e.g. connecting to dababase)
    const healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now()
    };
    try {
      res.send(healthcheck);
    } catch (e) {
      healthcheck.message = e;
      res.status(503).send();
    }
  });

  return router;
};
