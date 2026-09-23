const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

function formatNotificationTime(d) {
  if (!d) return '';
  const dateObj = new Date(d);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[dateObj.getMonth()];
  const day = String(dateObj.getDate()).padStart(2, '0');
  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');
  return `${month} ${day}, ${strHours}:${minutes} ${ampm}`;
}

const notificationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => uuidv4() },
    recipient: { type: String, ref: 'User', required: true },
    sender: { type: String, ref: 'User', default: null },
    senderName: { type: String, default: 'Administrator' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    entityType: { type: String, default: 'lead' },
    entityId: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    createdTime: { type: Date, default: Date.now },
    addedTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now }
  },
  {
    collection: 'notifications',
    timestamps: { createdAt: 'addedTime', updatedAt: 'updatedTime' },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        ret.senderName = ret.senderName || (doc.sender && typeof doc.sender === 'object' && doc.sender.name ? doc.sender.name : 'Administrator');
        ret.timeAgo = formatNotificationTime(ret.createdTime);
        if (doc.recipient && typeof doc.recipient === 'object') ret.recipient = doc.recipient._id || doc.recipient.id;
        if (doc.sender && typeof doc.sender === 'object') ret.sender = doc.sender._id || doc.sender.id;
        if (ret.createdTime instanceof Date) ret.createdTime = ret.createdTime.toISOString();
        if (ret.addedTime instanceof Date) ret.addedTime = ret.addedTime.toISOString();
        if (ret.updatedTime instanceof Date) ret.updatedTime = ret.updatedTime.toISOString();
        return ret;
      }
    }
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdTime: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
