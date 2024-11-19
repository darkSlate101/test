import { Document, Schema, model, Types } from 'mongoose';


interface RecentDocument extends Document {
    projectId: Types.ObjectId;
    contentId: Types.ObjectId;
    ownerId: Types.ObjectId;
    actionBy: Types.ObjectId;
    label: string;
    actionType: string;
};

const RecentSchema = new Schema<RecentDocument>({
    projectId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Project' 
    },
    label: {
        type: String
    },
    contentId: { 
        type: Schema.Types.ObjectId 
    },
    ownerId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    actionBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    actionType: { 
        type: String,
        enum: ['created', 'commented', 'updated']
    }
}, { timestamps: true });


const Recent = model<RecentDocument>('Recent', RecentSchema);

export { Recent, RecentDocument };