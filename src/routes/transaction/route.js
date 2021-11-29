import { Router } from 'express';
import { getTransactionHistories, getTopSellers, getTopSold, recentlyListing } from './controller';

const router = Router();

export default () => {
  router.post('/buy/transactions/search', getTransactionHistories);
  router.get('/analysis/top-sellers', getTopSellers);
  router.get('/analysis/top-sold', getTopSold);
  router.get('/analysis/recently-listing', recentlyListing);

  return router;
};
