import { Document, Schema, model, Types } from 'mongoose';


interface CardDocument extends Document {
    orgId: Types.ObjectId;
    userId: Types.ObjectId;
    teamId: Types.ObjectId;
    boardId: Types.ObjectId;
    roadmapId: Types.ObjectId;
    columnId: Types.ObjectId;
    parentId: Types.ObjectId;
    type: string;
    title: string;
    status: string;
    description: string;
    acceptance: string;
    assignee: Types.ObjectId;
    reporter: Types.ObjectId;
    priority: string;
    labels: string;
    effort: number;
    businessValue: number;
    valueArea: string;
    category: string;
    migrationPlan: string;
    resolutions: string;
    startDate: Date;
    targetDate: Date;
    completed: number;
    tags: Types.ObjectId[];
    timeline: object;
    closed: boolean;
    iteration: string;
};

const CardSchema = new Schema<CardDocument>({
    orgId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userId: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teamId: { 
        type: Schema.Types.ObjectId,
        ref: 'teams'
    },
    boardId: { 
        type: Schema.Types.ObjectId,
        ref: 'ProgressBoard'
    },
    roadmapId: {
        type: Schema.Types.ObjectId,
        ref: 'Roadmap'
    },
    columnId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Column'
    },
    type: {
        type: String,
        required: true,
        enum: ['epic', 'feature', 'impediment', 'backlog', 'task', 'testCase', 'defect', 'story', 'subtask']
    },
    title: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        default: 'newItem',
        enum: ['newItem', 'inProgress', 'new', 'removed', 'resolved'],
        required: true
    },
    description: { 
        type: String
    },
    acceptance: { 
        type: String
    },
    migrationPlan: { 
        type: String
    },
    resolutions: { 
        type: String
    },
    assignee: [{
        type: Schema.Types.ObjectId, 
        ref: 'User',
    }],
    reporter: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
    },
    priority: {
        type: String,
        enum: ['lowest', 'low', 'medium', 'high', 'highest']
    },
    parentId: {
        type: Schema.Types.ObjectId, 
        ref: 'Card'
    },
    labels: {
        type: String
    },
    effort: {
        type: Number
    },
    businessValue: {
        type: Number
    },
    valueArea: {
        type: String
    },
    category: {
        type: String
    },
    startDate: {
        type: Date
    },
    targetDate: {
        type: Date
    },
    completed: {
        type: Number
    },
    tags: [{
        type: Types.ObjectId
    }],
    closed: {
        type: Boolean,
        default: false
    },
    timeline: {
        type: Object
    },
    iteration: {
        type: String
    }
}, { timestamps: true });


const Card = model<CardDocument>('Card', CardSchema);

export { Card, CardDocument };