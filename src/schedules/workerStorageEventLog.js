import logger from '../external-libs/winston';
import MessageQueueService from '../external-libs/rabbitmq';
import { connect as connectMongoDB } from '../external-libs/mongoose';
import generateDS from '../datasources';
import { SC_EVENT } from '../configs/constant';

const { Transaction, Buy, ListedItem } = generateDS;

async function processQueue(msg, channel) {
  try {
    if (!msg) throw new Error('Message is empty');
    // Parse message queue
    const body = msg.content.toString();
    const data = JSON.parse(body);
    console.log('data: ', data);
    const { tokenIds, ...params } = data;

    // Transaction
    // Ignore record if existed transactionHash
    // Storage many records each the tokenIds
    const txnHashExisted = await Transaction.collection.exists({ transactionHash });

    if (!txnHashExisted) {
      if (tokenIds?.length > 0)
        await Promise.all(tokenIds.map(async tokenId => await Transaction.collection.create({ ...params, tokenId })));
      else {
        const result = await Transaction.collection.create(data);
        console.log('result: ', result);
      }
    } else {
      logger.warn(`txnHashExisted: ${body}`);
    }

    // Buy
    if (data.eventName === SC_EVENT.BUY) {
      if (tokenIds?.length > 0)
        await Promise.all(tokenIds.map(async tokenId => await Buy.collection.create({ ...params, tokenId })));
      else {
        const result = await Buy.collection.create(data);
        console.log('Buy: ', result);
      }
    }

    // ListedItem
    // Upsert data listedItem with unique key itemId
    if (data.eventName === SC_EVENT.LISTED_ITEM) {
      const { itemId, ...listedItemParams } = data;
      const result = await ListedItem.collection.findOneAndUpdate({ itemId }, listedItemParams, {
        new: true,
        upsert: true // Make this update into an upsert
      });
      console.log('ListedItem: ', result);
    }

    // const txnHashExisted = await Transaction.collection.exists({ transactionHash });
    // if (!txnHashExisted) {
    //   const result = await Transaction.collection.create(data);
    //   console.log('result: ', result);
    // } else {
    //   logger.warn(`txnHashExisted: ${body}`);
    // }

    await channel.ack(msg);
    return true;
  } catch (error) {
    // Ignore duplicate transaction hash
    // if (error.code === 11000) {
    //   logger.warn(error);
    //   await channel.ack(msg);
    //   return true;
    // }
    logger.error(error);
    await channel.reject(msg, false);
    return Promise.reject(error);
  }
}

const run = async () => {
  try {
    await connectMongoDB();
    // Connect Message queue
    const messageQueue = new MessageQueueService();
    await messageQueue.connect();
    await messageQueue.consumerJob(processQueue);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

run();
