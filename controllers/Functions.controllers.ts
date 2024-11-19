import { Request, Response } from "express";
import { Types } from "mongoose";
import Service from "../services/Functions.service";
import GroupsService from "../services/Groups.service";
import { checkForAndRoles, getAllowedFunctions } from "helpers";


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
    const orgFilter: { orgId: Types.ObjectId } = { orgId: user.orgId || user.id };
    const groupsFilter: { members: Object } = {
      members: { $in: user.id }
    };
    
    const orgFunctions = await Service.findOne(orgFilter);
    const personalAccess = await Service.getPersonalAccess({ userId: user.id });
    const groups = await GroupsService.find(groupsFilter);

    var data;
    if(orgFunctions && personalAccess && groups) {
      data = getAllowedFunctions(orgFunctions, personalAccess, groups);
    }
    
    
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
    checkForAndRoles(req.body);
    
    const body = {
      ...req.body
    };

    const filter = {
      orgId: user.id
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