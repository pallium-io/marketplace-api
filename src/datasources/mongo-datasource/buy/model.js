import { ethers } from 'ethers';
import { DateTime } from 'luxon';
import flatten from 'lodash.flatten';
import { MongoDataSource } from '../../generates';
import { getPageInfo, parseObjectFieldBigNumber } from '../../../utils';
import configSC from '../../../configs/configSC.dev.js';

export default class ModelDataSource extends MongoDataSource {
  initialize(config = {}) {
    super.initialize({
      ...config,
      allowFlushingCollectionCache: true,
      debug: true
    });
  }

  async topSold({ limit = 10 } = {}) {
    let docs = await this.collection.aggregate([
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
          items: { $slice: ['$items', limit] }
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
    ]);

    if (docs.length <= 0) return;
    if (docs[0]?.items?.length <= 0) return;

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
          type: item?.type,
          item_id: item?.itemId,
          token_id: item?.tokenId,
          contract_address: item?.contractAddress,
          timestamp: item?.timestamp,
          tx_hash: item?.transactionHash,
          bulk_total: parcel?.cap,
          bulk_quantity: parcel?.cap - parcel?.supply,
          price: priceParams
        };
      });
    });
    docs = flatten(docs);
    return docs;
  }

  async filterAndPaging({ orderBy, query, limit, skip, select }, ttl) {
    const sort = orderBy;
    const result = {};
    const [docs, countDocument] = await Promise.all([
      this.findManyByQueryAndOption(
        {
          query,
          select,
          option: { sort, limit, skip: skip * limit }
        },
        { ttl }
      ),
      this.collection.countDocuments(query)
    ]);

    result.pageInfo = getPageInfo(countDocument, limit, skip);
    result.data = docs;
    return result;
  }

  async insert(input) {
    const newDoc = new this.collection(input);
    const saveDoc = await newDoc.save();
    return saveDoc;
  }

  async create(input, ttl) {
    const newDoc = new this.collection(input);
    const saveDoc = await newDoc.save();

    await this.deleteManyFromQueryCollectionCache();
    const cacheDoc = await this.findOneById(saveDoc._id, {
      ttl
    });

    return cacheDoc;
  }

  async createMany(inputs, ttl) {
    const newDocs = await this.collection.create(inputs);
    if (!newDocs) throw new Error('Cannot create document, plz try again');

    await this.deleteManyFromQueryCollectionCache();
    const ids = newDocs.map(item => item._id);
    const cacheDocs = await this.findManyByIds(ids, {
      ttl
    });
    return cacheDocs;
  }

  async update({ _id, ...info }, ttl) {
    const updatedDoc = await this.collection
      .updateOne(
        { _id },
        {
          ...info
        }
      )
      .lean()
      .exec();

    if (!updatedDoc || (updatedDoc && updatedDoc.nModified === 0)) {
      throw new Error('Cannot update, plz try update again');
    }

    await this.deleteFromCacheById(_id);
    await this.deleteManyFromQueryCollectionCache();

    const cacheDoc = await this.findOneById(_id, {
      ttl
    });

    return cacheDoc;
  }

  async remove({ _id }) {
    await this.collection.deleteOne({ _id });
    await this.deleteFromCacheById(_id);
    await this.deleteManyFromQueryCollectionCache();
  }
}
