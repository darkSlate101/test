import { Document, Schema, model, Types } from 'mongoose';


interface SuggestionDocument extends Document {
  entityId: Types.ObjectId;
  entityType: string;
  suggestion: string;
  prompt: string;
  cardId: Types.ObjectId[]
};

const SuggestionSchema = new Schema<SuggestionDocument>({
    entityId: { 
        type: Schema.Types.ObjectId,
        required: true 
    },
    entityType: {
        type: String,
        required: true
    },
    suggestion: {
        type: String
    },
    prompt: {
        type: String
    },
    cardId: [{
        type: Types.ObjectId
    }]
}, { timestamps: true });


const Suggestion = model<SuggestionDocument>('Suggestion', SuggestionSchema);

export { Suggestion, SuggestionDocument };