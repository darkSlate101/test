import { Document, Schema, model, Types } from 'mongoose';


interface TeamMemberDocument extends Document {
  team: Types.ObjectId;
  member: Types.ObjectId;
  role: String[]
};

const TeamMemberSchema = new Schema<TeamMemberDocument>({
  team: {
    type: Schema.Types.ObjectId,
    ref: 'teams'
  },
  member: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  role: {
    type: [String],
    enum: ['Product Owner', 'Scrum Master', 'Coach', 'DevOps Team', 'Scrum Team', 'QA'],
    default: []
  }
});


const TeamMember = model<TeamMemberDocument>('TeamMembers', TeamMemberSchema);

export { TeamMember, TeamMemberDocument };