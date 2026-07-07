const Notification = require("../models/Notification");

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(notifications);
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    return res.status(500).json({ error: "Server error fetching notifications" });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    notification.read = true;
    await notification.save();
    return res.json(notification);
  } catch (error) {
    console.error("Mark Notification Error:", error);
    return res.status(500).json({ error: "Server error updating notification status" });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    return res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return res.status(500).json({ error: "Server error deleting notification" });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification,
};
