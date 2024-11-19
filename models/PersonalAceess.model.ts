import { Document, Schema, model, Types } from 'mongoose';
import { roles, functions } from '../constants/constants';


interface PersonalAccessDocument extends Document {
  userId: Types.ObjectId;
  functions: [{
    toObject: any;
    name: string,
    roles: string[],
    for: string[]
  }]
};

const PersonalAccessSchema = new Schema<PersonalAccessDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  functions: {
    type: [{
      name: {
        type: String,
        enum: functions
      },
      roles: {
        type: [{
          type: String
        }],
        enum: roles
      },
      for: {
        type: [{
          type: String
        }],
        enum: ['projects', 'home']
      }
    }]
  }
}, { timestamps: true });


const PersonalAccess = model<PersonalAccessDocument>('PersonalAccess', PersonalAccessSchema);

export { PersonalAccess, PersonalAccessDocument };