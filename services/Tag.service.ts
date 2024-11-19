import { Tag } from '../models/Tag.model';
import { Types } from "mongoose";

export const create = async (body: any) =>  await Tag.create(body);

export const find = async (filter: {}) => await Tag.find(filter);

export const findOne = async (filter: {}) => await Tag.findOne(filter);

export const update = async (filter: {}, body: {}) => await Tag.findOneAndUpdate(filter, body, { new: true });

export const deleteOne = async (filter: { _id: Types.ObjectId, userId: Types.ObjectId }) => await Tag.findOneAndDelete(filter);

export default {
  create,
  find,
  findOne,
  update,
  deleteOne
};