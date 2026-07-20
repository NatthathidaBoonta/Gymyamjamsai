/**
 * notification.controller.js — HTTP handlers สำหรับ Notifications
 */

const dto = require('./notification.dto');
const service = require('./notification.service');

/**
 * GET /api/notifications — ดึงรายการ notifications ของ user
 */
async function list(req, res, next) {
  try {
    const { limit, offset, unread } = dto.parseListQuery(req.query);
    const notifications = await service.list(req.user.id, limit, offset, unread === 'true');
    const unreadCount = await service.getUnreadCount(req.user.id);

    res.status(200).json({
      status: 'success',
      message: 'Notifications',
      data: {
        notifications,
        unread_count: unreadCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/notifications/unread-count — นับ unread notifications
 */
async function getUnreadCount(req, res, next) {
  try {
    const count = await service.getUnreadCount(req.user.id);
    res.status(200).json({
      status: 'success',
      message: 'Unread count',
      data: { count },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/notifications/:id/read — mark as read
 */
async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    await service.read(id);
    res.status(200).json({
      status: 'success',
      message: 'Marked as read',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/notifications/read-all — mark all as read
 */
async function markAllAsRead(req, res, next) {
  try {
    await service.readAll(req.user.id);
    res.status(200).json({
      status: 'success',
      message: 'All marked as read',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/notifications/:id — ลบ notification
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await service.remove(id);
    res.status(200).json({
      status: 'success',
      message: 'Deleted',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  remove,
};
