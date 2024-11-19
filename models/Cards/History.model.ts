import { Document, Schema, model, Types } from 'mongoose';


interface HistoryDocument extends Document {
    userId: Types.ObjectId;
    cardId: Types.ObjectId;
    changes: string[];
    content: string;
};

const HistorySchema = new Schema<HistoryDocument>({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    cardId: {
        type: Schema.Types.ObjectId, 
        ref: 'Card'
    },
    changes: [{ 
        type: String
    }],
    content: {
        type: String
    }
}, { timestamps: true });


const History = model<HistoryDocument>('History', HistorySchema);

export { History, HistoryDocument };