import { Request, Response } from "express";
import { Types } from "mongoose";
import Service from "../services/Notifications.service";

interface AuthenticatedUser {
  id: Types.ObjectId;
  email: string;
  subscriptions?: [];
  roles: [];
  admin: boolean;
  orgId: Types.ObjectId;
};

export const get = async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    const reqQuery = req.query;
    const filter: { userId?: Types.ObjectId; _id?: Types.ObjectId, $or?: object[]  } = {};
    user.admin ? filter['$or'] = [ { 'userId': user.id }, { 'orgId': user.orgId }]  : filter['orgId'] = user.orgId;
    
    if(reqQuery.id) filter['_id'] = new Types.ObjectId(reqQuery.id as string);

    const data = await Service.find(filter);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const read = async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;

    const data = await Service.read({ _id: req.params.id, userId: user.id });
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

    const data = await Service.deleteOne({ _id: req.params.id, userId: user.id });
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};