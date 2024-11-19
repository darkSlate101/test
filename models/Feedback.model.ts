import { Document, Schema, model, Types } from 'mongoose';


interface FeedbackDocument extends Document {
  content: string;
  productResearch: boolean;
  contact: boolean;
  userId: Types.ObjectId;
};

const FeedbackSchema = new Schema<FeedbackDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
  productResearch: {
    type: Boolean
  },
  contact: {
    type: Boolean
  },
  content: { type: String }
}, { timestamps: true });


const Feedback = model<FeedbackDocument>('Feedback', FeedbackSchema);

export { Feedback, FeedbackDocument };