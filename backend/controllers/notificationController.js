const Notification = require('../models/Notification');
const User = require('../models/User');

async function createFollowupNotification({ recipient, assigner = null, customerName = 'Customer', entityType = 'lead', entityId = null, note = null }) {
  if (!recipient) return null;

  try {
    let recipientId = recipient;
    if (typeof recipient === 'object') {
      recipientId = recipient._id || recipient.id;
    }
    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) return null;

    let assignerName = 'Administrator';
    let senderId = null;
    if (assigner) {
      if (typeof assigner === 'object') {
        senderId = assigner._id || assigner.id;
        assignerName = assigner.name || assignerName;
      } else {
        senderId = String(assigner);
        const senderUser = await User.findById(senderId);
        if (senderUser) {
          assignerName = senderUser.name;
        }
      }
    }

    const title = entityType === 'lead' ? 'Follow-up Assigned' : 'Booking Follow-up';
    let msg = `Follow-up assigned by ${assignerName} for ${customerName}.`;
    if (note && String(note).trim()) {
      msg += ` Note: ${String(note).trim()}`;
    }

    const notif = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      senderName: assignerName,
      title: title,
      message: msg,
      entityType: entityType,
      entityId: entityId ? String(entityId) : '',
      isRead: false
    });

    return notif;
  } catch (err) {
    console.warn('Failed to create follow-up notification:', err.message);
    return null;
  }
}

async function getUserNotifications(req, res) {
  try {
    const currentUserId = req.userId;
    if (!currentUserId) {
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }

    const notifications = await Notification.find({ recipient: currentUserId })
      .populate('sender', 'name email')
      .sort({ createdTime: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({ recipient: currentUserId, isRead: false });

    return res.status(200).json({
      status: 'success',
      unreadCount,
      data: notifications.map(n => n.toJSON())
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

async function markNotificationRead(req, res) {
  try {
    const currentUserId = req.userId;
    const { notification_id } = req.params;

    const notif = await Notification.findOne({ _id: notification_id, recipient: currentUserId });
    if (!notif) {
      return res.status(404).json({ status: 'error', message: 'Notification not found' });
    }

    notif.isRead = true;
    await notif.save();

    return res.status(200).json({ status: 'success', message: 'Notification marked as read' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

async function markAllRead(req, res) {
  try {
    const currentUserId = req.userId;
    await Notification.updateMany({ recipient: currentUserId, isRead: false }, { $set: { isRead: true } });
    return res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

async function getUnreadCount(req, res) {
  try {
    const currentUserId = req.userId;
    const unreadCount = await Notification.countDocuments({ recipient: currentUserId, isRead: false });
    return res.status(200).json({
      status: 'success',
      unreadCount,
      unread_count: unreadCount
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

module.exports = {
  createFollowupNotification,
  getUserNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead
};
