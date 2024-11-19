import { Document, Schema, model, Types } from 'mongoose';


interface ColumnDocument extends Document {
  boardId: Types.ObjectId;
  label: string;
  position: number;
};

const ColumnSchema = new Schema<ColumnDocument>({
  boardId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ProgressBoard',
    required: true 
  },
  label: { 
    type: String, 
    required: true
  },
  position: { 
    type: Number, 
    required: true 
  }
}, { timestamps: true });


const Column = model<ColumnDocument>('Column', ColumnSchema);

export { Column, ColumnDocument };