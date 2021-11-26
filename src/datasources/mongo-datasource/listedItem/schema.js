import generateModel from '../../generates/generateModel';

const schema = {
  eventName: String,
  blockHash: String,
  contractAddress: String,
  transactionHash: String,
  timestamp: Number,
  buyer: String,
  itemId: {
    type: Number,
    unique: true
  },
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
  gasUsed: Number,
  gasPrice: Number,
  bulkTotal: Number,
  cap: Number,
  supply: Number
};

export default generateModel({
  schema,
  modelName: 'ListedItem',
  collectionName: 'listed_items'
});
