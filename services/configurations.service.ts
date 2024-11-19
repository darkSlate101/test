import { Configurations } from '../models/Configurations.model';

export const update = async (orgId: any, body: any) => await Configurations.findOneAndUpdate({ orgId }, body, { new: true, upsert: true, runValidators: true, context: "query", setDefaultsOnInsert: true });

export const find = async (filter: {}) => await Configurations.find(filter);

export default {
  update,
  find
};