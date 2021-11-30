import config from '../../configs';
import generateDS from '../../datasources';
import { validateLastTxns } from './validation';

const { Transaction, Buy, ListedItem } = generateDS;

export const getTransactionHistories = async (req, res) => {
  let result = {
    statusCode: 200,
    message: 'Success'
  };
  try {
    let { orderBy = { timestamp: 'desc' }, where = {}, limit = 20, skip = 0 } = req.body;
    if (limit > config.limitQuerySize) limit = config.limitQuerySize;

    const docs = await Buy.filterAndPaging(
      {
        orderBy,
        query: where,
        limit,
        skip
      },
      config.cache.ttlQuery
    );

    result = {
      ...result,
      ...docs
    };
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};

export const getTopSellers = async (req, res) => {
  let result = {
    statusCode: 200,
    message: 'Success'
  };
  try {
    // const docs = await Transaction.filterAndPaging(
    //   {
    //     orderBy: {
    //       timestamp: 'desc'
    //     },
    //     query: {
    //       event: SC_EVENT.BUY
    //     },
    //     limit: 100,
    //     skip: 0
    //   },
    //   config.cache.ttlQuery
    // );
    // result = {
    //   ...result,
    //   ...docs
    // };

    const topSellers = [
      {
        sellerAddress: '0x665dFf97726206130196CC0eaAD428BA65A58707',
        nftSold: 12,
        total: 3
      },
      {
        sellerAddress: '0x665dFf97726206130196CC0eaAD428BA65A58708',
        nftSold: 1,
        total: 1
      },
      {
        sellerAddress: '0x665dFf97726206130196CC0eaAD428BA65A58709',
        nftSold: 19,
        total: 5
      }
    ];
    result.data = topSellers;
    console.log('result: ', result);
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};

export const getTopSold = async (req, res) => {
  const { limit } = req?.query;
  const result = {
    statusCode: 200,
    message: 'Success',
    data: []
  };
  let objReq = {};
  try {
    if (limit) {
      if (!/^\d+$/.test(limit)) {
        result.statusCode = 400;
        result.data = null;
        result.message = 'Limit must be a number, plz try again';
        return res.status(result.statusCode).json(result);
      }
      objReq = { ...objReq, limit: Number(limit) };
    }
    const docs = await Buy.topSold(objReq);
    if (docs?.length > 0) {
      result.data = docs;
    }
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};

export const recentlyListing = async (req, res) => {
  let result = {
    statusCode: 200,
    message: 'Success'
  };
  try {
    let { limit = 20, skip = 0 } = req.body;
    if (limit > config.limitQuerySize) limit = config.limitQuerySize;

    // const docs = await Transaction.filterAndPaging(
    //   {
    //     orderBy: {
    //       timestamp: 'desc'
    //     },
    //     query: {
    //       event: SC_EVENT.BUY
    //     },
    //     limit,
    //     skip
    //   },
    //   config.cache.ttlQuery
    // );
    // result = {
    //   ...result,
    //   ...docs
    // };

    const recentlyListing = [
      {
        type: 'bulk',
        itemId: 1,
        tokenId: 12,
        contractAddress: '0x2498fEA2c0e2fF98872B3610F28D050221D5Dcc5',
        price: {
          value: 1000000000000000000,
          erc20Address: '0x7BbDFe11F3d1b1ec607c03EbBC455C312eB78641',
          decimals: 18,
          symbol: 'SC',
          name: 'StableCoin'
        },
        timestamp: 1637903616,
        transactionHash: '0xfcc947208cbe0921654548f6f37edab80ce377a5b0bc45f760ab6c3852a89470',
        bulkTotal: 77998,
        bulkQty: 2
      },
      {
        type: 'bulk',
        itemId: 5,
        tokenId: 15,
        contractAddress: '0x2498fEA2c0e2fF98872B3610F28D050221D5Dcc5',
        price: {
          value: 1000000000000000000,
          erc20Address: '0x7BbDFe11F3d1b1ec607c03EbBC455C312eB78641',
          decimals: 18,
          symbol: 'SC',
          name: 'StableCoin'
        },
        timestamp: 1637903888,
        transactionHash: '0xfcc947208cbe0921654548f6f37edab80ce377a5b0bc45f760ab6c3852a89471',
        bulkTotal: 77998,
        bulkQty: 2
      }
    ];
    result.data = recentlyListing;
    console.log('result: ', result);
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};

export const nftMarket = async (req, res) => {
  let result = {
    statusCode: 200,
    message: 'Success'
  };
  try {
    let { limit = 20, skip = 0 } = req.body;
    if (limit > config.limitQuerySize) limit = config.limitQuerySize;

    // const docs = await Transaction.filterAndPaging(
    //   {
    //     orderBy: {
    //       timestamp: 'desc'
    //     },
    //     query: {
    //       event: SC_EVENT.BUY
    //     },
    //     limit,
    //     skip
    //   },
    //   config.cache.ttlQuery
    // );
    // result = {
    //   ...result,
    //   ...docs
    // };

    const nftMarket = [
      {
        type: 'bulk',
        itemId: 1,
        tokenId: 12,
        contractAddress: '0x2498fEA2c0e2fF98872B3610F28D050221D5Dcc5',
        price: {
          value: 1000000000000000000,
          erc20Address: '0x7BbDFe11F3d1b1ec607c03EbBC455C312eB78641',
          decimals: 18,
          symbol: 'SC',
          name: 'StableCoin'
        },
        timestamp: 1637903616,
        transactionHash: '0xfcc947208cbe0921654548f6f37edab80ce377a5b0bc45f760ab6c3852a89470',
        bulkTotal: 77998,
        bulkQty: 2
      },
      {
        type: 'bulk',
        itemId: 5,
        tokenId: 15,
        contractAddress: '0x2498fEA2c0e2fF98872B3610F28D050221D5Dcc5',
        price: {
          value: 1000000000000000000,
          erc20Address: '0x7BbDFe11F3d1b1ec607c03EbBC455C312eB78641',
          decimals: 18,
          symbol: 'SC',
          name: 'StableCoin'
        },
        timestamp: 1637903888,
        transactionHash: '0xfcc947208cbe0921654548f6f37edab80ce377a5b0bc45f760ab6c3852a89471',
        bulkTotal: 77998,
        bulkQty: 2
      }
    ];
    result.data = nftMarket;
    console.log('result: ', result);
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};
