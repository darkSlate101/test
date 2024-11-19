import { Document, Schema, model, Types } from 'mongoose';
import { functions } from '../../constants/constants';


interface DOJODocument extends Document {
  status: boolean;
  title: string;
  email: string;
  publicName: string;
  orgId: Types.ObjectId;
  ai: string;
  functions: string[];
  dateStarted: Date;
  chat: boolean;
  code: boolean;
};

const DOJOSchema = new Schema<DOJODocument>({
  orgId: { type: Schema.Types.ObjectId, ref: 'users' },
  title: { type: String, default: 'Dojo' },
  email: { type: String, default: 'dojo@pivitle.com' },
  publicName: { type: String, default: '@Dojo' },
  status: { 
    type: Boolean,
    default: false
  },
  functions: [{
    type: String,
    enum: functions
  }],
  dateStarted: Date,
  chat: {
    type: Boolean,
    default: false
  },
  code: {
    type: Boolean,
    default: false
  },
  ai: {
    type: String
  }
}, { timestamps: true });


const DOJO = model<DOJODocument>('DOJO', DOJOSchema);

export { DOJO, DOJODocument };