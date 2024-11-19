import { Document, Schema, model, Types } from 'mongoose';


interface ProgressBoardDocument extends Document {
    orgId: Types.ObjectId;
    projectId: Types.ObjectId;
    boardType: string;
    userId: Types.ObjectId;
    title: string;
    teamId: Types.ObjectId;
    description: string;
    startDate: Date;
    endDate: Date;
    locked: boolean;
    groups: Types.ObjectId[];
    allowedOnly: object[];
};

const ProgressBoardSchema = new Schema<ProgressBoardDocument>({
    orgId: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    projectId: {
        type: Schema.Types.ObjectId, 
        ref: 'Project'
    },
    boardType: {
        type: String,
        enum: ['kanban', 'scrum', 'retrospective'],
        required: true 
    },
    userId: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    title: {
        type: String, 
        required: true 
    },
    teamId: {
        type: Schema.Types.ObjectId, 
        ref: 'teams',
        required: true 
    },
    description: {
        type: String
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    locked: {
        type: Boolean,
        default: false
    },
    allowedOnly: [{
        userId: {
            type: Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['invited', 'joined']
        }
    }],
    groups: [{
        type: Schema.Types.ObjectId,
        ref: 'Group'
    }]
}, { timestamps: true });


const ProgressBoard = model<ProgressBoardDocument>('ProgressBoard', ProgressBoardSchema);

export { ProgressBoard, ProgressBoardDocument };