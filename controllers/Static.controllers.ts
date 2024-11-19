import { Request, Response } from "express";
import { subscriptions } from '../config';
import { Types } from "mongoose";
import { sendEmail, createContactUsEmail } from "../services/email.service";
import { Recent } from "../models/recentWorks.model";
import { User } from '../models/user.model';
import { TransformationRoadmap } from '../models/TransformationRoadmap.model';
import { Functions } from '../models/Functions.model';
import { Configurations } from '../models/Configurations.model';
import { DOJO } from '../models/DOJO/DOJO.model';
import { Group } from '../models/Groups/Groups.model';
import { PersonalAccess } from '../models/PersonalAceess.model';
import { Project } from "@models/Projects/Project.model";


interface AuthenticatedUser {
  id: Types.ObjectId;
  email: string;
  subscriptions?: [];
  roles: [];
  admin: boolean;
  orgId: Types.ObjectId;
};

export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    return res.send({ message: 'Success', data: subscriptions }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const sendUserEmail = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    console.log('====================================');
    console.log(body);
    console.log('====================================');
    const email = createContactUsEmail(body);
    await sendEmail(email);
    return res.status(200).send("Success");
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!', data: error });
  }
};

export const getRecent = async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    const reqQuery = req.query;

    const filter = {
      ownerId: new Types.ObjectId(user.id),
      projectId: reqQuery.projectId ? new Types.ObjectId(reqQuery.projectId as string) : { $exists: false }
    };
    if(reqQuery.label) filter['label'] = reqQuery.label;

    const query = [{
      $match: filter
    }, {
      '$lookup': {
        'from': 'transformationroadmaps', 
        'localField': 'contentId', 
        'foreignField': '_id', 
        'as': 'transformations'
      }
    }, {
      '$lookup': {
        'from': 'progressboards', 
        'localField': 'contentId', 
        'foreignField': '_id', 
        'as': 'boards'
      }
    }, {
      '$unwind': {
        'path': '$transformations', 
        'preserveNullAndEmptyArrays': true
      }
    }, {
      '$unwind': {
        'path': '$boards', 
        'preserveNullAndEmptyArrays': true
      }
    }];
    
    const data = await Recent.aggregate(query);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};



// Helpers

export const getContentType = (contentType: string) => {
  if(
    contentType == 'blog' ||
    contentType == 'colab' ||
    contentType == 'TransformationRoadmap'
  ) return 'TransformationRoadmap';

  if(contentType == 'ProgressBoard') return 'ProgressBoard';
};


export const clearDB = async (req: Request, res: Response) => {
  try {
    await User.deleteMany({});
    await TransformationRoadmap.deleteMany({});
    await Recent.deleteMany({});
    await Functions.deleteMany({});
    await Configurations.deleteMany({});
    await DOJO.deleteMany({});
    await Group.deleteMany({});
    await Project.deleteMany({});
    await PersonalAccess.deleteMany({});

    return res.send('Success');
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};