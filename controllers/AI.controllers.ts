import { Request, Response } from "express";
import OpenAI from 'openai';

export const chatGPT = async (req: Request, res: Response) => {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    console.log(req.body.question);
    
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: req.body.question }],
      model: 'gpt-3.5-turbo',
    });
  
    console.log(chatCompletion.choices);

    return res.send({ message: 'Success', data: chatCompletion.choices }).status(200);
  } catch (error) {
    console.log('====================================');
    console.log({ error });
    console.log('====================================');
    return res.status(500).send({ error: 'An unexpected error occurred!' });
  }
};