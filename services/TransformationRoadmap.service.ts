import { Types } from "mongoose";
import { Recent } from '../models/recentWorks.model';
import { commonLogs } from '../models/CommonLogs.model';
import { TransformationRoadmap } from '../models/TransformationRoadmap.model';


export const create = async ({
  content,
  userId,
  orgId,
  title,
  entityId,
  projectId,
  label
}: any) => {
  const data = await TransformationRoadmap.create({ 
    content, 
    userId, 
    title, 
    orgId,
    entityId,
    projectId,
    label
  });
  
  await Recent.create({
    projectId: data.projectId, 
    ownerId: data.userId,
    label: label && label != '' ? label : 'TransformationRoadmap',
    contentId: data._id,
    actionBy: data.userId,
    actionType: 'created'
  });

  return data;
}

export const find = async (filter: {}) => {

  const query = [{
    '$match': filter
  }, {
    '$lookup': {
      'from': 'transformationroadmaps',
      'localField': '_id', 
      'foreignField': 'entityId', 
      'pipeline': [
        {
          '$group': {
            '_id': '$entityId', 
            'count': {
              '$count': {}
            }
          }
        }
      ], 
      'as': 'subItems'
    }
  }, {
    '$unwind': {
      'path': '$subItems', 
      'preserveNullAndEmptyArrays': true
    }
  }, {
    '$lookup': {
      'from': 'users',
      'localField': 'userId', 
      'foreignField': '_id', 
      'pipeline': [
        {
          '$project': {
            'firstName': 1, 
            'lastName': 1, 
            'profilePhoto': 1
          }
        }
      ], 
      'as': 'userId'
    }
  }, {
    '$unwind': {
      'path': '$userId', 
      'preserveNullAndEmptyArrays': true
    }
  }];
  
  const data = await TransformationRoadmap.aggregate(query);
  return data;
  // await commonLogs.find(filter).populate('userId');
};

// $unset used by move element to remove entityId key
export const update = async (filter: {}, {
  content,
  title,
  edit,
  view,
  allowedOnly,
  entityId,
  $unset
}: {
  content?: string,
  title?: string,
  edit?: string,
  view?: string,
  allowedOnly?: [],
  entityId?: Types.ObjectId,
  $unset?: {}
}) => {
  const body = {
    content, 
    title,
    edit,
    view,
    allowedOnly,
    entityId
  }
  if($unset) body['$unset'] = $unset;
  const updatedDoc = await TransformationRoadmap.findOneAndUpdate(filter, body, { new: true });
  
  const data = await find({ _id: updatedDoc?._id });
  
  console.log(data);
  
  return data[0];
};

export const publish = async (filter: {}, notify: boolean) => {
  const post = await TransformationRoadmap.findOneAndUpdate(filter, { published: true }, { new: true });

  // Notify Watchers
  if(notify) console.log({ notify });
  
  return post;
};

export const deleteOne = async (filter: {}) => {
  const data = await TransformationRoadmap.findOneAndDelete(filter);
  if (data) commonLogs.deleteMany({ entityId: data._id });
  return data;
};

export default {
  create,
  find,
  update,
  deleteOne,
  publish
};