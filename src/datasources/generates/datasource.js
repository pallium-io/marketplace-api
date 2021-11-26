import { DataSource } from 'apollo-datasource';
import { InMemoryLRUCache } from 'apollo-server-caching';

import { RedisCache } from 'apollo-server-cache-redis';
import { RedisConfigOption } from '../../external-libs/redis';

import { createCachingMethods } from './cache';
import { isCollectionOrModel } from './helpers';

class MongoDataSource extends DataSource {
  constructor(collection) {
    super();

    if (!isCollectionOrModel(collection)) {
      throw new Error('MongoDataSource constructor must be given an object with a single collection');
    }
    this.collection = collection;
    this.cache = new RedisCache(RedisConfigOption);
  }

  initialize({ context = {}, debug, allowFlushingCollectionCache } = {}) {
    this.context = context;
    const methods = createCachingMethods({
      collection: this.collection,
      cache: this.cache || new InMemoryLRUCache(),
      debug,
      allowFlushingCollectionCache
    });
    Object.assign(this, methods);
  }
}
export { MongoDataSource };
