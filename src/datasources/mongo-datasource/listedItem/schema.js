import { Schema } from 'mongoose';
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
    info: { type: Schema.Types.ObjectId, ref: 'Erc20Token' }
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
