import { ProgressBoard } from '../models/Boards/ProgressBoard.model';
import { Assessment, AssessmentDocument } from '../models/Assessment.model';
import { commonLogs } from '../models/CommonLogs.model';
import { Column } from '../models/Boards/Column.model';
import { Card } from '../models/Cards/Card.model';
import { Recent } from '../models/recentWorks.model';
import { Types } from 'mongoose';
import { getCardDetails } from './Card/Card.service';

export const create = async (body: any) => {
  const data = await ProgressBoard.create(body);
  if(body.columns) await Column.insertMany(body.columns.map((c: any) => ({ ...c, boardId: data._id })));
  
  await Recent.create({ 
    projectId: body.projectId, 
    ownerId: body.userId, 
    label: 'ProgressBoard', 
    contentId: data._id,
    actionBy: body.userId,
    actionType: 'created'
  });

  return data;
};

export const find = async (filter: {}, populate?: any) => await ProgressBoard.find(filter).populate(populate || []);

export const getColumns = async (filter: any) => {
  const board = await ProgressBoard.findOne({ $or: filter.$or, _id: filter.boardId });
  if(!board) return null;

  const columnFilter = { boardId: filter.boardId };
  if(filter._id) columnFilter['_id'] = filter._id;

  const query = [{
    $match: columnFilter
  }, {
    $lookup: {
      from: 'cards',
      localField: '_id',
      foreignField: 'columnId',
      as: 'cards'
    }
  }];
  return await Column.aggregate(query);
};

export const createColumn = async (body: any) => await Column.create(body);

export const updateColumn = async (filter: any, body: any) => await Column.findOneAndUpdate(filter, body);

export const deleteColumn = async (filter: any) => {
  await Card.deleteMany({ columnId: filter._id });
  return await Column.findOneAndDelete(filter);
};

export const findOne = async (filter: {}, populate?: any) => await ProgressBoard.findOne(filter).populate(populate || []);

export const findById = async (_id: Types.ObjectId, populate?: any) => await ProgressBoard.findById(_id).populate(populate || []);

export const update = async (filter: {}, body: {}) => {
  const data = await ProgressBoard.findOneAndUpdate(filter, body, { new: true });

  await Recent.create({ 
    projectId: data?.projectId, 
    ownerId: data?.userId, 
    contentType: 'ProgressBoard', 
    contentId: data?._id,
    actionBy: data?.userId,
    actionType: 'updated'
  });

  return data;
};

export const deleteOne = async (filter: {}) => {
  const data = await ProgressBoard.findOneAndDelete(filter);
  if (data) commonLogs.deleteMany({ entityId: data._id });
  return data;
}

export const createAssessment = async (body: AssessmentDocument) => await Assessment.create(body);

export const getDOJOData = async (filter: object) => {

  const cards = await getCardDetails(filter);
  if(!cards.length) return null;

  return cards.map((el: any) => ({
    "Feature name": el.title,
    "Card description": el.description,
    "Type of card": el.type,
    "Card Priority": el.priority,
    "Assigned to": el.assignee ? el.assignee.firstName?.firstName + el.assignee?.lastName : '',
    "Discussions": '',
    "Reporter": el.reporter,
    "Effort": el.effort,
    "Business Value": el.businessValue,
    "Start date": el.startDate,
    "Target date": el.targetDate,
    "% Completed": el.completed,
    "Links": el.links
  }));
};


export default {
  create,
  find,
  findOne,
  findById,
  update,
  deleteOne,
  getColumns,
  updateColumn,
  deleteColumn,
  createColumn,
  createAssessment,
  getDOJOData
};