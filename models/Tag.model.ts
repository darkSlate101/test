import { Document, Schema, model, Types } from 'mongoose';


interface TagDocument extends Document {
    orgId: Types.ObjectId;
    userId: Types.ObjectId;
    label: string
};

const TagSchema = new Schema<TagDocument>({
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    orgId: { type: Schema.Types.ObjectId, ref: 'users' },
    label: String
}, { timestamps: true });


const Tag = model<TagDocument>('Tag', TagSchema);

export { Tag, TagDocument };