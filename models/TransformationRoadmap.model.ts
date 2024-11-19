import { Document, Schema, model, Types } from 'mongoose';


interface TransformationRoadmapDocument extends Document {
  content: object;
  title: string;
  published: boolean;
  edit: string;
  view: string;
  allowedOnly: Types.ObjectId[];
  changes: boolean;
  internalEdit: boolean;
  orgId: Types.ObjectId;
  userId: Types.ObjectId;
  entityId: Types.ObjectId;
  projectId: Types.ObjectId;
  label: string
};

const TransformationRoadmapSchema = new Schema<TransformationRoadmapDocument>({
    orgId: { 
        type: Schema.Types.ObjectId, ref: 'User'
    },
    userId: { 
        type: Schema.Types.ObjectId, ref: 'User'
    },
    title: {
        type: String, required: true 
    },
    content: { type: {} },
    published: {
        type: Boolean,
        default: false
    },
    changes: {
        type: Boolean,
        default: false
    },
    allowedOnly: {
        type: [{
            userId: Types.ObjectId,
            edit: Boolean,
            view: Boolean
        }],
    },
    entityId: {
        type: Schema.Types.ObjectId, ref: 'TransformationRoadmap' 
    },
    projectId: {
        type: Schema.Types.ObjectId, ref: 'Project' 
    },
    internalEdit: {
        type: Boolean,
        default: false
    },
    edit: {
        type: String,
        enum: ['public', 'restricted'],
        default: 'public'
    },
    view: {
        type: String,
        enum: ['public', 'restricted'],
        default: 'public'
    },
    label: {
        type: String,
        enum: ['transformation', 'colab', 'blog', 'home']
    }
}, { timestamps: true });


const TransformationRoadmap = model<TransformationRoadmapDocument>('TransformationRoadmap', TransformationRoadmapSchema);

export { TransformationRoadmap, TransformationRoadmapDocument };