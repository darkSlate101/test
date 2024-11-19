import { Document, Schema, model, Types } from 'mongoose';
import { functions } from '../constants/constants';


interface FunctionsDocument extends Document {
    orgId: Types.ObjectId;
    functions: []
};

const FunctionsSchema = new Schema<FunctionsDocument>({
    orgId: { type: Schema.Types.ObjectId, ref: 'users' },
    functions: {
        type: [{
            name: {
                type: String,
                enum: functions
            },
            for: {
                type: [{
                type: String
                }],
                enum: ['projects', 'home']
            },
            plan: {
                type: String
            }
        }]
    }
}, { timestamps: true });


const Functions = model<FunctionsDocument>('Functions', FunctionsSchema);

export { Functions, FunctionsDocument };