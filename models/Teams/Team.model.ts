import { Document, Schema, model, Types } from 'mongoose';


interface TeamDocument extends Document {
  name: string;
  createdBy: Types.ObjectId;
  orgId: Types.ObjectId;
};

const TeamSchema = new Schema<TeamDocument>({
  createdBy: { type: Schema.Types.ObjectId, ref: 'users' },
  orgId: { type: Schema.Types.ObjectId, ref: 'users' },
  name: { type: String, required: true }
});


const Team = model<TeamDocument>('teams', TeamSchema);

export { Team, TeamDocument };