import { Document, Schema, model, Types } from 'mongoose';


interface AttachmentDocument extends Document {
    userId: Types.ObjectId;
    cardId: Types.ObjectId;
    content: string;
    comment: string;
    name: string;
    size: string;
};

const AttachmentSchema = new Schema<AttachmentDocument>({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Users' 
    },
    cardId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Card' 
    },
    content: { 
        type: String 
    },
    comment: { 
        type: String 
    },
    name: { 
        type: String 
    },
    size: { 
        type: String 
    }
}, { timestamps: true });


const Attachment = model<AttachmentDocument>('Attachment', AttachmentSchema);

export { Attachment, AttachmentDocument };