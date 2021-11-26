import { isValidObjectId } from 'mongoose';
import config from '../../configs';
import { SC_EVENT } from '../../configs/constant';
import generateDS from '../../datasources';
import { validateLastTxns } from './validation';

const { Transaction } = generateDS;

export const getLastTransactions = async (req, res) => {
  let result = {
    statusCode: 200,
    message: 'Success'
  };
  try {
    let { limit = 20, skip = 0 } = req.body;
    if (limit > config.limitQuerySize) limit = config.limitQuerySize;

    const docs = await Transaction.filterAndPaging(
      {
        orderBy: {
          timestamp: 'desc'
        },
        query: {
          event: SC_EVENT.BUY
        },
        limit,
        skip
      },
      config.cache.ttlQuery
    );
    result = {
      ...result,
      ...docs
    };
    console.log('result: ', result);
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};

export const getTransactionHistories = async (req, res) => {
  let result = {
    statusCode: 200,
    message: 'Success'
  };
  try {
    const validateInput = await validateLastTxns(req.body);
    if (validateInput?.length) throw new Error(validateInput.map(item => item.message).join(','));

    let { orderBy = { timestamp: 'desc' }, where = {}, limit = 20, skip = 0 } = req.body;
    if (limit > config.limitQuerySize) limit = config.limitQuerySize;

    const { address } = where;

    const query = {
      event: SC_EVENT.BUY,
      address
    };

    const docs = await Transaction.filterAndPaging(
      {
        orderBy,
        query,
        limit,
        skip
      },
      config.cache.ttlQuery
    );

    result = {
      ...result,
      ...docs
    };
    console.log('result: ', result);
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
    const docs = await Transaction.filterAndPaging(
      {
        orderBy: {
          timestamp: 'desc'
        },
        query: {
          event: SC_EVENT.BUY
        },
        limit: 100,
        skip: 0
      },
      config.cache.ttlQuery
    );
    result = {
      ...result,
      ...docs
    };
    console.log('result: ', result);
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};

export const getTopSold = async (req, res) => {
  let result = {
    statusCode: 200,
    message: 'Success'
  };
  try {
    const docs = await Transaction.filterAndPaging(
      {
        orderBy: {
          timestamp: 'desc'
        },
        query: {
          event: SC_EVENT.BUY
        },
        limit: 100,
        skip: 0
      },
      config.cache.ttlQuery
    );
    result = {
      ...result,
      ...docs
    };
    console.log('result: ', result);
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

    const docs = await Transaction.filterAndPaging(
      {
        orderBy: {
          timestamp: 'desc'
        },
        query: {
          event: SC_EVENT.BUY
        },
        limit,
        skip
      },
      config.cache.ttlQuery
    );
    result = {
      ...result,
      ...docs
    };
    console.log('result: ', result);
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};
