import { Request, Response } from "express";
import { Types } from "mongoose";
import service from "../services/Groups.service";
import { checkForAndRoles } from "helpers";
import { defaultPersonalAccess } from "constants/constants";

interface AuthenticatedUser {
  id: Types.ObjectId;
  email: string;
  subscriptions?: [];
  roles: [];
  admin: boolean;
  orgId: Types.ObjectId;
};


// Considering Admin is the Organisation Owner

export const create = async (req: Request, res: Response) => {

  const user = req.user as AuthenticatedUser;

  try {
    const body = {
      ...req.body,
      userId: user.id,
      orgId: user.id,
      functions: defaultPersonalAccess
    }

    const data = await service.create(body);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const get = async (req: Request, res: Response) => {
  const user = req.user as AuthenticatedUser;

  try {
    const reqQuery = req.query;
    const filter: { userId?: Types.ObjectId; _id?: Types.ObjectId, members?: {}, orgId: Types.ObjectId  } = {
      orgId: user.orgId ? new Types.ObjectId(user.orgId) : new Types.ObjectId(user.id)
    };
    
    if(reqQuery.id) filter['_id'] = new Types.ObjectId(reqQuery.id as string);
    if(reqQuery.projects) filter['projects'] = {
      $in: (reqQuery.projects as string).split(",").map((el: string)=> new Types.ObjectId(el))
    };
    if(reqQuery.members) filter['members'] = {
      $in: (reqQuery.members as string).split(",").map((el: string)=> new Types.ObjectId(el))
    };
    const data = await service.find(filter);
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
    if(req?.body?.functions) {
      checkForAndRoles(req.body);
    }

    const body = {
      ...req.body,
      '$addToSet': {},
      '$pull': {}
    };

    if(body.members) {
      body['$addToSet'] = { ...body.$addToSet, members: body.members };
      delete body.members;
    };
    if(body.removedMembers) {
      body['$pull'] = { ...body.$pull, members: { $in: body.removedMembers } };
      delete body.removedMembers;
    }
    if(body.projects) {
      body['$addToSet'] = { ...body.$addToSet, projects: body.projects };
      delete body.projects;
    };
    if(body.removedProjects) {
      body['$pull'] = { ...body.$pull, projects: { $in: body.removedProjects } };
      delete body.removedProjects;
    }

    const filter = {
      _id: req.params.id,
      userId: user.id,
      orgId: user.id
    };
    
    const data = await service.update(filter, body);
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
    const data = await service.deleteOne(filter);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};