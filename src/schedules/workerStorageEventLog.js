import got from 'got';
import { ethers } from 'ethers';
import logger from '../external-libs/winston';
import MessageQueueService from '../external-libs/rabbitmq';
import { connect as connectMongoDB } from '../external-libs/mongoose';
import generateDS from '../datasources';
import { SC_EVENT } from '../configs/constant';
import configSC from '../configs/configSC.dev.js';

const { ERC20Token, Transaction, Buy, ListedItem } = generateDS;

async function processQueue(msg, channel) {
  try {
    if (!msg) throw new Error('Message is empty');
    // Parse message queue
    const body = msg.content.toString();
    const data = JSON.parse(body);
    console.log('data: ', data);
    const { price, eventName, tokenIds, ...params } = data;

    let erc20Existed = await ERC20Token.collection.findOne({ address: price?.address }).exec();

    // save info erc20Token
    if ([SC_EVENT.LISTED_ITEM, SC_EVENT.BUY].includes(data.eventName) && !erc20Existed) {
      const { body: responseErc20TokenABI } = await got.get(`${configSC.erc20TokenABIURL}${price?.address}`, {
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!responseErc20TokenABI) {
        logger.error(responseErc20TokenABI);
        throw new Error('Have an error when call Erc20TokenABI');
      }

      const provider = new ethers.providers.JsonRpcProvider(configSC.networkSC, {
        chainId: configSC.chainIdSC
      });

      const erc20 = new ethers.Contract(price?.address, JSON.parse(responseErc20TokenABI).result, provider);
      const erc20Decimals = await erc20.decimals();
      const erc20Symbol = await erc20.symbol();
      const erc20Name = await erc20.name();

      erc20Existed = await ERC20Token.collection.create({
        address: price?.address,
        decimals: erc20Decimals,
        symbol: erc20Symbol,
        name: erc20Name
      });
    }

    // Transaction
    // Ignore record if existed transactionHash
    // Storage many records each the tokenIds
    const txnHashExisted = await Transaction.collection.exists({ transactionHash: data.transactionHash });

    if (!txnHashExisted) {
      if (tokenIds?.length > 0)
        await Promise.all(
          tokenIds.map(
            async tokenId =>
              await Transaction.collection.create({
                ...params,
                eventName,
                tokenId,
                price: { value: price?.value, info: erc20Existed._id }
              })
          )
        );
      else {
        const result = await Transaction.collection.create({
          ...data,
          price: { value: price?.value, info: erc20Existed._id }
        });
        console.log('result: ', result);
      }
    } else {
      logger.warn(`txnHashExisted: ${body}`);
    }

    // Buy
    if (data.eventName === SC_EVENT.BUY) {
      if (tokenIds?.length > 0)
        await Promise.all(
          tokenIds.map(
            async tokenId =>
              await Buy.collection.create({
                ...params,
                eventName,
                tokenId,
                price: { value: price?.value, info: erc20Existed._id }
              })
          )
        );
      else {
        const result = await Buy.collection.create({ ...data, price: { value: price?.value, info: erc20Existed._id } });
        console.log('Buy: ', result);
      }
    }

    // ListedItem
    // Upsert data listedItem with unique key itemId
    if (data.eventName === SC_EVENT.LISTED_ITEM) {
      const { itemId, ...listedItemParams } = data;
      const result = await ListedItem.collection.findOneAndUpdate(
        { itemId },
        { ...listedItemParams, price: { value: price?.value, info: erc20Existed._id } },
        {
          new: true,
          upsert: true // Make this update into an upsert
        }
      );
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
