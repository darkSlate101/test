import { Document, Schema, model, Types } from 'mongoose';


interface MilestoneDocument extends Document {
  name: string;
  description: string;
  date: Date;
  userId: Types.ObjectId;
  cardId: Types.ObjectId;
  roadmapId: Types.ObjectId;
};

const MilestoneSchema = new Schema<MilestoneDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  cardId: { type: Schema.Types.ObjectId, ref: 'Card' },
  roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap' },
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date }
}, {
  timestamps: true
});


const Milestone = model<MilestoneDocument>('Milestone', MilestoneSchema);

export { Milestone, MilestoneDocument };