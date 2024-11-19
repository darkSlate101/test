import { Document, Schema, model, Types } from 'mongoose';
import { roles, functions } from '../../constants/constants';

interface GroupDocument extends Document {
  members: [Types.ObjectId];
  name: string;
  userId: Types.ObjectId;
  orgId: Types.ObjectId;
  description: string;
  functions: [{
    name: string,
    roles: string[]
  }],
  projects: Types.ObjectId[]
};

const GroupSchema = new Schema<GroupDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
  orgId: { type: Schema.Types.ObjectId, ref: 'users' },
  name: { type: String, required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'users' }],
  description: {
    type: String
  },
  functions: [{
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
  }],
  projects: [{
    type: Schema.Types.ObjectId,
    ref: 'Project'
  }]
});


const Group = model<GroupDocument>('Group', GroupSchema);

export { Group, GroupDocument };