import { Document, Schema, model, Types } from 'mongoose';


interface NotificationDocument extends Document {
  orgId: Types.ObjectId;
  userId: Types.ObjectId;
  notification: object;
  read: boolean
};

const NotificationSchema = new Schema<NotificationDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
  orgId: { type: Schema.Types.ObjectId, ref: 'users' },
  notification: Object,
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });


const Notification = model<NotificationDocument>('Notification', NotificationSchema);

export { Notification, NotificationDocument };