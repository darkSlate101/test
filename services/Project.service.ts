import UserModel from '../models/user.model';
import EmailService from "../services/email.service";
import { Project, ProjectDocument } from '../models/Projects/Project.model';
import { ProjectAccess } from '../models/Projects/ProjectsAceess.model';
import { commonLogs } from '../models/CommonLogs.model';
import { Types } from "mongoose";
import { defaultProjectFunctionsAccess } from '../constants/constants';
import GroupsService from './Groups.service';


export const create = async ({
  description,
  userId,
  orgId,
  title,
  projectOwnerId,
  status
}: ProjectDocument) => await Project.create({ description, userId, orgId, title, status, projectOwnerId });

export const find = async (filter: {}) => {
  const query = [{
    $match: filter
  }, {
    $lookup: {
      from: 'users',
      localField: 'projectOwnerId',
      foreignField: '_id',
      pipeline: [{
        $project: {
          firstName: 1,
          lastName: 1,
        }
      }],
      as: 'projectOwnerId'
    }
  }, {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      pipeline: [{
        $project: {
          firstName: 1,
          lastName: 1,
          profilePhoto: 1,
          email: 1
        }
      }],
      as: 'userId'
    }
  }, {
    $unwind: {
      path: '$userId',
      preserveNullAndEmptyArrays: false
    }
  }, {
    $lookup: {
      from: 'users',
      localField: 'members',
      foreignField: '_id',
      pipeline: [{
        $project: {
          firstName: 1,
          lastName: 1,
        }
      }],
      as: 'members'
    }
  }];

  return await Project.aggregate(query);
};

export const findOne = async (filter: {}) => await Project.findOne(filter);

export const update = async (filter: {}, {
  subProjects,
  content,
  title,
  active,
  projectOwnerId,
  description,
  $addToSet
}: {
  subProjects?: [],
  projectOwnerId?: [],
  content?: string,
  title?: string,
  active?: boolean,
  description?: string,
  $addToSet?: {}
}) => {
  const body = {};
  if(subProjects) body['subProjects'] = subProjects;
  if(content) body['content'] = content;
  if(title) body['title'] = title;
  if(active) body['active'] = active;
  if(projectOwnerId) body['projectOwnerId'] = projectOwnerId;
  if(description) body['description'] = description;
  if($addToSet) body['$addToSet'] = $addToSet;

  const updatedDoc = await Project.findOneAndUpdate(filter, body);
  const match = await find({ _id: new Types.ObjectId(updatedDoc?._id)});
  const data = match[0];
  return data;
}

export const addGroups = async (projectId: string, groups: []) => await GroupsService.updateMany({ _id: groups.map((el: any) =>el) }, { $addToSet: { projects: projectId } });

export const requestAccess = async (body: {
  projectId: Types.ObjectId,
  userId: Types.ObjectId,
  requestMessage: string
}) => {
  const user = await UserModel.findById(body.userId);
  if(!user) return new Error('User not found!');

  const project = await Project.findById(body.projectId).populate({
    path: 'projectOwnerId',
    select: 'email'
  }) as any;
  if(!project) return new Error('Project not found!');

  const receivers = project.projectOwnerId.map((el: any) => el.email);

  const email = EmailService.requestAccess(
    'Project',
    receivers, 
    process.env.CLIENT_URL as string + '/project/' + project._id + '/grantAccess/' + user._id, 
    `${user.firstName} ${user.lastName}`, 
    project.title,
    body.requestMessage
  );
  await EmailService.sendEmail(email);
  return true;
};

export const invite = async (projectId: string, users: []) => await ProjectAccess.insertMany(users.map((el: any) => ({ userId: el._id, projectId, functions: defaultProjectFunctionsAccess, status: 'invited' })))

export const acceptInvite = async (projectId: string, userId: any) => await ProjectAccess.findOneAndUpdate({ projectId, userId, status: 'invited'}, { status: 'joined' });

export const grantAccess = async (body: {}) => await ProjectAccess.create({ ...body, functions: defaultProjectFunctionsAccess });

export const getUserAccess = async (filter: {}) => await ProjectAccess.findOne(filter);

export const handleUserAccess = async (filter: {}, body: any) => await ProjectAccess.findOneAndUpdate(filter, body, { upsert: true, new: true });

export const getMembers = async (filter: any) => await ProjectAccess.find(filter).populate({
  path: 'userId',
  select: ['firstName', 'lastName']
});

export const removeAccess = async (projectId: string, groups: [] , users: []) => {
  await GroupsService.updateMany({ _id: groups }, { $pull: { projects: projectId } });
  await ProjectAccess.deleteMany({ userId: users, projectId });
};

export const deleteOne = async (filter: {}) => {
  const data = await Project.findOneAndDelete(filter);
  if (data) commonLogs.deleteMany({ entityId: data._id });
  return data;
}

export default {
  create,
  find,
  findOne,
  update,
  deleteOne,
  requestAccess,
  grantAccess,
  getUserAccess,
  handleUserAccess,
  getMembers,
  addGroups,
  invite,
  acceptInvite,
  removeAccess
};