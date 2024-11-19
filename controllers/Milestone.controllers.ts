import { Request, Response } from "express";
import { Types } from "mongoose";
import Service from "../services/Milestone.service";

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
    const filter: { userId?: Types.ObjectId; _id?: Types.ObjectId, projectId?: Types.ObjectId, $or?: object[]  } = {};
    user.admin ? filter['$or'] = [ { 'userId': user.id }, { 'orgId': user.orgId }]  : filter['orgId'] = user.orgId;
    
    if(reqQuery.id) filter['_id'] = new Types.ObjectId(reqQuery.id as string);
    if(reqQuery.name) filter['name'] = { $regex: reqQuery.name, $options: 'i' };
    if(reqQuery.after) filter['date'] = { $gte: reqQuery.after };
    if(reqQuery.before) filter['date'] = { $lte: reqQuery.before };
    if(reqQuery.roadmapId) filter['roadmapId'] = reqQuery.roadmapId;

    const data = await Service.find(filter);
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
    const data = await Service.update(filter, body);
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