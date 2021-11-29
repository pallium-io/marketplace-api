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
  cap: Number,
  supply: Number,
  previousOwner: String,
  newOwner: String,
  gasUsed: Number,
  gasPrice: Number
};

export default generateModel({
  schema,
  modelName: 'Transaction',
  collectionName: 'transactions'
});
