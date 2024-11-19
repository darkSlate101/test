import { Card } from '../../models/Cards/Card.model';
import { History, HistoryDocument } from '../../models/Cards/History.model';
import { Types } from "mongoose";

export const create = async (body: any) =>  await Card.create(body);

export const find = async (filter: {}, populate?: any) => await Card.find(filter).populate(populate || []);

export const aggregate = async (query: any) => await Card.aggregate(query);

export const getCardDetails = async (filter: any) => {
  const populate = [{
    $lookup: {
      from: 'tags',
      localField: 'tags',
      foreignField: '_id',
      pipeline: [{
        $project: {
          label: 1
        }
      }],
      as: 'tags'
    }
  }, {
    $lookup: {
      from: 'users',
      localField: 'assignee',
      foreignField: '_id',
      pipeline: [{
        $project: {
          firstName: 1,
          lastName: 1
        }
      }],
      as: 'assignee'
    }
  }, {
    $lookup: {
      from: 'users',
      localField: 'reporter',
      foreignField: '_id',
      pipeline: [{
        $project: {
          firstName: 1,
          lastName: 1
        }
      }],
      as: 'reporter'
    }
  }, {
    $unwind: {
      path: '$reporter',
      preserveNullAndEmptyArrays: true
    }
  }, {
    $lookup: {
      from: 'columns',
      localField: 'columnId',
      foreignField: '_id',
      pipeline: [{
        $project: {
          label: 1,
          position: 1
        }
      }],
      as: 'columnId'
    }
  }, {
    $unwind: {
      path: '$columnId',
      preserveNullAndEmptyArrays: true
    }
  }, {
    $lookup: {
      from: 'milestones',
      localField: '_id',
      foreignField: 'cardId',
      as: 'milestones'
    }
  }, {
    $unwind: {
      path: '$milestones',
      preserveNullAndEmptyArrays: true
    }
  }, {
    $lookup: {
      from: 'links',
      let: {
        selfId: '$_id'
      },
      pipeline: [{
        $match: {
          $expr: {
            "$or": [
              {
                "$eq": ["$parent", "$$selfId"]
              },
              {
                "$eq": ["$child", "$$selfId"]
              }
            ]
          }
        }
      }, {
        $addFields: {
          'linkedCard': {
            '$cond': [
                {
                '$eq': [
                  '$parent', '$$selfId'
                ]
                }, '$child', '$parent'
            ]
          }
        }
      }, {
        $lookup: {
          from: 'cards',
          localField: 'linkedCard',
          foreignField: '_id',
          pipeline: [{
            $project: {
              title: 1,
              type: 1
            }
          }],
          as: 'linkedCard'
        }
      }, {
        $unwind: {
          path: '$linkedCard',
          preserveNullAndEmptyArrays: false
        }
      }],
      as: 'links'
    }
  }, {
    $lookup: {
      from: 'commonlogs',
      localField: '_id',
      foreignField: 'entityId',
      pipeline: [{
        $group: {
          _id: '$entityId',
          count: { $count: {} }
        }
      }],
      as: 'discussions'
    }
  }, {
    $unwind: {
      path: '$discussions',
      preserveNullAndEmptyArrays: true
    }
  }];
  

  if(filter.type === 'backlog' && filter.assignee) populate.push({
    $lookup: {
      from: 'progressboards',
      localField: 'boardId',
      foreignField: '_id',
      as: 'boardId'
    }
  }, {
    $unwind: {
      path: '$boardId',
      preserveNullAndEmptyArrays: true
    }
  });

  const query = [{
    $match: filter
  }, ...populate];

  return await Card.aggregate(query);
};

export const findOne = async (filter: {}) => await Card.findOne(filter);

export const markHistory = async (body: HistoryDocument) => await History.create(body);

export const getHistory = async (filter: {}) => await History.find(filter).populate({
  path: 'userId',
  select: ['firstName', 'lastName']
});

export const update = async (filter: {}, body: {}, userId?: Types.ObjectId) => {
  
  const data = await Card.findOneAndUpdate(filter, body, { new: true });
  if(!data) return null;

  var changes = Object.entries(body).map(el => el[0]);
  
  await History.create({ userId, cardId: data._id, changes });
  return data;
};

export const deleteOne = async (filter: { _id: Types.ObjectId, userId: Types.ObjectId }) => await Card.findOneAndDelete(filter);

export default {
  create,
  aggregate,
  find,
  findOne,
  update,
  deleteOne,
  getHistory,
  getCardDetails
};