import { ethers } from 'ethers';
import configSC from '../configs/configSC.dev.js';
import { isObject } from '../utils';

function parseObjectFieldBigNumber(data) {
  return Object.entries(data).reduce((prev, current) => {
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
}

const SCEvent = async ({ messageQueue }) => {
  const provider = new ethers.providers.JsonRpcProvider(configSC.networkSC, {
    chainId: configSC.chainIdSC
  });
  const contract = new ethers.Contract(configSC.nftCrowdsale, JSON.parse(configSC.nftCrowdsaleABI), provider);
  const nft = new ethers.Contract(configSC.nftAddress, JSON.parse(configSC.nftABI), provider);

  contract.on('Buy', async (buyer, itemId, quantity, price, erc20Address, event) => {
    console.log('Event Buy', { buyer, itemId, quantity, price, erc20Address, event });

    const dataBlock = await provider.getBlock(event.blockHash);
    const dataTransaction = await provider.getTransaction(event.transactionHash);
    const dataTransactionReceipt = await provider.getTransactionReceipt(event.transactionHash);
    const { timestamp } = dataBlock;
    const { gasPrice, value } = dataTransaction;
    const { from, to, gasUsed, logs } = dataTransactionReceipt;

    // retreive tokenId from the buy transaction
    let tokenIds = [];
    logs.forEach(l => {
      const { data, topics, address } = l;
      // only care about the event emitted from the nft contract
      if (address === nft.address) {
        const { name, args } = nft.interface.parseLog({ data, topics });
        // make sure this is a mint event i.e. transfer from address(0) to buyer
        if (name === 'Transfer' && args.from === ethers.constants.AddressZero && args.to === buyer.address) {
          tokenIds.push(args.tokenId);
        }
      }
    });

    const storageTransaction = {
      // event,
      // dataBlock,
      // dataTransaction,
      // dataTransactionReceipt,
      blockHash: event.blockHash,
      contractAddress: event.address,
      transactionHash: event.transactionHash,
      eventName: event.event,
      timestamp,
      tokenIds,
      buyer,
      itemId,
      quantity,
      price: {
        value: price,
        erc20Address
      },
      from,
      to,
      value,
      gasPrice,
      gasUsed
    };
    // console.log('storageTransaction: ', storageTransaction);

    const data = parseObjectFieldBigNumber(storageTransaction);
    console.log('Buy: ', data);
    // Push message queue
    await messageQueue.producerJob(data);
  });

  contract.on('ListedItem', async (itemId, price, erc20Address, cap, event) => {
    console.log('event ListedItem', { itemId, price, erc20Address, cap, event });

    const dataBlock = await provider.getBlock(event.blockHash);
    const dataTransaction = await provider.getTransaction(event.transactionHash);
    const dataTransactionReceipt = await provider.getTransactionReceipt(event.transactionHash);
    const { timestamp } = dataBlock;
    const { gasPrice, value } = dataTransaction;
    const { from, to, gasUsed } = dataTransactionReceipt;

    const storageTransaction = {
      // event,
      // dataBlock,
      // dataTransaction,
      // dataTransactionReceipt,
      blockHash: event.blockHash,
      contractAddress: event.address,
      transactionHash: event.transactionHash,
      eventName: event.event,
      timestamp,
      itemId,
      price: {
        value: price,
        erc20Address
      },
      cap,
      from,
      to,
      gasUsed,
      gasPrice,
      value
    };
    // console.log('storageTransaction: ', storageTransaction);

    const data = parseObjectFieldBigNumber(storageTransaction);
    console.log('ListedItem: ', data);
    // Push message queue
    await messageQueue.producerJob(data);
  });

  contract.on('OwnershipTransferred', async (previousOwner, newOwner, event) => {
    console.log('event OwnershipTransferred', previousOwner, newOwner, event);

    const dataBlock = await provider.getBlock(event.blockHash);
    const dataTransaction = await provider.getTransaction(event.transactionHash);
    const dataTransactionReceipt = await provider.getTransactionReceipt(event.transactionHash);
    const { timestamp } = dataBlock;
    const { gasPrice, value } = dataTransaction;
    const { from, to, gasUsed } = dataTransactionReceipt;

    const storageTransaction = {
      // event,
      // dataBlock,
      // dataTransaction,
      // dataTransactionReceipt,
      blockHash: event.blockHash,
      contractAddress: event.address,
      transactionHash: event.transactionHash,
      eventName: event.event,
      timestamp,
      itemId,
      price: {
        value: price,
        erc20Address
      },
      previousOwner,
      newOwner,
      from,
      to,
      gasUsed,
      gasPrice,
      value
    };
    // console.log('storageTransaction: ', storageTransaction);

    const data = parseObjectFieldBigNumber(storageTransaction);
    console.log('OwnershipTransferred: ', data);
    // Push message queue
    await messageQueue.producerJob(data);
  });
};

export default SCEvent;
