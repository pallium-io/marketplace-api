import { Router } from 'express';
import {
  getLastTransactions,
  getTransactionHistories,
  getTopSellers,
  getTopSold,
  recentlyListing,
  nftMarket
} from './controller';

const router = Router();

export default () => {
  router.get('/transaction/last-transactions', getLastTransactions);
  router.post('/transaction/histories', getTransactionHistories);
  router.get('/analysis/top-sellers', getTopSellers);
  router.get('/analysis/top-sold', getTopSold);
  router.get('/analysis/recently-listing', recentlyListing);
  router.get('/analysis/nft-market', nftMarket);

  return router;
};
