import { Group, GroupDocument } from '../models/Groups/Groups.model';

export const create = async ({
  members,
  name,
  userId,
  description,
  functions,
  projects,
  orgId
}: GroupDocument) => await Group.create({ 
  members,
  name,
  userId,
  orgId,
  projects,
  description,
  functions
});

export const find = async (filter: {}) => await Group.find(filter);

export const getGroups = async (page: number, limit: number, filter: object) => await Group.find(filter, { password: 0 }, { skip: limit*(page-1), limit });

export const update = async (filter: {}, body: {}) => await Group.findOneAndUpdate(filter, body, { new: true });

export const updateMany = async (filter: any, body: any) => await Group.updateMany(filter, body, { new: true });

export const deleteOne = async (filter: {}) => await Group.findOneAndDelete(filter);

export default {
  create,
  find,
  update,
  deleteOne,
  getGroups,
  updateMany
};