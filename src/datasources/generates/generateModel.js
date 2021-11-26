import mongoose from '../../external-libs/mongoose';
import config from '../../configs';

export default ({ schema, modelName, collectionName }) =>
  mongoose.model(
    modelName,
    new mongoose.Schema(schema, {
      collection: `${config.mongo.prefix}_${collectionName}`,
      versionKey: false,
      strict: false,
      timestamps: true
    })
  );
