import { Request, Response } from "express";
import { Types } from "mongoose";
import Service from "../../services/Card/Link.service";
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
      ...req.body
    };

    const exists = await CardService.find({ 
      _id: { 
        $in: [body.parent, body.child],
      },
      userId: user.id 
    });
    if(!exists.length) return res.send({ status: 400, message: 'Unauthorized!' });

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
    const filter: {} = {
      $or: [{
        parent: new Types.ObjectId(req.params.id as string)
      }, {
        child: new Types.ObjectId(req.params.id as string)
      }]
    };
    
    if(reqQuery.id) filter['_id'] = new Types.ObjectId(reqQuery.id as string);

    const query = [{
      $match: filter
    }, {
      $addFields: {
        'linkedCard': {
          '$cond': [
              {
              '$eq': [
                '$parent', '$_id'
              ]
              }, '$parent', '$child'
          ]
        }
      }
    }, {
      $lookup: {
        from: 'cards',
        localField: 'linkedCard',
        foreignField: '_id',
        pipeline: [{
          $project: {
            title: 1
          }
        }],
        as: 'linkedCard'
      }
    }, {
      $unwind: {
        path: '$linkedCard',
        preserveNullAndEmptyArrays: false
      }
    }];

    const data = await Service.aggregate(query);
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

    const link = await Service.findOne({ _id: req.params.id });
    if(!link) return res.send({ status: 400, message: 'Link not found!' });

    const exists = await CardService.find({ 
      _id: { 
        $in: [link.child, link.parent],
      },
      userId: user.id 
    });
    if(!exists.length) return res.send({ status: 400, message: 'Unauthorized!' });

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
  const user = req.user as AuthenticatedUser;

  try {
    const link = await Service.findOne({ _id: req.params.id });
    if(!link) return res.send({ status: 400, message: 'Link not found!' });

    const exists = await CardService.find({ 
      _id: { 
        $in: [link.child, link.parent],
      },
      userId: user.id 
    });
    if(!exists.length) return res.send({ status: 400, message: 'Unauthorized!' });

    const data = await Service.deleteOne({ _id: new Types.ObjectId(req.params.id) });
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};