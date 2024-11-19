import { Roadmap } from '../models/Roadmaps/Roadmap.model';
import { commonLogs } from '../models/CommonLogs.model';
import { Recent } from '../models/recentWorks.model';
import { Types } from 'mongoose';

export const create = async (body: any) => {
  const data = await Roadmap.create(body);
  
  await Recent.create({ 
    projectId: body.projectId, 
    ownerId: body.userId, 
    label: 'Roadmap', 
    contentId: data._id,
    actionBy: body.userId,
    actionType: 'created'
  });

  return data;
};

export const find = async (filter: {}, populate?: any) => {
  const query = [{
    $match: filter
  }, {
    $lookup: {
      from: 'teams',
      localField: 'sources.sourceId',
      foreignField: '_id',
      as: 'Teams'
    }
  }, {
    $lookup: {
      from: 'progressboards',
      localField: 'sources.sourceId',
      foreignField: '_id',
      pipeline: [{
        $project: {
          title: 1
        }
      }],
      as: 'ProgressBoards'
    }
  }];
  return await Roadmap.aggregate(query);
};

export const findOne = async (filter: {}, populate?: any) => await Roadmap.findOne(filter).populate(populate || []);

export const findById = async (_id: Types.ObjectId, populate?: any) => await Roadmap.findById(_id).populate(populate || []);

export const update = async (filter: {}, body: {}) => {
  const data = await Roadmap.findOneAndUpdate(filter, body, { new: true });

  await Recent.create({ 
    projectId: data?.projectId, 
    ownerId: data?.userId, 
    contentType: 'Roadmap', 
    contentId: data?._id,
    actionBy: data?.userId,
    actionType: 'updated'
  });

  return data;
};

export const deleteOne = async (filter: {}) => {
  const data = await Roadmap.findOneAndDelete(filter);
  if (data) commonLogs.deleteMany({ entityId: data._id });
  return data;
};


export default {
  create,
  find,
  findOne,
  findById,
  update,
  deleteOne
};