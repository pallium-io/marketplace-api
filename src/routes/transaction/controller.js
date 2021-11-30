import { ethers } from 'ethers';
import { DateTime } from 'luxon';
import flatten from 'lodash.flatten';

import generateDS from '../../datasources';
import { parseObjectFieldBigNumber } from '../../utils';
import config from '../../configs';
import configSC from '../../configs/configSC.dev.js';

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
    let { limit = 10 } = req.query;
    if (!/^\d+$/.test(limit)) throw new Error('Limit must be a number');
    if (Number(limit) > config.limitQuerySize) limit = config.limitQuerySize;

    console.log('limit: ', limit);

    const body = [
      {
        $match: {
          timestamp: {
            $gte: Math.round(
              DateTime.fromJSDate(new Date(), { zone: 'utc' })
                .startOf('day')
                .valueOf() / 1000
            ),
            $lte: Math.round(
              DateTime.fromJSDate(new Date(), { zone: 'utc' })
                .endOf('day')
                .valueOf() / 1000
            )
          }
        }
      },
      {
        $group: {
          _id: '$seller',
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
      { $limit: Number(limit) }
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
  const result = {
    statusCode: 200,
    message: 'Success',
    data: []
  };
  try {
    let { limit = 10 } = req.query;
    if (!/^\d+$/.test(limit)) throw new Error('Limit must be a number');
    if (Number(limit) > config.limitQuerySize) limit = config.limitQuerySize;

    const body = [
      {
        $match: {
          timestamp: {
            $gte: Math.round(
              DateTime.fromJSDate(new Date(), { zone: 'utc' })
                .startOf('day')
                .valueOf() / 1000
            ),
            $lte: Math.round(
              DateTime.fromJSDate(new Date(), { zone: 'utc' })
                .endOf('day')
                .valueOf() / 1000
            )
          }
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$itemId',
          count: { $sum: 1 },
          items: { $push: '$$ROOT' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 1
      },
      {
        $project: {
          items: { $slice: ['$items', Number(limit)] }
        }
      },
      {
        $lookup: {
          from: 'col_erc20Tokens',
          localField: 'items.price.info',
          foreignField: '_id',
          as: 'erc20TokenField'
        }
      },
      { $unwind: { path: '$erc20TokenField' } },
      {
        $addFields: {
          'items.price.contract_address': '$erc20TokenField.address',
          'items.price.decimals': '$erc20TokenField.decimals',
          'items.price.symbol': '$erc20TokenField.symbol',
          'items.price.name': '$erc20TokenField.name'
        }
      }
    ];

    let docs = await Buy.aggregation(body, { ttl: config.cache.ttlQuery });

    if (docs[0]?.items?.length) {
      const provider = new ethers.providers.JsonRpcProvider(configSC.networkSC, {
        chainId: configSC.chainIdSC
      });
      const contract = new ethers.Contract(configSC.nftCrowdsale, JSON.parse(configSC.nftCrowdsaleABI), provider);
      let parcel = await contract.parcels(docs[0]?._id);
      parcel = parseObjectFieldBigNumber(parcel);

      docs = docs.map(doc => {
        return doc?.items?.map(item => {
          const { info, ...priceParams } = item.price;
          return {
            // _id: item?._id,
            type: item?.type,
            item_id: item?.itemId,
            // token_id: item?.tokenId,
            contract_address: item?.contractAddress,
            timestamp: item?.timestamp,
            tx_hash: item?.transactionHash,
            bulk_total: parcel?.cap,
            bulk_quantity: parcel?.cap - parcel?.supply,
            price: priceParams
          };
        });
      });
      result.data = flatten(docs);
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
          // _id: item?._id,
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
