import { Document, Schema, model, Types } from 'mongoose';
import { roles, functions } from '../../constants/constants';


interface ProjectAccessDocument extends Document {
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
  functions: [],
  status: string,
  active: boolean
};

const ProjectAccessSchema = new Schema<ProjectAccessDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
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
      }
    }]
  },
  status: { 
    type: String,
    enum: ['invited', 'joined'],
    default: 'joined'
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });


const ProjectAccess = model<ProjectAccessDocument>('ProjectAccess', ProjectAccessSchema);

export { ProjectAccess, ProjectAccessDocument };