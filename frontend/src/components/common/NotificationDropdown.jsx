import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDateTime } from '../../utils/formatters';
import { toast } from '../../utils/alerts';

export default function NotificationDropdown({ isMobile = false }) {
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="dropdown" id={isMobile ? 'mobileNotificationDropdownContainer' : 'notificationDropdownContainer'}>
      <button
        className="btn btn-sm btn-outline-secondary position-relative d-flex align-items-center justify-content-center"
        id={isMobile ? 'mobileNotificationBellBtn' : 'notificationBellBtn'}
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        title="Notifications"
        aria-label="Notifications"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--crm-radius-sm)',
          border: '1.5px solid var(--crm-border)',
        }}
      >
        <i className="fas fa-bell text-secondary"></i>
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            id={isMobile ? 'mobileNotificationBadge' : 'notificationBadge'}
          >
            {unreadCount}
          </span>
        )}
      </button>

      <div
        className="dropdown-menu dropdown-menu-end shadow border-0 p-0 notification-dropdown-menu"
        aria-labelledby={isMobile ? 'mobileNotificationBellBtn' : 'notificationBellBtn'}
        style={{ width: 'min(320px, calc(100vw - 32px))' }}
      >
        <div className="p-2.5 px-3 border-bottom d-flex align-items-center justify-content-between bg-light-subtle">
          <div className="fw-bold small d-flex align-items-center gap-2">
            <i className="fas fa-bell text-primary"></i> <span>Notifications</span>
          </div>
          <button
            type="button"
            className="btn btn-link btn-sm p-0 text-decoration-none text-primary small"
            onClick={async (e) => {
              e.preventDefault();
              await markAllAsRead();
              toast('All notifications marked as read', 'success');
            }}
          >
            Mark all read
          </button>
        </div>

        <div className="notification-list-body" style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {notifications && notifications.length > 0 ? (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-2.5 px-3 border-bottom notification-item d-flex align-items-start gap-2 ${
                  !item.is_read ? 'bg-primary-subtle' : ''
                }`}
                style={{ cursor: 'pointer' }}
                onClick={async () => {
                  if (!item.is_read) {
                    await markAsRead(item.id);
                    toast('Notification marked as read', 'success');
                  }
                }}
              >
                <div className="mt-1 flex-shrink-0">
                  <i
                    className={`fas ${
                      item.type === 'booking'
                        ? 'fa-file-signature text-success'
                        : item.type === 'lead'
                        ? 'fa-user-tag text-purple'
                        : item.type === 'system'
                        ? 'fa-cog text-warning'
                        : 'fa-info-circle text-primary'
                    }`}
                  ></i>
                </div>
                <div className="flex-grow-1 min-w-0">
                  <div className="small fw-semibold text-truncate">{item.title}</div>
                  <div className="text-secondary small text-truncate" style={{ fontSize: '0.78rem' }}>
                    {item.message}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {formatDateTime(item.created_at)}
                  </div>
                </div>
                {!item.is_read && (
                  <span
                    className="badge bg-primary rounded-circle p-1 mt-1"
                    style={{ width: '8px', height: '8px' }}
                    title="Unread"
                  ></span>
                )}
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-muted small">No notifications yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
