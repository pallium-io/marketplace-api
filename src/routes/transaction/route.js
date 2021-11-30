import { Router } from 'express';
import { getTransactionHistories, getTopSellers, getTopSold, recentlyListing } from './controller';

const router = Router();

export default () => {
  router.get('/market-place/transactions', getTransactionHistories);
  router.get('/market-place/top-sellers', getTopSellers);
  router.get('/market-place/top-sold', getTopSold);
  router.get('/market-place/recently-listing', recentlyListing);

  return router;
};
