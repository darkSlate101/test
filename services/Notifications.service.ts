import { Notification } from '../models/Notifications.model';


export const read = async (filter: {}) => await Notification.findOneAndUpdate(filter, { read: true }, { new: true });

export const find = async (filter: {}) => await Notification.find(filter);

export const deleteOne = async (filter: {}) => await Notification.findOneAndDelete(filter);

export default {
  read,
  find,
  deleteOne
};