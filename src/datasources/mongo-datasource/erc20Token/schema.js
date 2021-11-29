import generateModel from '../../generates/generateModel';

const schema = {
  address: {
    type: String,
    unique: true
  },
  decimals: Number,
  symbol: String,
  name: String
};

export default generateModel({
  schema,
  modelName: 'Erc20Token',
  collectionName: 'erc20Tokens'
});
