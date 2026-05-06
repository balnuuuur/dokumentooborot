import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiFileText,
  FiUpload,
  FiBell,
  FiSettings,
  FiLogOut,
  FiUsers,
  FiMenu
} from 'react-icons/fi';

function Layout() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const username = localStorage.getItem('username') || 'Қолданушы';
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
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
                {item.icon}
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

      <main style={styles.main}>
        <header style={styles.header}>
          <button style={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FiMenu size={24} />
          </button>
          <div style={styles.headerRight}>
            <div style={styles.profile}>
              <div style={styles.avatar}>
                {username.charAt(0).toUpperCase()}
              </div>
              <div style={styles.profileInfo}>
                <p style={styles.profileName}>{username}</p>
                <p style={styles.profileRole}>{userRole === 'ADMIN' ? 'Әкімші' : 'Қолданушы'}</p>
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
  app: { display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' },
  sidebar: {
    backgroundColor: '#1a1a2e',
    color: 'white',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'width 0.3s',
    zIndex: 100,
  },
  logo: { padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' },
  logoIcon: { fontSize: '24px' },
  logoText: { fontSize: '20px', fontWeight: 'bold' },
  nav: { padding: '20px', flex: 1 },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '8px',
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    fontSize: '14px',
    transition: 'all 0.3s',
  },
  bottomNav: { padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  main: { flex: 1, marginLeft: '260px' },
  header: {
    backgroundColor: 'white',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e0e0e0',
    position: 'sticky',
    top: 0,
    zIndex: 99,
  },
  menuBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '20px' },
  profile: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
  avatar: {
    width: '40px',
    height: '40px',
    backgroundColor: '#667eea',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  profileInfo: { textAlign: 'left' },
  profileName: { fontSize: '14px', fontWeight: '600', margin: 0 },
  profileRole: { fontSize: '12px', color: '#888', margin: 0 },
  content: { padding: '24px' },
};

export default Layout;