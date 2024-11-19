import { Document, Schema, model, Types } from 'mongoose';


interface LinkDocument extends Document {
  parent: Types.ObjectId;
  child: Types.ObjectId;
  comment: String
};

const LinkSchema = new Schema<LinkDocument>({
    parent: { 
        type: Schema.Types.ObjectId, 
        ref: 'Card'
    },
    child: { 
        type: Schema.Types.ObjectId, 
        ref: 'Card'
    },
    comment: { 
        type: String
    }
}, { timestamps: true });


const Link = model<LinkDocument>('Link', LinkSchema);

export { Link, LinkDocument };