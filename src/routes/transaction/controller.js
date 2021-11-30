import { ethers } from 'ethers';
import config from '../../configs';
import generateDS from '../../datasources';
import configSC from '../../configs/configSC.dev.js';
import { parseObjectFieldBigNumber } from '../../utils';
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

    const select = [
      'timestamp',
      'tokenId',
      'itemId',
      'contractAddress',
      'nftAddress',
      'price',
      'transactionHash',
      'from',
      'to',
      'value'
    ];

    const docs = await Buy.filterAndPaging(
      {
        orderBy,
        query: where,
        limit,
        skip,
        select
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
    const body = [
      {
        $match: {
          timestamp: {
            $gte: parseInt(+new Date().setUTCHours(0, 0, 0, 0) / 1000),
            $lt: parseInt(+new Date().setUTCHours(23, 59, 59, 999) / 1000)
          }
        }
      },
      {
        $group: {
          _id: '$to',
          numberOfNFTSold: { $sum: 1 },
          detail: { $push: { itemId: '$itemId', timestamp: '$timestamp', transactionHash: '$transactionHash' } }
        }
      },
      {
        $addFields: {
          sellerAddress: '$_id'
        }
      },
      {
        $sort: { numberOfNFTSold: -1 }
      },
      { $limit: 10 }
    ];

    const data = await Buy.aggregation(body, { ttl: config.cache.ttlQuery });

    result.data = data;
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};

export const getTopSold = async (req, res) => {
  let { limit } = req?.query;
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
      if (Number(limit) > config.limitQuerySize) limit = config.limitQuerySize;
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
    message: 'Success',
    data: []
  };
  try {
    let { limit = 20, skip = 0 } = req.query;
    if (!/^\d+$/.test(limit) || !/^\d+$/.test(skip)) {
      result.statusCode = 400;
      result.data = null;
      result.message = 'Limit or skip must be a number, plz try again';
      return res.status(result.statusCode).json(result);
    }
    if (Number(limit) > config.limitQuerySize) limit = config.limitQuerySize;

    const docs = await ListedItem.filterAndPaging({
      orderBy: {
        timestamp: 'desc'
      },
      limit: Number(limit),
      skip: Number(skip)
    });
    result = {
      ...result,
      ...docs
    };

    const provider = new ethers.providers.JsonRpcProvider(configSC.networkSC, {
      chainId: configSC.chainIdSC
    });
    const contract = new ethers.Contract(configSC.nftCrowdsale, JSON.parse(configSC.nftCrowdsaleABI), provider);

    result.data = await Promise.all(
      result.data.map(async item => {
        let parcel = await contract.parcels(item?.itemId);
        parcel = parseObjectFieldBigNumber(parcel);

        return {
          _id: item?._id,
          type: item?.type,
          item_id: item?.itemId,
          contract_address: item?.contractAddress,
          timestamp: item?.timestamp,
          tx_hash: item?.transactionHash,
          bulk_total: parcel?.cap,
          bulk_quantity: parcel?.cap - parcel?.supply,
          price: item?.price
        };
      })
    );
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
