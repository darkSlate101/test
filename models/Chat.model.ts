import { Document, Schema, model, Types } from 'mongoose';


interface ChatDocument extends Document {
  question: string;
  userId: Types.ObjectId;
};

const ChatSchema = new Schema<ChatDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
  question: { type: String, required: true }
}, {
  timestamps: true
});


const Chat = model<ChatDocument>('Chathistories', ChatSchema);

export { Chat, ChatDocument };