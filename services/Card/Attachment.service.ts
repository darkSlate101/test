import { Attachment } from '../../models/Cards/Attachments.model';
import { Types } from "mongoose";

export const create = async (body: any) =>  await Attachment.create(body);

export const find = async (filter: {}, populate?: any) => await Attachment.find(filter).populate(populate || []);

export const update = async (filter: {}, body: {}) => await Attachment.findOneAndUpdate(filter, body, { new: true });

export const deleteOne = async (filter: { _id: Types.ObjectId }) => await Attachment.findOneAndDelete(filter);

export default {
  create,
  find,
  update,
  deleteOne
};