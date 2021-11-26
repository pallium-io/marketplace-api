import generateModel from '../../generates/generateModel';

const schema = {
  eventName: String,
  blockHash: String,
  contractAddress: String,
  transactionHash: String,
  timestamp: Number,
  tokenId: Number,
  buyer: String,
  itemId: Number,
  price: {
    value: Number,
    erc20Address: String,
    decimals: String,
    symbol: String,
    name: String
  },
  from: String,
  to: String,
  value: Number,
  quantity: Number,
  type: String,
  bulkTotal: Number,
  gasUsed: Number,
  gasPrice: Number
};

export default generateModel({
  schema,
  modelName: 'Buy',
  collectionName: 'buys'
});
