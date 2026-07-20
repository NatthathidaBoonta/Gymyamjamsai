/**
 * notification.dto.js — Data validation สำหรับ Notifications
 */

function parseListQuery(query) {
  let limit = parseInt(query.limit || '20', 10);
  let offset = parseInt(query.offset || '0', 10);

  if (limit < 1 || limit > 100) limit = 20;
  if (offset < 0) offset = 0;

  return { limit, offset, unread: query.unread };
}

module.exports = {
  parseListQuery,
};
