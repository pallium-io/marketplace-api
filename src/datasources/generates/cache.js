import DataLoader from 'dataloader';
import { isValidObjectId } from 'mongoose';
import sift from 'sift';
import Crypto from 'crypto';
import { getCollection } from './helpers';
import logger from '../../external-libs/winston';

const isDocContainsData = doc => (doc && !Array.isArray(doc)) || (doc && Array.isArray(doc) && doc.length > 0);

const handleCache = async ({ ttl, doc, key, cache }) => {
  if (isDocContainsData(doc) && key && Number.isInteger(ttl)) {
    cache.set(key, JSON.stringify(doc), {
      ttl
    });
  }
};

const orderDocs = ids => docs => {
  const idMap = {};
  docs.forEach(doc => {
    idMap[doc._id] = doc;
  });
  return ids.map(id => idMap[id]);
};

const consumePriceInfo = doc => {
  if (Array.isArray(doc)) {
    return doc.map(item => ({
      ...item,
      price: {
        value: item?.price?.value,
        erc20Address: item?.price?.info?.address,
        decimals: item?.price?.info?.decimals,
        symbol: item?.price?.info?.symbol,
        name: item?.price?.info?.name
      }
    }));
  }
  return {
    ...doc,
    price: {
      value: doc?.price?.value,
      erc20Address: doc?.price?.info?.address,
      decimals: doc?.price?.info?.decimals,
      symbol: doc?.price?.info?.symbol,
      name: doc?.price?.info?.name
    }
  };
};

export const createCachingMethods = ({ collection, cache, allowFlushingCollectionCache = false, debug = false }) => {
  const isRedis = typeof cache.store === 'undefined';
  const isMongoose = typeof collection === 'function';
  const loader = new DataLoader(ids =>
    isMongoose
      ? collection
          .find({ _id: { $in: ids } })
          .populate('price.info')
          .lean()
          .then(orderDocs(ids))
      : collection
          .find({ _id: { $in: ids } })
          .toArray()
          .then(orderDocs(ids))
  );
  const cachePrefix = `mongo:${getCollection(collection).collectionName}:`;
  const cachePrefixQueryOption = `${cachePrefix}query:`;

  const dataQuery = isMongoose
    ? ({ queries }) =>
        collection
          .find({ $or: queries })
          .populate('price.info')
          .collation({ locale: 'en' })
          .lean()
          .then(items => queries.map(query => items.filter(sift(query))))
    : ({ queries }) =>
        collection
          .find({ $or: queries })
          .toArray()
          .then(items => queries.map(query => items.filter(sift(query))));

  const queryLoader = new DataLoader(queries => dataQuery({ queries }));

  // Dataloader query with options
  const dataQueryWithOption = ({ queries }) => {
    const filter = queries.map(query => {
      const { select, option, ...other } = query;
      return other.query;
    });
    const select = (queries && queries[0] && queries[0].select) || null;

    const option = (queries && queries[0] && queries[0].option) || null;

    return collection
      .find({ $or: filter }, select, option)
      .populate('price.info')
      .collation({ locale: 'en' })
      .lean()
      .then(items =>
        queries.map(query => {
          const { select: _select, option: _option, ...other } = query;
          return items.filter(sift(other.query));
        })
      );
  };

  const queryWithOptionLoader = new DataLoader(queries => dataQueryWithOption({ queries }));

  const methods = {
    aggregation: async (body, { ttl }) => {
      const hashQuery = Crypto.createHash('md5')
        .update(JSON.stringify(body))
        .digest('hex');
      const key = cachePrefix + hashQuery;
      const cacheDoc = await cache.get(key);
      logger.warn(`Caching ${key} - ${cacheDoc ? 'cache' : 'miss'}`);
      if (cacheDoc) {
        return JSON.parse(cacheDoc);
      }
      const doc = await collection.aggregate(body);
      await handleCache({ ttl, doc, key, cache });
      return doc;
    },

    findOneById: async (id, { ttl } = {}) => {
      if (!id) return null;
      if (!isValidObjectId(id)) throw new Error('Invalid ID');

      const key = cachePrefix + id;

      const cacheDoc = await cache.get(key);
      logger.warn(`Caching ${key} - ${cacheDoc ? 'cache' : 'miss'}`);
      if (cacheDoc) {
        return JSON.parse(cacheDoc);
      }

      let doc = await loader.load(id);
      doc = consumePriceInfo(doc);
      await handleCache({
        ttl,
        doc,
        key,
        cache
      });
      // Skip Dataloader cache for ID
      await loader.clear(id);

      return doc;
    },

    saveCache: async (key, value, ttl = {}) => cache.set(key, value, ttl),

    getCache: async key => cache.get(key),

    delCache: async key => cache.delete(key),

    findManyByIds: (ids, { ttl } = {}) =>
      (ids?.length &&
        Promise.all(ids.map(id => methods.findOneById(id, { ttl }))).then(result => result.filter(i => i))) ||
      [],

    findManyByQuery: async (query = {}, { ttl } = {}) => {
      const key = cachePrefixQueryOption + JSON.stringify(query);

      const cacheDocs = await cache.get(key);
      logger.warn(`Caching ${key} - ${cacheDocs ? 'cache' : 'miss'}`);

      if (cacheDocs) {
        return JSON.parse(cacheDocs);
      }
      let docs = await queryLoader.load(query);
      docs = consumePriceInfo(docs);
      await handleCache({
        ttl,
        doc: docs,
        key,
        cache
      });
      return docs;
    },

    // Find Many by query and option
    findManyByQueryAndOption: async ({ query = {}, select = null, option = {} }, { ttl } = {}) => {
      const key = cachePrefixQueryOption + JSON.stringify({ query, select, option });
      const cacheDocs = await cache.get(key);
      logger.warn(`Caching ${key} - ${cacheDocs ? 'cache' : 'miss'}`);

      if (cacheDocs) {
        return JSON.parse(cacheDocs);
      }
      let docs = await queryWithOptionLoader.load({
        query,
        select,
        option
      });
      docs = consumePriceInfo(docs);
      await handleCache({
        ttl,
        doc: docs,
        key,
        cache
      });
      return docs;
    },
    deleteFromCacheById: async id => {
      const key = id && typeof id === 'object' ? JSON.stringify(id) : id; // NEW
      if (debug) {
        console.log(`Deleted ${cachePrefix + key}`);
      }
      await cache.delete(cachePrefix + key);
    }, // this works also for byQueries just passing a stringified query as the id

    deleteFromCacheByIds: async ids => {
      Promise.all(ids.map(id => methods.deleteFromCacheById(id)));
    },

    deleteFromCachedByQuery: async query => {
      const key = cachePrefix + JSON.stringify(query);
      await cache.delete(key);
    },
    // eslint-disable-next-line no-param-reassign
    deleteManyFromQueryCollectionCache: async () => {
      if (isRedis) {
        const redis = cache.client;
        const stream = redis.scanStream({
          match: `${cachePrefixQueryOption}*`
        });
        stream.on('data', keys => {
          // `keys` is an array of strings representing key names
          if (keys.length) {
            const pipeline = redis.pipeline();
            keys.forEach(key => {
              pipeline.del(key);
              if (debug) {
                console.log('KEY', key, 'deleted');
              }
            });
            pipeline.exec();
          }
        });
        stream.on('end', () => {
          if (debug) {
            console.log(`Deleted ${cachePrefixQueryOption}*`);
          }
        });
        return 'ok';
      }
      return null;
    },
    // eslint-disable-next-line no-param-reassign
    deleteManyFromPatternKeyCollectionCache: async patternKey => {
      const matchKey = `${cachePrefix}${patternKey}*`;
      if (isRedis) {
        const redis = cache.client;
        const stream = redis.scanStream({
          match: matchKey
        });
        stream.on('data', keys => {
          // `keys` is an array of strings representing key names
          if (keys.length) {
            const pipeline = redis.pipeline();
            keys.forEach(key => {
              pipeline.del(key);
              if (debug) {
                console.log('KEY', key, 'deleted');
              }
            });
            pipeline.exec();
          }
        });
        stream.on('end', () => {
          if (debug) {
            console.log(`Deleted ${matchKey}`);
          }
        });
        return 'ok';
      }
      return null;
    },
    // eslint-disable-next-line no-param-reassign
    deleteManyCacheByPatternKey: async patternKey => {
      const matchKey = `${patternKey}*`;
      if (isRedis) {
        const redis = cache.client;
        const stream = redis.scanStream({
          match: matchKey
        });
        stream.on('data', keys => {
          // `keys` is an array of strings representing key names
          if (keys.length) {
            const pipeline = redis.pipeline();
            keys.forEach(key => {
              pipeline.del(key);
              if (debug) {
                console.log('KEY', key, 'deleted');
              }
            });
            pipeline.exec();
          }
        });
        stream.on('end', () => {
          if (debug) {
            console.log(`Deleted ${matchKey}`);
          }
        });
        return 'ok';
      }
      return null;
    },
    // eslint-disable-next-line no-param-reassign
    flushCollectionCache: async () => {
      if (!allowFlushingCollectionCache) return null;
      if (isRedis) {
        const redis = cache.client;
        const stream = redis.scanStream({
          match: `${cachePrefix}*`
        });
        stream.on('data', keys => {
          // `keys` is an array of strings representing key names
          if (keys.length) {
            const pipeline = redis.pipeline();
            keys.forEach(key => {
              pipeline.del(key);
              if (debug) {
                console.log('KEY', key, 'flushed');
              }
            });
            pipeline.exec();
          }
        });
        stream.on('end', () => {
          if (debug) {
            console.log(`Flushed ${cachePrefix}*`);
          }
        });
        return 'ok';
      }
      return null;
    }
  };
  return methods;
};
