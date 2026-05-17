import React, { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead, } from '../services/api';
import { FiBell, FiCheckCircle, FiClock, FiFilter, FiUser, FiMessageSquare, FiFileText } from 'react-icons/fi';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      const data = res.data.data || [];

      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (err) {
      console.error(err);
    }
  };

   const updateUnreadCount = () => {
      const newUnreadCount = notifications.filter(n => !n.read).length;
      setUnreadCount(newUnreadCount);

      localStorage.setItem('unreadCountUpdated', Date.now().toString());
        window.dispatchEvent(new Event('storage'));
      };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
          setNotifications(updated);
          updateUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
          setNotifications(updatedNotifications);
          setUnreadCount(0);
          updateUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

   const getStartOfToday = () => {
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    };

    const getStartOfWeek = () => {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(today.getFullYear(), today.getMonth(), diff);
    };

  const filteredNotifications = notifications.filter((n) => {
      const notificationDate = new Date(n.createdAt);
      const startOfToday = getStartOfToday();
      const startOfWeek = getStartOfWeek();

      if (filter === 'today') {
        return notificationDate >= startOfToday;
      }
      if (filter === 'week') {
        return notificationDate >= startOfWeek;
      }
    return true;
  });

  const todayCount = notifications.filter((n) => new Date(n.createdAt) >= getStartOfToday()).length;
  const weekCount = notifications.filter((n) => new Date(n.createdAt) >= getStartOfWeek()).length;
  const allCount = notifications.length;
  const unreadCountValue = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type) => {
      switch(type) {
        case 'UPLOAD': return <FiFileText size={20} />;
        case 'COMMENT': return <FiMessageSquare size={20} />;
        case 'STATUS_CHANGE': return <FiClock size={20} />;
        default: return <FiBell size={20} />;
      }
    };

    const getNotificationColor = (type) => {
      switch(type) {
        case 'UPLOAD': return { bg: '#dbeafe', color: '#2563eb' };
        case 'COMMENT': return { bg: '#dcfce7', color: '#16a34a' };
        case 'STATUS_CHANGE': return { bg: '#fef3c7', color: '#d97706' };
        default: return { bg: '#f3e8ff', color: '#9333ea' };
      }
    };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Хабарландырулар</h1>

          <p style={styles.subtitle}>
            Құжаттар бойынша барлық жаңартулар
          </p>
        </div>

        <button
          onClick={handleMarkAll}
          style={styles.markAllBtn}
        >
          <FiCheckCircle size={16} />
          Барлығын оқу
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconBlue}>
            <FiBell size={22} />
          </div>

          <div>
            <p style={styles.statLabel}>Оқылмаған</p>
            <h3 style={styles.statValue}>
              {unreadCount}
            </h3>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconPurple}>
            <FiClock size={22} />
          </div>

          <div>
            <p style={styles.statLabel}>Бүгін</p>
            <h3 style={styles.statValue}>
              {todayCount}
            </h3>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconGreen}><FiFilter size={22} /></div>
          <div>
            <p style={styles.statLabel}>Барлығы</p>
            <h3 style={styles.statValue}>{allCount}</h3>
          </div>
        </div>
      </div>

      <div style={styles.filterRow}>
        <button
          onClick={() => setFilter('all')}
          style={
            filter === 'all'
              ? {
                  ...styles.filterBtn,
                  ...styles.activeFilter,
                }
              : styles.filterBtn
          }
        >
          Барлығы
        </button>

        <button
          onClick={() => setFilter('today')}
          style={
            filter === 'today'
              ? {
                  ...styles.filterBtn,
                  ...styles.activeFilter,
                }
              : styles.filterBtn
          }
        >
          Бүгін
        </button>

        <button
          onClick={() => setFilter('week')}
          style={
            filter === 'week'
              ? {
                  ...styles.filterBtn,
                  ...styles.activeFilter,
                }
              : styles.filterBtn
          }
        >
          Осы апта
        </button>
      </div>

      <div style={styles.notificationList}>
        {filteredNotifications.length === 0 ? (
          <div style={styles.emptyState}>
            <FiBell size={50} color="#9ca3af" />

            <h3 style={styles.emptyTitle}>
              Хабарландырулар жоқ
            </h3>

            <p style={styles.emptyText}>
              Қазіргі таңда жаңа хабарламалар жоқ
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const iconColor = getNotificationColor(notif.type);
         return (
            <div
              key={notif.id}
              style={
                notif.read
                  ? {
                      ...styles.notificationCard,
                      opacity: 0.7,
                    }
                  : styles.notificationCard
              }
            >
              <div
                  style={{
                    ...styles.iconWrapper,
                    backgroundColor: iconColor.bg,
                    color: iconColor.color,
                  }}
              >
                  {getNotificationIcon(notif.type)}
              </div>

              <div style={styles.notificationContent}>
                <div style={styles.topRow}>
                  <h3 style={styles.notificationTitle}>
                      {notif.title}
                  </h3>

                  {!notif.read && (
                    <span style={styles.newBadge}>
                      ЖАҢА
                    </span>
                  )}
                </div>

                <p style={styles.notificationMessage}>
                    {notif.message}
                </p>
                <p style={styles.notificationDate}>
                    {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>

              {!notif.read && (
                <button
                  onClick={() =>
                    handleMarkAsRead(notif.id)
                  }
                  style={styles.readBtn}
                >
                  <FiCheckCircle size={15} />
                  Оқылды
                </button>
              )}
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '14px',
  },

  title: {
    fontSize: '30px',
    fontWeight: '700',
    margin: 0,
    color: '#111827',
  },

  subtitle: {
    marginTop: '6px',
    color: '#6b7280',
    fontSize: '14px',
  },

  markAllBtn: {
    background:
      'linear-gradient(135deg,#6366f1,#8b5cf6)',
    color: '#fff',
    border: 'none',
    padding: '12px 18px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px,1fr))',
    gap: '18px',
    marginBottom: '26px',
  },

  statCard: {
    background: '#fff',
    borderRadius: '18px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },

  statIconBlue: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: '#eef2ff',
    color: '#6366f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statIconPurple: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: '#f3e8ff',
    color: '#9333ea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statIconGreen: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: '#dcfce7',
    color: '#16a34a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statLabel: {
    margin: 0,
    color: '#6b7280',
    fontSize: '14px',
  },

  statValue: {
    margin: '6px 0 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
  },

  filterRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },

  filterBtn: {
    border: '1px solid #e5e7eb',
    background: '#fff',
    padding: '10px 18px',
    borderRadius: '999px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: '0.2s',
  },

  activeFilter: {
    background:
      'linear-gradient(135deg,#6366f1,#8b5cf6)',
    color: '#fff',
    border: 'none',
  },

  notificationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  notificationCard: {
    background: '#fff',
    borderRadius: '18px',
    padding: '20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '18px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    transition: '0.2s',
  },

  iconWrapper: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: '#eef2ff',
    color: '#6366f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  iconWrapperGray: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: '#f3f4f6',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  notificationContent: {
    flex: 1,
  },

  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
    flexWrap: 'wrap',
  },

  notificationTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
  },

  notificationMessage: {
    margin: '6px 0',
    color: '#6b7280',
    lineHeight: '1.5',
    fontSize: '14px',
  },

  notificationDate: {
    margin: 0,
    color: '#9ca3af',
    fontSize: '12px',
  },

  newBadge: {
    background: '#dcfce7',
    color: '#16a34a',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
  },

  readBtn: {
    background: '#f3f4f6',
    border: 'none',
    padding: '10px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '500',
    color: '#374151',
  },

  emptyState: {
    background: '#fff',
    borderRadius: '20px',
    padding: '70px 20px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },

  emptyTitle: {
    marginTop: '16px',
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
  },

  emptyText: {
    marginTop: '8px',
    color: '#6b7280',
    fontSize: '14px',
  },
};

export default Notifications;