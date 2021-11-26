import mongoose from 'mongoose';
import config from '../configs';

mongoose.Promise = global.Promise;

export const connect = async ({
  host = config.mongo.host,
  port = config.mongo.port,
  dbName = config.mongo.name,
  user = config.mongo.username,
  pass = config.mongo.password
} = {}) => {
  let mongoURL = `mongodb://${host}:${port}/${dbName}`;
  if (user && pass) {
    mongoURL = `mongodb://${user}:${pass}@${host}:${port}/${dbName}?authSource=admin&w=1`;
  }

  mongoose.set('debug', true);

  await mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    keepAlive: true,
    connectTimeoutMS: 10000
  });
  return mongoose;
};

export default mongoose;
