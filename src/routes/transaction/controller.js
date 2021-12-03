import { ethers } from 'ethers';
import groupBy from 'lodash.groupby';
import { DateTime } from 'luxon';

import generateDS from '../../datasources';
import { parseObjectFieldBigNumber } from '../../utils';
import config from '../../configs';
const configSC = require('../../../config-sc.json');

const { Buy, ListedItem } = generateDS;

export const getTransactionHistories = async (req, res) => {
  let result = {
    statusCode: 200,
    message: 'Success'
  };
  try {
    let { limit = 20, skip = 0, itemId } = req.query;
    if (!/^\d+$/.test(limit) || !/^\d+$/.test(skip)) throw new Error('Limit or skip must be a number');

    if (Number(limit) > config.limitQuerySize) limit = config.limitQuerySize;

    const query = {};
    if (itemId) query.itemId = Number(itemId);

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
        orderBy: { timestamp: 'desc' },
        query,
        limit: Number(limit),
        skip: Number(skip),
        select
      },
      config.cache.ttlQuery
    );

    result = {
      ...result,
      ...docs
    };
    result.data = result.data.map(item => {
      delete item._id;
      delete item.value;
      return item;
    });
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
          totalNFTSold: { $sum: 1 },
          detail: { $push: '$$ROOT' }
        }
      },
      {
        $sort: { totalNFTSold: -1 }
      },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'col_erc20Tokens',
          localField: 'detail.price.info',
          foreignField: '_id',
          as: 'erc20TokenField'
        }
      },
      { $unwind: { path: '$detail' } },
      {
        $addFields: {
          'detail.price.ref': {
            $filter: {
              input: '$erc20TokenField',
              cond: { $eq: ['$$this._id', '$detail.price.info'] }
            }
          }
        }
      },
      { $unwind: { path: '$detail.price.ref' } },
      {
        $group: {
          _id: { sellerAddress: '$_id', priceInfo: '$detail.price.info', itemId: '$detail.itemId' },
          totalNFTSold: { $first: '$totalNFTSold' },
          income: { $push: { price: '$detail.price' } }
        }
      },
      {
        $group: {
          _id: '$_id.sellerAddress',
          totalNFTSold: { $first: '$totalNFTSold' },
          detail: {
            $push: {
              numberOfNFTSold: { $size: '$income' },
              itemId: '$_id.itemId',
              value: { $sum: '$income.price.value' },
              erc20Address: { $first: '$income.price.ref.address' },
              decimals: { $first: '$income.price.ref.decimals' },
              symbol: { $first: '$income.price.ref.symbol' },
              name: { $first: '$income.price.ref.name' }
            }
          }
        }
      },
      {
        $sort: { totalNFTSold: -1 }
      }
    ];

    let data = await Buy.aggregation(body, { ttl: config.cache.ttlQuery });

    if (data?.length) {
      data = data.map(doc => {
        let { detail, _id, ...others } = doc;
        detail = groupBy(detail, 'itemId');
        detail = Object.entries(detail).map(([key, value]) => {
          value = value.map(item => {
            const { itemId, ...other } = item;
            return other;
          });

          return { itemId: key, totalIncome: value };
        });
        return { sellerAddress: _id, ...others, detail };
      });
    }

    result.data = data ?? [];
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
          totalNFTSold: { $sum: 1 },
          item: { $push: '$$ROOT' }
        }
      },
      {
        $sort: { totalNFTSold: -1 }
      },
      {
        $limit: Number(limit)
      },
      {
        $lookup: {
          from: 'col_erc20Tokens',
          localField: 'item.price.info',
          foreignField: '_id',
          as: 'erc20TokenField'
        }
      },
      { $unwind: { path: '$item' } },
      {
        $addFields: {
          'item.price.ref': {
            $filter: {
              input: '$erc20TokenField',
              cond: { $eq: ['$$this._id', '$item.price.info'] }
            }
          }
        }
      },
      { $unwind: { path: '$item.price.ref' } },
      {
        $group: {
          _id: { itemId: '$_id', priceInfo: '$item.price.info' },
          totalNFTSold: { $first: '$totalNFTSold' },
          contractAddress: { $first: '$item.contractAddress' },
          income: {
            $push: {
              price: '$item.price'
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id.itemId',
          totalNFTSold: { $first: '$totalNFTSold' },
          contractAddress: { $first: '$contractAddress' },
          totalIncome: {
            $push: {
              numberOfNFTSold: { $size: '$income' },
              value: { $sum: '$income.price.value' },
              erc20Address: { $first: '$income.price.ref.address' },
              decimals: { $first: '$income.price.ref.decimals' },
              symbol: { $first: '$income.price.ref.symbol' },
              name: { $first: '$income.price.ref.name' }
            }
          }
        }
      },
      {
        $sort: { totalNFTSold: -1 }
      }
    ];

    let docs = await Buy.aggregation(body, { ttl: config.cache.ttlQuery });

    if (docs?.length) {
      const provider = new ethers.providers.JsonRpcProvider(configSC.networkSC, {
        chainId: configSC.chainIdSC
      });
      const contract = new ethers.Contract(configSC.nftCrowdsale, JSON.parse(configSC.nftCrowdsaleABI), provider);

      docs = await Promise.all(
        docs.map(async doc => {
          const { _id, ...others } = doc;
          let parcel = await contract.parcels(doc?._id);
          parcel = parseObjectFieldBigNumber(parcel);

          return {
            type: 'bulk',
            itemId: _id,
            bulkTotal: parcel?.cap,
            bulkQuantity: parcel?.cap - parcel?.supply,
            ...others
          };
        })
      );
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
          type: item.type,
          itemId: item.itemId,
          contractAddress: item.contractAddress,
          timestamp: item.timestamp,
          transactionHash: item.transactionHash,
          bulkTotal: parcel?.cap,
          bulkQuantity: parcel?.cap - parcel?.supply,
          price: item.price
        };
      })
    );
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};
