import { Milestone } from '../models/Milestones.model';
import { Types } from "mongoose";

export const create = async (body: any) =>  await Milestone.create(body);

export const find = async (filter: {}) => await Milestone.find(filter);

export const findOne = async (filter: {}) => await Milestone.findOne(filter);

export const update = async (filter: {}, body: {}) => await Milestone.findOneAndUpdate(filter, body, { new: true });

export const deleteOne = async (filter: { _id: Types.ObjectId, userId: Types.ObjectId }) => await Milestone.findOneAndDelete(filter);

export default {
  create,
  find,
  findOne,
  update,
  deleteOne
};