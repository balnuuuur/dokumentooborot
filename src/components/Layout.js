import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { getUnreadCount } from '../services/api';
import { FiHome, FiFileText, FiUpload, FiBell, FiSettings, FiLogOut, FiUsers, FiMenu, FiUser, FiShield } from 'react-icons/fi';

function Layout() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const username = localStorage.getItem('username') || 'Қолданушы';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
      try {
        const res = await getUnreadCount();
        setUnreadCount(res.data.data || 0);
      } catch (err) {
        console.error(err);
      }
    };

    useEffect(() => {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }, []);

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
    window.location.href = '/login';
  };

  const menuItems = [
    { path: '/dashboard', icon: <FiHome size={20} />, label: 'Басты бет', roles: ['USER', 'ADMIN'] },
    { path: '/documents', icon: <FiFileText size={20} />, label: 'Менің құжаттарым', roles: ['USER', 'ADMIN'] },
    { path: '/upload', icon: <FiUpload size={20} />, label: 'Құжат жүктеу', roles: ['USER', 'ADMIN'] },
    { path: '/notifications', icon: <FiBell size={20} />, label: 'Хабарландырулар', roles: ['USER', 'ADMIN'] },
    { path: '/admin', icon: <FiUsers size={20} />, label: 'Админ панель', roles: ['ADMIN'] },
  ];

  return (
    <div style={styles.app}>
      <aside style={{...styles.sidebar, width: sidebarOpen ? '260px' : '80px'}}>
        <div style={styles.logo}>
          {sidebarOpen && <span style={styles.logoText}>DocFlow</span>}
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => {
            if (!item.roles.includes(userRole)) return null;
            return (
              <Link key={item.path} to={item.path} style={styles.navItem}>
                {item.path === '/notifications' ? (
                <div style={{ position: 'relative' }}>
                {item.icon}
                {unreadCount > 0 && (
                <span style={styles.notificationBadge}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
               )}
             </div>
             ) : (
             item.icon
           )}
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={styles.bottomNav}>
          <Link to="/settings" style={styles.navItem}>
            <FiSettings size={20} />
            {sidebarOpen && <span>Баптаулар</span>}
          </Link>
          <button onClick={handleLogout} style={styles.navItem}>
            <FiLogOut size={20} />
            {sidebarOpen && <span>Шығу</span>}
          </button>
        </div>
      </aside>

      <main style={{
        ...styles.main,
        marginLeft: sidebarOpen ? '260px' : '80px'
      }}>
        <header style={styles.header}>
          <button
            style={styles.menuBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FiMenu size={22} />
          </button>

          <div style={styles.headerRight}>
            <div style={styles.profile}>
              <div style={styles.avatar}>
                {username.charAt(0).toUpperCase()}
              </div>
              <div style={styles.profileInfo}>
                <p style={styles.profileName}>{username}</p>
                <p style={styles.profileRole}>
                  {userRole === 'ADMIN' ? 'Әкімші' : 'Қолданушы'}
                </p>
              </div>
            </div>
          </div>
        </header>
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const styles = {
  app: {
    display: 'flex',
    backgroundColor: '#f6f8fb',
  },

  sidebar: {
    backgroundColor: '#111827',
    color: 'white',
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'width 0.3s ease',
    paddingTop: '10px',
  },

  logo: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: '600',
  },

  nav: {
    padding: '10px',
    flex: 1,
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '10px 14px',
    borderRadius: '10px',
    color: '#cbd5e1',
    textDecoration: 'none',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: '0.2s',
  },

  bottomNav: {
    padding: '10px',
  },

  main: {
    flex: 1,
    transition: 'margin-left 0.3s ease',
  },

  header: {
    height: '60px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },

  menuBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '6px',
  },

  content: {
    padding: '20px 30px',
  },

  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  notificationBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-12px',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },

  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#6366f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '600',
  },

  profileName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
  },

  profileRole: {
    margin: 0,
    fontSize: '12px',
    color: '#9ca3af',
  },
};

export default Layout;