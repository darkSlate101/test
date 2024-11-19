import { commonLogs, CommonLogsDocument } from '../models/CommonLogs.model';
import { History } from '../models/Cards/History.model';
import { Types } from "mongoose";


export const create = async (body: CommonLogsDocument) => {
  if(body.type === 'reaction' || body.type === 'star' || body.type === 'watch' || body.type === 'pin') {
    const filter = {
      entityId: body.entityId, 
      userId: body.userId,
      type: body.type
    };
    if(body.projectId) filter['projectId'] = body.projectId;
    if(body.type === 'reaction') filter['value'] = body.value;

    const exists: any = await commonLogs.findOneAndDelete(filter);

    if(exists) return { ...exists._doc, removed: true };
  }
  const data = await commonLogs.create(body);
  
  if(body.for == 'cards') {
    await History.create({ 
      userId: body.userId, 
      cardId: body.entityId, 
      content: data.value,
      changes: ['comment']
    });
  };
  
  return data;
};

export const find = async ({ entityId }: { entityId: string }, userId: Types.ObjectId) => {
  
  const query = [
    {
      '$facet': {
        'reactionsCount': [
          {
            '$match': {
              'entityId': new Types.ObjectId(entityId), 
              'type': 'reaction'
            }
          }, {
            '$group': {
              '_id': '$value', 
              'count': {
                '$count': {}
              }
            }
          }
        ], 
        'myReaction': [
          {
            '$match': {
              'entityId': new Types.ObjectId(entityId),
              'userId': userId, 
              'type': 'reaction'
            }
          }, {
            '$group': {
              '_id': '$value', 
              'count': {
                '$count': {}
              }
            }
          }
        ],
        'comments': [{
          '$match': {
            'entityId': new Types.ObjectId(entityId),
            'type': 'comment'
          }
        }, 
        // Each Comment's Reply Count
        {
          '$lookup': {
            'from': 'commonlogs', 
            'let': {
              'articleId': '$_id'
            }, 
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$eq': [
                      '$entityId', '$$articleId'
                    ]
                  }, 
                  'type': 'comment'
                }
              }, {
                '$group': {
                  '_id': '$type', 
                  'count': {
                    '$count': {}
                  }
                }
              }
            ], 
            'as': 'comments'
          }
        }, {
          '$unwind': {
            'path': '$comments', 
            'preserveNullAndEmptyArrays': true
          }
        }, 
        // User Data
        {
          '$lookup': {
            'from': 'users',
            'localField': 'userId',
            'foreignField': '_id',
            'pipeline': [{
              '$project': {
                'firstName': 1,
                'lastName': 1
              }
            }],
            'as': 'userId'
          }
        }, {
          '$unwind': {
            'path': '$userId',
            'preserveNullAndEmptyArrays': false
          }
        }, 
        // Reactions Count
        {
          '$lookup': {
            'from': 'commonlogs', 
            'let': {
              'articleId': '$_id'
            }, 
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$eq': [
                      '$entityId', '$$articleId'
                    ]
                  }, 
                  'type': 'reaction'
                }
              }, {
                '$group': {
                  '_id': '$value', 
                  'count': {
                    '$count': {}
                  }
                }
              }
            ], 
            'as': 'reactions'
          }
        }, 
        // My Reaction
        {
          '$lookup': {
            'from': 'commonlogs', 
            'let': {
              'articleId': '$_id'
            }, 
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$eq': [
                      '$entityId', '$$articleId'
                    ]
                  }, 
                  'type': 'reaction', 
                  'userId': userId
                }
              }, {
                '$group': {
                  '_id': '$value', 
                  'count': {
                    '$count': {}
                  }
                }
              }
            ], 
            'as': 'myAction'
          }
        }],
        'stars': [
          {
            '$match': {
              'entityId': new Types.ObjectId(entityId), 
              'type': 'star'
            }
          }, {
            '$group': {
              '_id': '$entityId', 
              'count': {
                '$count': {}
              }
            }
          }
        ],
        'starred': [
          {
            '$match': {
              'entityId': new Types.ObjectId(entityId),
              'userId': userId, 
              'type': 'star'
            }
          }, {
            '$group': {
              '_id': '$userId', 
              'count': {
                '$count': {}
              }
            }
          }
        ],
        'watch': [
          {
            '$match': {
              'entityId': new Types.ObjectId(entityId),
              'userId': userId, 
              'type': 'watch'
            }
          }, {
            '$group': {
              '_id': '$userId', 
              'count': {
                '$count': {}
              }
            }
          }
        ],
        'pinned': [
          {
            '$match': {
              'entityId': new Types.ObjectId(entityId),
              'userId': userId, 
              'type': 'pin'
            }
          }, {
            '$group': {
              '_id': '$userId', 
              'count': {
                '$count': {}
              }
            }
          }
        ],
      }
    }
  ];

  const data = await commonLogs.aggregate(query);
  return data;
};

export const getPins = async (body : { userId: Types.ObjectId, for: string, projectId?: any }) => {
  const filter = {
    userId: new Types.ObjectId(body.userId),
    type: 'pin',
    for: body.for,
    projectId: body.projectId
  };

  const query = [{
    $match: filter
  }, {
    $lookup: {
      from: body.for,
      localField: 'entityId',
      foreignField: '_id',
      pipeline: [{
        $project: {
          title: 1,
          label: 1
        }
      }],
      as: 'entity'
    }
  }, {
    $unwind: {
      path: '$entity',
      preserveNullAndEmptyArrays: false
    }
  }];

  const list = await commonLogs.aggregate(query);
  return list;
};

export const update = async (filter: {}, body: any) => await commonLogs.findOneAndUpdate(filter, body, { new: true }).populate('userId');

export const deleteOne = async (filter: {}) => await commonLogs.findOneAndDelete(filter);

export default {
  create,
  find,
  update,
  deleteOne,
  getPins
};