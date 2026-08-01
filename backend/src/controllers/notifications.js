import { Notification } from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const userId = req.user.id;
    
    const notifications = await Notification.find({
      organizationId,
      $or: [{ userId }, { userId: null }] // Include org-wide notifications
    })
    .sort({ createdAt: -1 })
    .limit(20);

    const unreadCount = await Notification.countDocuments({
      organizationId,
      $or: [{ userId }, { userId: null }],
      isRead: false
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, organizationId, $or: [{ userId }, { userId: null }] },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const userId = req.user.id;
    
    await Notification.updateMany(
      { organizationId, $or: [{ userId }, { userId: null }], isRead: false },
      { isRead: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
