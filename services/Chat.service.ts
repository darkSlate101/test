import { Chat, ChatDocument } from '../models/Chat.model';

export const create = async ({
  userId,
  question
}: ChatDocument) => await Chat.create({ userId, question });

export const find = async (filter: {}) => await Chat.find(filter);

export const update = async (filter: {}, {
  subChats,
  content,
  title,
  active
}: {
  subChats: [],
  content: string,
  title: string,
  active: boolean
}) => await Chat.findOneAndUpdate(filter, { subChats, content, title, active }, { new: true });

export const deleteMany = async (filter: {}) => await Chat.deleteMany(filter);

export default {
  create,
  find,
  update,
  deleteMany
};