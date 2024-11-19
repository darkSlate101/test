import { Request, Response } from "express";
import { Types } from "mongoose";
import Service from "../services/Project.service";
import UserService from "../services/user.service";
import EmailService from "../services/email.service";

interface AuthenticatedUser {
  id: Types.ObjectId;
  email: string;
  subscriptions?: [];
  roles: [];
  admin: boolean;
  orgId: Types.ObjectId;
};


// Considering Organisation Owner will create the Projects

export const create = async (req: Request, res: Response) => {

  const user = req.user as AuthenticatedUser;

  try {
    const body = {
      ...req.body,
      userId: user.id,
      orgId: user.id
    };

    if(!body.projectOwnerId) body.projectOwnerId = [user.id];
    
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

    const filter: { userId?: Types.ObjectId, orgId?: Types.ObjectId; _id?: Types.ObjectId, projectOwnerId?: {}  } = {
      orgId: user.orgId ? new Types.ObjectId(user.orgId) : new Types.ObjectId(user.id)
    };
    
    if(reqQuery.id) filter['_id'] = new Types.ObjectId(reqQuery.id as string);
    if(reqQuery.projectOwner) filter['projectOwnerId'] = { $in: [new Types.ObjectId(user.id)] };

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
    
    if(req.body.addAdmins) {
      req.body['$addToSet'] = { projectOwnerId: Array.isArray(req.body.addAdmins) ? req.body.addAdmins : [req.body.addAdmins] };
      delete req.body.addAdmins;
    }
    const body = {
      ...req.body
    };
    
    const filter = {
      _id: req.params.id,
      $or: [{
        userId: user.id
      }, {
        projectOwnerId: { $in: [user.id] }
      }]
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

export const invite = async (req: Request, res: Response) => {
  try {
    /*
    {
        groups: [''],
        users: [{
            _id: '',
            email: '',
            firstName
        }]
    }
    */


    const user = req.user as AuthenticatedUser;

    const projectOwner = await UserService.findOne({ _id: user.id}, ['firstName']);
    if(!projectOwner) return res.send({ status: 404, message: 'Unauthorized!' });

    const exists = await Service.findOne({ 
      _id: req.params.id, 
      $or: [
        { projectOwnerId: { $in: [user.id] }}, 
        { orgId: user.id } 
      ]
    });
    if(!exists) return res.send({ message: 'Unauthorized!' }).status(400);

    const {
      users,
      groups
    } = req.body;


    if(users.length) {
      const emails: any = [];
      const invitations: any = [];

      users.forEach((u: any) => {
        const emailBody = {
          entity: exists.title as string,
          entityType: 'Project',
          ownerName: projectOwner.firstName as string,
          userName: u.firstName as string,
          receiverEmail: u.email as string,
          message: '',
          url: `${process.env.CLIENT_URL}/project/acceptInvite/${exists.id}`
        }

        emails.push(EmailService.sendEntityInvite(emailBody));
        invitations.push({ userId: u._id, status: 'invited' });
      });

      await EmailService.sendMultiple(emails);
      await Service.invite(req.params.id, users);
    }

    if(groups) await Service.addGroups(req.params.id, groups);
    return res.send({ status: 200, message: 'Success' });
  } catch (err) {
    console.log({ err });
    res.send({ status: 500, message: 'Internal Server Error' });
  }
};

export const acceptInvite = async (req: Request, res: Response) => {
    try {
      const user = req.user as AuthenticatedUser;
      if(!user) return res.send({ status: 404, message: 'User not found!' });

      const entity = await Service.findOne({ _id: req.params.id });
      if(!entity) return res.send({ status: 404, message: 'Entity not found!' });
      
      await Service.acceptInvite(req.params.id, user.id);
      
      return res.send({ status: 200, message: 'Success' });
    } catch (err) {
        console.log({ err });
        res.send({ status: 500, message: 'Internal Server Error' });
    }
};

export const requestAccess = async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    const body = {
      projectId: new Types.ObjectId(req.params.id as string),
      userId: user.id,
      requestMessage: req.query.requestMessage as string
    };

    const data = await Service.requestAccess(body);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const grantAccess = async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    
    const isAuthorized = await Service.findOne({ 
      _id: req.params.id, 
      $or: [
        { projectOwnerId: { $in: [user.id] }}, 
        { orgId: user.id } 
      ]
    });
    if(!isAuthorized) return res.send({ message: 'Unauthorized!' }).status(400);
    
    const data = await Service.grantAccess({ userId: req.params.memberId, projectId: req.params.id });
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const handleUserAccess = async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    
    const isAuthorized = await Service.findOne({ 
      _id: req.params.id, 
      $or: [
        { projectOwnerId: { $in: [user.id] }}, 
        { orgId: user.id } 
      ]
    });
    if(!isAuthorized) return res.send({ message: 'Unauthorized!' }).status(400);

    const data = await Service.handleUserAccess({ projectId: req.params.id, userId: req.params.userId }, req.body);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    const filter = {
      projectId: req.params.id
    };
    if(req.query.userId) filter['userId'] = req.query.userId;
    
    const isAuthorized = await Service.findOne({ 
      _id: req.params.id, 
      $or: [
        { projectOwnerId: { $in: [user.id] }}, 
        { orgId: user.id } 
      ]
    });
    if(!isAuthorized) return res.send({ message: 'Unauthorized!' }).status(400);

    const data = await Service.getMembers(filter);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const removeAccess = async (req: Request, res: Response) => {
  const user = req.user as AuthenticatedUser;
  
  try {
    const isAuthorized = await Service.findOne({ 
      _id: req.params.id, 
      $or: [
        { projectOwnerId: { $in: [user.id] }}, 
        { orgId: user.id } 
      ]
    });
    if(!isAuthorized) return res.send({ message: 'Unauthorized!' }).status(400);

    const data = await Service.removeAccess(req.params.id, req.body.groups, req.body.users);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};