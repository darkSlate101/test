import { Request, Response } from "express";
import Service from "../services/Chat.service";
import { Types } from "mongoose";
import { ChatDocument } from "../models/Chat.model";


export const create = async (req: Request, res: Response) => {

  try {
    const body = {
      userId: new Types.ObjectId(req.query.userId as string),
      question: req.query.question as string,
    } as ChatDocument;

    const data = await Service.create(body);
    return res.send({ message: 'Success', data }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { userId }= req.query;

    const data = await Service.find({ userId });
    return res.status(200).send({ message: "Success", data });
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!', data: error });
  }
};

export const deleteMany = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    const data = await Service.deleteMany({ userId });
    return res.status(200).send({ message: "Success", data });
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!', data: error });
  }
};