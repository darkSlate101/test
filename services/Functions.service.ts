import { Functions } from '../models/Functions.model';
import { PersonalAccess } from '../models/PersonalAceess.model';


export const findOne = async (filter: {}) => await Functions.findOne(filter).lean();

export const getPersonalAccess = async (filter: {}) => await PersonalAccess.findOne(filter).lean();

export const update = async (filter: {}, body: {}) => await Functions.findOneAndUpdate(filter, body, { new: true });

export default {
  findOne,
  getPersonalAccess,
  update,
};