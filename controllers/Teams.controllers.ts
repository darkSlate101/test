import { Request, Response } from "express";
import { Types } from "mongoose";
import TeamService from "../services/Teams.service";

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
      name: req.body.name as string,
      createdBy: user.id,
      orgId: user.orgId || user.id
    };

    const exists = await TeamService.findOne(body);
    if(exists) return res.status(400).send({ error: 'Team name already exists!' });

    const data = await TeamService.create(body, req.body.members);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const addMembers = async (req: Request, res: Response) => {

  const user = req.user as AuthenticatedUser;

  try {

    const team = await TeamService.find({ createdBy: user.id, _id: req.body.team });
    if(!team) return res.status(400).send({ error: 'Invalid Request!' });

    const data = await TeamService.addMembers(req.body);
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
    const filter: { member?: Types.ObjectId; _id?: Types.ObjectId, $or?: object[] } = { member: new Types.ObjectId(user.id) };
    if(reqQuery.team) filter['team'] = new Types.ObjectId(reqQuery.team as string);

    const data = await TeamService.getTeams(filter);
    
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
      createdBy: user.id,
      _id: new Types.ObjectId(req.params.id)
    }
    const data = await TeamService.deleteOne(filter);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};