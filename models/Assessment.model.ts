import { Document, Schema, model, Types } from 'mongoose';


interface AssessmentDocument extends Document {
  userId: Types.ObjectId;
  orgId: Types.ObjectId;
  boardId: Types.ObjectId;
  responses: [];
};

const AssessmentSchema = new Schema<AssessmentDocument>({
  orgId: { type: Schema.Types.ObjectId, ref: 'Users' },
  userId: { type: Schema.Types.ObjectId, ref: 'Users' },
  boardId: { type: Schema.Types.ObjectId, ref: 'ProgressBoard' },
  responses: [{ 
    question: String,
    response: Number
  }]
}, { timestamps: true });


const Assessment = model<AssessmentDocument>('Assessment', AssessmentSchema);

export { Assessment, AssessmentDocument };