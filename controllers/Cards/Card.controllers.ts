import { Request, Response } from "express";
import { Types } from "mongoose";
import Service from "../../services/Card/Card.service";
import ProgressBoardService from '../../services/ProgressBoard.service';

interface AuthenticatedUser {
  id: Types.ObjectId;
  email: string;
  subscriptions?: [];
  roles: [];
  admin: boolean;
  orgId: Types.ObjectId;
};


export const create = async (req: Request, res: Response) => {

  const user = req.user as AuthenticatedUser;

  try {
    const body = {
      ...req.body,
      userId: user.id,
      orgId: user.orgId || user.id
    }
    const filter = { _id: body.boardId };
    if(user.admin) {
      filter['$or'] = [ { 'userId': new Types.ObjectId(user.id) }, { 'orgId': new Types.ObjectId(user.orgId) }];
    } else if (user.orgId) {
      filter['orgId'] = new Types.ObjectId(user.orgId);
    } else {
      return res.send({ message: 'Cannot find user' }).status(404);
    };

    if(body.boardId) {
      const exists = await ProgressBoardService.findOne(filter);
      if(!exists) return res.send({ status: 400, message: 'Board not found!' });
    
      body['teamId'] = exists.teamId;
    }

    const data = await Service.create(body);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const get = async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    const reqQuery = req.query;
    const filter: { 
      userId?: Types.ObjectId; 
      _id?: Types.ObjectId, 
      projectId?: Types.ObjectId,
      teamId?: object,
      boardId?: object,
      type?: string,
      assignee?: object,
      $or?: object[]  
    } = {};
    user.orgId ? filter['orgId'] = new Types.ObjectId(user.orgId) : new Types.ObjectId(user.id);
    
    if(reqQuery.id) filter['_id'] = new Types.ObjectId(reqQuery.id as string);
    if(reqQuery.projectId) filter['projectId'] = new Types.ObjectId(reqQuery.projectId as string);
    if(reqQuery.type) filter['type'] = reqQuery.type as string;
    if(reqQuery.assignee) filter['assignee'] = { $in: [new Types.ObjectId(reqQuery.assignee as string)] };
    if(reqQuery.teamId) filter['teamId'] = { $in: (reqQuery.teamId as string).split(',').map(el => new Types.ObjectId(el as string)) };
    if(reqQuery.teamId) filter['teamId'] = { $in: (reqQuery.teamId as string).split(',').map(el => new Types.ObjectId(el as string)) };
    if(reqQuery.boardId) filter['boardId'] = { $in: (reqQuery.boardId as string).split(',').map(el => new Types.ObjectId(el as string)) };
    if(reqQuery.roadmapId) filter['roadmapId'] = { $in: (reqQuery.roadmapId as string).split(',').map(el => new Types.ObjectId(el as string)) };
    
    const data = await Service.getCardDetails(filter);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const update = async (req: Request, res: Response) => {

  const user = req.user as AuthenticatedUser;

  try {
    const body = {
      ...req.body
    };

    const filter = {
      _id: req.params.id,
      userId: user.id
    };
    
    const data = await Service.update(filter, body, user.id);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    const filter = {
      userId: user.id,
      _id: new Types.ObjectId(req.params.id)
    }
    const data = await Service.deleteOne(filter);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const getHistory = async (req: Request, res: Response) => {

  const user = req.user as AuthenticatedUser;

  try {

    const exists = await Service.findOne({ _id: req.params.id, orgId: user.orgId || user.id });
    if(!exists) return res.send({ status: 400, message: 'Card not found!' });

    const data = await Service.getHistory({ cardId: exists._id });
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};