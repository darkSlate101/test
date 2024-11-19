import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import GroupsService from '../services/Groups.service';
import { functionsDefaultAccess } from 'constants/constants';

interface User {
  id: Types.ObjectId;
  email: string;
  subscriptions?: [];
  roles: string[];
  admin?: boolean,
  orgId: Types.ObjectId;
};

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
};

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  
  // get the token from the header if present
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  // if no token found, return response (without going to the next middleware)
  if (!token) {
    return res.send('You are UnAuthorized to View this content!').status(401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as User;
    if(decoded.roles && decoded.roles.includes('System Administrator' || 'orgAdmin' || 'functionAdmin')) decoded.admin = true;
    req.user = decoded;
    next();
  } catch (ex) {
    console.error('Invalid Token!', ex);
    res.send('Invalid Token!').status(400);
  }
};

export function checkAccess(functionType: string, action: string) {

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      if(functionsDefaultAccess[user.roles[0][functionType][action]]) return next();
      
      const UserGroups = await GroupsService.find({ members: { $in: [user?.id] }, functions: { $in: { name: functionType } } });
      if(UserGroups[0] && functionsDefaultAccess[user.roles[0][functionType][action]]) return next();

      return res.send('You are UnAuthorized to View this content!').status(401);
    } catch (ex) {
      console.error(ex);
      res.send('Invalid Token!').status(400);
    }
  }
};

export function allowOnly(roles: string[]) {

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      if(roles.includes(user.roles[0])) return next();

      return res.send('You are UnAuthorized to View this content!').status(401);
    } catch (ex) {
      console.error(ex);
      res.send('Invalid Token!').status(400);
    }
  }
};