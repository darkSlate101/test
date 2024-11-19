import { Types } from 'mongoose';
import { DOJO, DOJODocument } from '../models/DOJO/DOJO.model';
import { Suggestion } from '../models/DOJO/Suggestions.model';
import OpenAI from 'openai';

export const update = async (orgId: any, body: DOJODocument) => await DOJO.findOneAndUpdate({ orgId }, body, { new: true, upsert: true, runValidators: true, context: "query", setDefaultsOnInsert: true });

export const find = async (filter: {}) => await DOJO.find(filter);

export const getSuggestions = async (entityType: string, entityId: string, userId: any) => {
  const filter = { entityId: new Types.ObjectId(entityId), entityType };
  const actionsQuery = [
    {
      '$lookup': {
        'from': 'commonlogs', 
        'localField': '_id', 
        'foreignField': 'entityId', 
        'as': 'comments', 
        'pipeline': [
          {
            '$match': {
              'type': 'comment'
            }
          }, {
            '$group': {
              '_id': '$type', 
              'count': {
                '$count': {}
              }
            }
          }
        ]
      }
    }, {
      '$unwind': {
        'path': '$comments', 
        'preserveNullAndEmptyArrays': true
      }
    }, {
      '$lookup': {
        'from': 'commonlogs', 
        'localField': '_id', 
        'foreignField': 'entityId', 
        'as': 'reactions', 
        'pipeline': [
          {
            '$match': {
              'type': 'reaction'
            }
          }, {
            '$group': {
              '_id': '$value', 
              'count': {
                '$count': {}
              }
            }
          }, {
            '$project': {
              'k': '$_id', 
              'v': '$count', 
              '_id': 0
            }
          }
        ]
      }
    }, {
      '$addFields': {
        'reactions': {
          '$arrayToObject': '$reactions'
        }
      }
    }
  ];
  const query = [{
    $match: filter
  }, ...actionsQuery];
  
  return await Suggestion.aggregate(query);
};

export const requestSuggestions = async (entityType: string, entityId: string, data: object, cardId: Types.ObjectId[]) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = getPrompt(entityType, data);
  
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-3.5-turbo',
  });

  await Suggestion.create({
    entityId, 
    entityType,
    prompt,
    suggestion: chatCompletion.choices[0]?.message?.content,
    cardId
  });

  return chatCompletion.choices;
};

export const deleteDOJOSuggestions = async (filter: any) => await Suggestion.deleteMany(filter);


// Helpers
const getPrompt = (entityType: string, data: object) => `Review the following information from each cards and provide a strategic plan and or suggestion. 
The cards are: ${JSON.stringify(data)}`;

export default {
  update,
  find,
  requestSuggestions,
  getSuggestions,
  deleteDOJOSuggestions
};