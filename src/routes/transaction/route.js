import { Router } from 'express';
import { getTransactionHistories, getTopSellers, getTopSold, recentlyListing } from './controller';

const router = Router();

export default () => {
  router.get('/marketplace/transactions', getTransactionHistories);
  router.get('/marketplace/top-sellers', getTopSellers);
  router.get('/marketplace/top-sold', getTopSold);
  router.get('/marketplace/recently-listings', recentlyListing);

  return router;
};
