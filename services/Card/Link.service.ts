import { Link } from '../../models/Cards/Links.model';
import { Types } from "mongoose";

export const create = async (body: any) =>  await Link.create(body);

export const find = async (filter: {}, populate?: any) => await Link.find(filter).populate(populate || []);

export const aggregate = async (query: any[]) => await Link.aggregate(query);

export const findOne = async (filter: {}, populate?: any) => await Link.findOne(filter).populate(populate || []);

export const update = async (filter: {}, body: {}) => await Link.findOneAndUpdate(filter, body, { new: true });

export const deleteOne = async (filter: { _id: Types.ObjectId }) => await Link.findOneAndDelete(filter);

export default {
  create,
  find,
  aggregate,
  findOne,
  update,
  deleteOne
};