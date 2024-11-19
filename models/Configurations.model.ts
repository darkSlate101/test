import { Document, Schema, model, Types } from 'mongoose';
import { defaultConfig } from "constants/constants";


interface ConfigurationsDocument extends Document {
  orgId: Types.ObjectId;
  configurations: object
};

const ConfigurationsSchema = new Schema<ConfigurationsDocument>({
  orgId: { type: Schema.Types.ObjectId, ref: 'users' },
  configurations: {
    type: Object,
    default: defaultConfig
  }
}, { timestamps: true });


const Configurations = model<ConfigurationsDocument>('Configurations', ConfigurationsSchema);

export { Configurations, ConfigurationsDocument };