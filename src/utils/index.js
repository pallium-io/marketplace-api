import { ethers } from 'ethers';

const cleanObject = object => {
  Object.entries(object).forEach(([k, v]) => {
    if (v && typeof v === 'object') cleanObject(v);
    if ((v && typeof v === 'object' && !Object.keys(v).length) || v === null || v === undefined || v.length === 0) {
      if (Array.isArray(object)) object.splice(k, 1);
      else if (!(v instanceof Date)) delete object[k];
    }
  });
  return object;
};

const isLogicalQuery = key => ['or', 'nor', 'not', 'and'].includes(key);

const isRegexQuery = key => ['regex'].includes(key);

const proccessQueryCondition = (filter = {}) =>
  Object.entries(filter).reduce((acc, [key, operators]) => {
    if (isLogicalQuery(key)) {
      return {
        ...acc,
        [`$${key}`]: proccessFieldLogical(operators)
      };
    }
    return {
      ...acc,
      [key]: proccessFieldComparison(operators)
    };
  }, {});

const getPageInfo = (docCount, limit, skip) => {
  const totalPage = limit > 0 ? Math.ceil(docCount / limit) || 1 : 0;
  // const currentPage = Math.ceil((skip + 1) / limit);
  const currentPage = skip + 1;

  return {
    limit,
    totalDocs: docCount,
    totalPage,
    currentPage,
    hasNextPage: currentPage < totalPage,
    hasPreviousPage: currentPage > 1
  };
};

const isFieldComparision = key => ['eq', 'ne', 'gte', 'lte', 'gt', 'lt'].includes(key);

const proccessAggsQueryCondition = (filter = {}) =>
  Object.entries(filter).reduce((acc, [key, operators]) => {
    if (isLogicalQuery(key)) {
      return {
        ...acc,
        [`$${key}`]: proccessAggsFieldLogical(operators)
      };
    }
    return {
      ...acc,
      [key]: proccessAggsFieldComparison(key, operators)
    };
  }, {});

const proccessAggsQuery = (aggs = []) =>
  aggs.map(aggQuery =>
    Object.entries(aggQuery).reduce(
      (acc, [key, operators]) => ({
        ...acc,
        [`$${key}`]: proccessFieldAggs(operators)
      }),
      {}
    )
  );

const proccessAggsFieldComparison = (key, operators) =>
  Object.entries(operators).reduce((acc, [operator, value]) => {
    const data = value;
    const newOperator = {};
    if (isRegexQuery(operator)) {
      newOperator.$options = 'i';
    }
    if (isFieldComparision(operator)) {
      return {
        ...acc,
        [`$${operator}`]: data
      };
    }
    return {
      ...acc,
      [operator]: data
    };
  }, {});

const proccessAggsFieldLogical = filter => filter.reduce((acc, item) => [...acc, proccessAggsQueryCondition(item)], []);

const proccessFieldAggs = filter =>
  Object.entries(filter).reduce((acc, [key, value]) => {
    if (isLogicalQuery(key)) {
      return {
        ...acc,
        [`$${key}`]: proccessAggsFieldLogical(value)
      };
    }
    return {
      ...acc,
      [key]: proccessAggsFieldComparison(key, value)
    };
  }, {});

const proccessFieldComparison = operators =>
  Object.entries(operators).reduce((acc, [operator, value]) => {
    const newOperator = {
      ...acc,
      [`$${operator}`]: value
    };
    if (isRegexQuery(operator)) {
      newOperator.$options = 'i';
    }
    return newOperator;
  }, {});

const proccessFieldLogical = filter => filter.reduce((acc, item) => [...acc, proccessQueryCondition(item)], []);

const isObject = item => typeof item === 'object' && !Array.isArray(item) && item !== null;

/* eslint prefer-const: 0 */
const parseObjectFieldBigNumber = data =>
  Object.entries(data).reduce((prev, current) => {
    let [key, value] = current;

    if (isObject(value) && ethers.BigNumber.isBigNumber(value)) {
      value = ethers.BigNumber.from(value).toString();
      value = parseFloat(value);
    } else if (isObject(value)) {
      value = parseObjectFieldBigNumber(value);
    }

    if (Array.isArray(value)) {
      value = value.map(item => {
        if (isObject(item) && ethers.BigNumber.isBigNumber(item)) {
          item = ethers.BigNumber.from(item).toBigInt();
          item = parseFloat(item);
        } else if (isObject(item)) item = parseObjectFieldBigNumber(item);
        return item;
      });
    }

    return {
      ...prev,
      [key]: value
    };
  }, {});

export {
  isObject,
  cleanObject,
  isLogicalQuery,
  proccessQueryCondition,
  proccessFieldComparison,
  proccessFieldLogical,
  getPageInfo,
  proccessAggsQuery,
  parseObjectFieldBigNumber
};
