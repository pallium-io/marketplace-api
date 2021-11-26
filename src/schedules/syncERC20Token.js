import { ethers } from 'ethers';
import generateDS from '../datasources';
import configSC from '../configs/configSC.dev.js';
import { connect as connectMongoDB } from '../external-libs/mongoose';

const { ERC20Token } = generateDS;

const run = async () => {
  await connectMongoDB();

  const provider = new ethers.providers.JsonRpcProvider(configSC.networkSC, {
    chainId: configSC.chainIdSC
  });
  const contract = new ethers.Contract(configSC.nftCrowdsale, JSON.parse(configSC.nftCrowdsaleABI), provider);
  const nft = new ethers.Contract(configSC.nftAddress, JSON.parse(configSC.nftABI), provider);

  console.log('provider: ', provider);
  // const contract = new ethers.Contract(configSC.nftCrowdsale, JSON.parse(configSC.nftCrowdsaleABI), provider);

  // const tokenDecimal = await tokenInst.methods.decimals().call();
  // const tokenName = await tokenInst.methods.name().call();
  // const tokenSymbol = await tokenInst.methods.symbol().call();
  return;
  const erc20Address = '';
  const params = {};

  const result = await ERC20Token.collection.findOneAndUpdate({ erc20Address }, params, {
    new: true,
    upsert: true // Make this update into an upsert
  });
  console.log('result: ', result);
};

run();
