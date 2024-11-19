import { Document, Schema, model, Types } from 'mongoose';
import { functions } from '../../constants/constants';


interface ProjectDocument extends Document {
    description: string;
    title: string;
    userId: Types.ObjectId;
    orgId: Types.ObjectId;
    projectOwnerId: Types.ObjectId[];
    members: Types.ObjectId[];
    status: boolean;
    functions: string[];
};

const ProjectSchema = new Schema<ProjectDocument>({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    orgId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    projectOwnerId: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String
    },
    members: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    status: { 
        type: Boolean
    },
    functions: {
        type: [{
            type: String,
            enum: functions
        }],
        default: functions
    }
}, { timestamps: true });


const Project = model<ProjectDocument>('Project', ProjectSchema);

export { Project, ProjectDocument };