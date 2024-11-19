import { Document, Schema, model, Types } from 'mongoose';


interface RoadmapDocument extends Document {
    orgId: Types.ObjectId;
    projectId: Types.ObjectId;
    userId: Types.ObjectId;
    template: string;
    title: string;
    sources: object[];
    description: string;
    locked: boolean;
    groups: Types.ObjectId[];
    allowedOnly: object[];
};

const RoadmapSchema = new Schema<RoadmapDocument>({
    orgId: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    projectId: {
        type: Schema.Types.ObjectId, 
        ref: 'Project'
    },
    template: {
        type: String,
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
    sources: [{
        type: {
            type: String,
            enum: ['ProgressBoard', 'Team']
        },
        sourceId: Schema.Types.ObjectId
    }],
    description: {
        type: String
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


const Roadmap = model<RoadmapDocument>('Roadmap', RoadmapSchema);

export { Roadmap, RoadmapDocument };