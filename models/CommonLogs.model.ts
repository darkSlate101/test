import { model, Schema, Document } from "mongoose";

export interface CommonLogsDocument extends Document {
  entityId: Schema.Types.ObjectId,
  projectId: Schema.Types.ObjectId,
  value: string,
  for: string,
  type: string,
  userId: Schema.Types.ObjectId,
  replies: []
}

const commonLogsSchema = new Schema<CommonLogsDocument>({
  entityId: {
    type: Schema.Types.ObjectId
  },
  value: {
    type: String
  },
  for: {
    type: String,
    enum: ["comments", "transformationroadmaps", "blogs", 'progressboards', "cards", 'dojo']
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  type: {
    type: String,
    enum: ["comment", "reaction", "star", "pin", "watch", 'thumbsUp', 'thumbsDown']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  replies: {
    type: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      value: {
        type: String
      }
    }],
    default: []
  }
}, {
  timestamps: true
});

export const commonLogs = model<CommonLogsDocument>("commonLogs", commonLogsSchema);

export default commonLogs;