import { Request, Response } from "express";
import { Types } from "mongoose";
import UserService from "../services/user.service";
import Service from "../services/ProgressBoard.service";
import EmailService from "../services/email.service";
import DOJOService from "../services/DOJO.service";

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
      projectId: any; 
      $or?: object[]; 
      title?: object;
      boardType?: string;
      orgId?: Types.ObjectId;
    } = {
      projectId: reqQuery.projectId ? new Types.ObjectId(reqQuery.projectId as string) : { $exists: false }
    };
    
    if(user.admin) {
      filter['$or'] = [ { 'userId': new Types.ObjectId(user.id) }, { 'orgId': new Types.ObjectId(user.orgId) }];
    } else if (user.orgId) {
      filter['orgId'] = new Types.ObjectId(user.orgId);
    } else {
      return res.send({ message: 'Cannot find user' }).status(404);
    };
    
    if(reqQuery.id) filter['_id'] = new Types.ObjectId(reqQuery.id as string);
    if(reqQuery.projectId) filter['projectId'] = new Types.ObjectId(reqQuery.projectId as string);
    if(reqQuery.title) filter['title'] = { $regex: reqQuery.title as string, $options: 'i' };
    if(reqQuery.boardType) filter['boardType'] = reqQuery.boardType as string;

    const data = await Service.find(filter, ['teamId']);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const createColumn = async (req: Request, res: Response) => {

  // const user = req.user as AuthenticatedUser;

  try {
    const body = {
      ...req.body
    }

    const data = await Service.createColumn(body);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const getColumns = async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    const reqQuery = req.query;
    const filter: { 
      userId?: Types.ObjectId;
      _id?: Types.ObjectId; 
      boardId?: Types.ObjectId; 
      $or?: object[];
      orgId?: Types.ObjectId;
    } = {};
    
    if(user.admin) {
      filter['$or'] = [ { 'userId': new Types.ObjectId(user.id) }, { 'orgId': new Types.ObjectId(user.orgId) }];
    } else if (user.orgId) {
      filter['orgId'] = new Types.ObjectId(user.orgId);
    } else {
      return res.send({ message: 'Cannot find user' }).status(404);
    };
    
    if(reqQuery.id && reqQuery.boardId) filter['_id'] = new Types.ObjectId(reqQuery.id as string);
    if(reqQuery.boardId) filter['boardId'] = new Types.ObjectId(reqQuery.boardId as string);
    
    const data = await Service.getColumns(filter);
    if(!data) return res.send({ status: 400, message: 'Board not found!' });
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const updateColumn = async (req: Request, res: Response) => {

  // const user = req.user as AuthenticatedUser;

  try {
    const body = {
      ...req.body
    };

    const filter = {
      _id: req.params.id
    };
    const data = await Service.updateColumn(filter, body);
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

export const deleteColumn = async (req: Request, res: Response) => {
  try {
    // const user = req.user as AuthenticatedUser;
    const filter = {
      _id: req.params.id
    }
    const data = await Service.deleteColumn(filter);
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
            firstName: '',
            email: ''
        }],
        message: ''
    }
    */


    const user = req.user as AuthenticatedUser;
    
    const owner = await UserService.findOne({ _id: user.id }, ['firstName']);
    if(!owner) return res.send({ status: 404, message: 'Unauthorized!' })

    const exists = await Service.findOne({ _id: req.params.id, userId: user.id }, ['projectId']);
    if(!exists) return res.send({ status: 404, message: 'Board not found!' });

    const {
      users,
      groups,
      message
    } = req.body;


    if(users.length) {
      const emails: any = [];
      const invitations: any = [];

      const CLIENT_ROUTE = 'progressBoard/acceptInvite';
      const invitees: any = [];

      users.forEach((u: any) => {
        const uExist = exists.allowedOnly.filter((e: any) => e.userId == u._id);
        if(!uExist.length) invitees.push(u);
      });

      invitees.forEach((u: any) => {
        const emailBody = {
          entity: exists.title as string,
          entityType: 'Progress Board',
          ownerName: owner.firstName as string,
          userName: u.firstName as string,
          receiverEmail: u.email as string,
          message: message as string,
          url: `${process.env.CLIENT_URL}/${CLIENT_ROUTE}/${exists._id}`
        }
        if(exists.projectId) emailBody['entityProject'] = (exists.projectId as any).title as string

        emails.push(EmailService.sendEntityInvite(emailBody));
        invitations.push({ userId: u._id, status: 'invited' });
      });

      await EmailService.sendMultiple(emails);
      await Service.update({ _id : req.params.id }, { $addToSet: { allowedOnly: invitations } });
    }

    if(groups) await Service.update({ _id: req.params.id }, { $addToSet: { groups: req.body.groups } })
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

      const board = await Service.findById(new Types.ObjectId(req.params.id));
      if(!board) return res.send({ status: 404, message: 'Board not found!' });
      
      const joined = board.allowedOnly.filter((member: any) => member.userId != user.id && member.status !== 'invited');
      if(joined.length === board.allowedOnly.length) return res.send({ status: 400, message: 'No invitation found for this user!' });

      const body = { allowedOnly: [ ...joined, { userId: user.id, status: 'joined' } ] };
      await Service.update({ _id: board._id }, body);

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
      boardId: new Types.ObjectId(req.params.id as string),
      userId: user.id,
      requestMessage: req.query.requestMessage as string
    };

    const userExists = await UserService.findOne({ _id: user.id }, ['firstName', 'lastName']);
    if(!userExists) return res.send({ message: 'User not found!' }).status(400);

    const exists = await Service.findById(body.boardId, [{
      path: 'userId',
      select: ['email', 'firstName']
    }]);
    if(!exists) return res.send({ message: 'Board not found!' }).status(400);
    
    const email = EmailService.requestAccess(
      'Progress Board',
      (exists.userId as any).email,
      `${process.env.CLIENT_URL}/progressBoard/${exists._id}/grantAccess?memberId=${userExists._id}`,
      `${userExists.firstName} ${userExists.lastName}`, 
      exists.title,
      body.requestMessage,
      (exists.userId as any).firstName
    );
    await EmailService.sendEmail(email);

    return res.send({ message: 'Success' }).status(200);
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

    const board = await Service.findOne({ _id: req.params.id, userId: user.id });
    if(!board) return res.send({ status: 404, message: 'Board not found!' });

    const exists: any[] = board.allowedOnly.filter((u: any) => u.userId == req.params.memberId);

    if(exists.length && exists[0].status == 'invited') {
      const members = board.allowedOnly.filter((u: any) => u.userId != req.params.memberId);
      members.push({ userId: req.params.memberId, status: 'joined' });
      await Service.update({ _id: board._id }, { allowedOnly: members });
    } else if(!exists.length) {
      await Service.update({ _id: board._id }, { $addToSet: { allowedOnly: { userId: req.params.memberId, status: 'joined' } }});
    }

    return res.send({ status: 200, message: 'Success' });
  } catch (err) {
      console.log({ err });
      res.send({ status: 500, message: 'Internal Server Error' });
  }
};


export const createAssessment = async (req: Request, res: Response) => {

  const user = req.user as AuthenticatedUser;

  try {
    const body = {
      ...req.body,
      userId: user.id,
      orgId: user.orgId || user.id,
      boardId: req.params.id
    }

    const data = await Service.createAssessment(body);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const getSuggestions = async (req: Request, res: Response) => {
  const user = req.user as AuthenticatedUser;

  try {
    const data = await DOJOService.getSuggestions('ProgressBoard', req.params.id, user.id);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const requestDOJOSuggestions = async (req: Request, res: Response) => {
  try {
    var cardId = req.query.cardId as any;
    const filter = {
      boardId: new Types.ObjectId (req.params.id)
    };
    if(cardId) {
      cardId = cardId.split(',').map((el: any) => new Types.ObjectId(el));
      filter['_id'] = { $in: cardId };
    }
    const entityData = await Service.getDOJOData(filter);
    if(!entityData) return res.send({ message: 'No data found for this Board!', data: null }).status(400);

    const data = await DOJOService.requestSuggestions('ProgressBoard', req.params.id, entityData, cardId);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const deleteDOJOSuggestion = async (req: Request, res: Response) => {
  try {
    const data = await DOJOService.deleteDOJOSuggestions({ entity: req.params.id });
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
}