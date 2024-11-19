import { Request, Response } from "express";
import { Types } from "mongoose";
import Service from "../services/TransformationRoadmap.service";

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
    const filter: { 
      userId?: Types.ObjectId; 
      _id?: Types.ObjectId; 
      projectId?: Types.ObjectId; 
      $or?: object[]; 
      label?: string 
      orgId?: Types.ObjectId;
    } = {};
    
    if(user.admin) {
      filter['$or'] = [ { 'userId': new Types.ObjectId(user.id) }, { 'orgId': new Types.ObjectId(user.orgId) }];
    } else if (user.orgId) {
      filter['orgId'] = new Types.ObjectId(user.orgId);
    } else {
      return res.send({ message: 'Cannot find user' }).status(404);
    };
    
    filter['entityId'] = reqQuery.entityId ? new Types.ObjectId(reqQuery.entityId as string) : { '$exists': false };
    if(reqQuery.id) filter['_id'] = new Types.ObjectId(reqQuery.id as string);
    if(reqQuery.projectId) filter['projectId'] = new Types.ObjectId(reqQuery.projectId as string);
    if(reqQuery.label) filter['label'] = reqQuery.label as string;

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

export const publish = async (req: Request, res: Response) => {

  const user = req.user as AuthenticatedUser;

  try {
    const notify: boolean = Boolean(req?.query?.notify);

    const filter = {
      _id: req.params.id,
      userId: user.id
    };
    
    const data = await Service.publish(filter, notify);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const restrictions = async (req: Request, res: Response) => {

  const user = req.user as AuthenticatedUser;

  try {
    const filter = {
      _id: req.params.id,
      userId: user.id
    };
    
    const data = await Service.update(filter, req.body);
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
      _id: req.params.id
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

export const moveElement = async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    const filter = {
      userId: user.id,
      _id: req.params.id
    }
    const body = {};
    req.query.entityId ? body['entityId'] = req.query.entityId : body['$unset'] = { entityId: '' };
    const data = await Service.update(filter, body);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};