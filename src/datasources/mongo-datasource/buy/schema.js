import { Schema } from 'mongoose';
import generateModel from '../../generates/generateModel';

const schema = {
  eventName: String,
  blockHash: String,
  contractAddress: String,
  nftAddress: String,
  transactionHash: String,
  timestamp: Number,
  tokenId: Number,
  buyer: String,
  seller: String,
  itemId: Number,
  price: {
    value: Number,
    info: { type: Schema.Types.ObjectId, ref: 'Erc20Token' }
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
