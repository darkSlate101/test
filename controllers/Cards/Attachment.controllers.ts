import { Request, Response } from "express";
import { Types } from "mongoose";
import Service from "../../services/Card/Attachment.service";
import CardService from "../../services/Card/Card.service";

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
      cardId: req.params.cardId
    }
    const exists = await CardService.findOne({ _id: body.cardId, orgId: user.orgId || user.id });
    if(!exists) return res.send({ status: 400, message: 'Card not found!' });

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
    const reqQuery = req.query;
    const filter: { 
      userId?: Types.ObjectId; 
      cardId?: Types.ObjectId;
      _id?: Types.ObjectId
    } = {};
    
    if(reqQuery.id) filter['_id'] = new Types.ObjectId(reqQuery.id as string);
    if(reqQuery.cardId) filter['cardId'] = new Types.ObjectId(reqQuery.cardId as string);

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

    const exists = await CardService.findOne({ _id: req.params.cardId, orgId: user.orgId || user.id });
    if(!exists) return res.send({ status: 400, message: 'Card not found!' });

    const data = await Service.update({ _id: req.params.id }, req.body);
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

    const exists = await CardService.findOne({ _id: req.params.cardId, orgId: user.orgId || user.id });
    if(!exists) return res.send({ status: 400, message: 'Card not found!' });

    const data = await Service.deleteOne({ _id: new Types.ObjectId(req.params.id) });
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};