import { Request, Response } from "express";
import { Types } from "mongoose";
import CommonLogsService from "../services/CommonLogs.service";

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
    const entityId = req.params.id;
    const body = {
      entityId,
      ...req.body,
      userId: user.id
    }

    const data = await CommonLogsService.create(body);
    
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
    const entityId = req.params.id;

    const filter: { entityId: string } = { entityId: String(entityId) };

    const data = await CommonLogsService.find(filter, new Types.ObjectId(user.id));

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
    const data = await CommonLogsService.update(filter, body);
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
    const data = await CommonLogsService.deleteOne(filter);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const reply = async (req: Request, res: Response) => {

  const user = req.user as AuthenticatedUser;

  try {
    const body = { $push: { replies: { ...req.body, userId: user.id } } };
    const filter = { _id: req.params.id };
    const data = await CommonLogsService.update(filter, body);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const getPins = async (req: Request, res: Response) => {
  const user = req.user as AuthenticatedUser;
  if(!req.query.for) return res.status(400).send({ error: 'Please provide "for" in query!' });

  const filter = { 
    userId: user.id,
    for: req.query.for as string
  };
  filter['projectId'] = req.query.projectId ? new Types.ObjectId(req.query.projectId as string) : { $exists: false };
  
  const data = await CommonLogsService.getPins(filter);
  
  return res.status(200).send({ message: "Success", data });
};