import got from 'got';
import { ethers } from 'ethers';
import logger from '../external-libs/winston';
import MessageQueueService from '../external-libs/rabbitmq';
import { connect as connectMongoDB } from '../external-libs/mongoose';
import generateDS from '../datasources';
import { SC_EVENT } from '../configs/constant';
import config from '../configs';

const configSC = require('../../config-sc.json');

const { ERC20Token, Transaction, Buy, ListedItem } = generateDS;

async function processQueue(msg, channel) {
  try {
    if (!msg) throw new Error('Message is empty');
    // Parse message queue
    const body = msg.content.toString();
    const data = JSON.parse(body);
    const { price, tokenIds, ...params } = data;

    let erc20Existed = await ERC20Token.collection.findOne({ address: price?.address }).exec();

    // save info erc20Token
    if ([SC_EVENT.LISTED_ITEM, SC_EVENT.BUY].includes(data.eventName) && !erc20Existed) {
      const { body: responseErc20TokenABI } = await got.get(`${configSC.erc20TokenABIURL}${price?.address}`, {
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!responseErc20TokenABI?.result) {
        logger.error(responseErc20TokenABI);
        throw new Error('Have an error when call Erc20TokenABI');
      }

      const provider = new ethers.providers.JsonRpcProvider(configSC.networkSC, {
        chainId: configSC.chainIdSC
      });

      const erc20 = new ethers.Contract(price?.address, JSON.parse(responseErc20TokenABI.result), provider);
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

    let seller;
    // Get Seller Item from ListedItem
    if (data.eventName === SC_EVENT.BUY && data.itemId) {
      const dataListedItem = await ListedItem.findManyByQuery({ itemId: data.itemId }, { ttl: config.cache.ttlQuery });
      seller = (dataListedItem.length && dataListedItem[0].from) || '';
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
                tokenId,
                seller,
                price: { value: price?.value, info: erc20Existed._id }
              })
          )
        );
      else {
        await Transaction.collection.create({
          ...data,
          seller,
          price: { value: price?.value, info: erc20Existed._id }
        });
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
                tokenId,
                seller,
                price: { value: price?.value, info: erc20Existed._id }
              })
          )
        );
      else {
        await Buy.collection.create({
          ...data,
          seller,
          price: { value: price?.value, info: erc20Existed._id }
        });
      }
    }

    // ListedItem
    // Upsert data listedItem with unique key itemId
    if (data.eventName === SC_EVENT.LISTED_ITEM) {
      const { itemId, ...listedItemParams } = data;
      await ListedItem.collection.findOneAndUpdate(
        { itemId },
        { ...listedItemParams, price: { value: price?.value, info: erc20Existed._id } },
        {
          new: true,
          upsert: true // Make this update into an upsert
        }
      );
    }

    await channel.ack(msg);
    return true;
  } catch (error) {
    logger.error(error);
    await channel.reject(msg, false);
    return Promise.reject(error);
  }
}

const run = async () => {
  try {
    console.log('Queue Worker storage event log');
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
