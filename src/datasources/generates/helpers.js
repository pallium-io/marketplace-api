export const isModel = x => Boolean(x && x.name === 'model');

export const isCollectionOrModel = x => Boolean(x && (typeof x === 'object' || isModel(x)));

export const getCollection = x => (isModel(x) ? x.collection : x);
