import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!token) return null;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.logo}>Документооборот</Link>

        <div style={styles.links}>
          <Link to="/dashboard" style={styles.link}>Құжаттар</Link>
          <Link to="/upload" style={styles.link}>Жүктеу</Link>
          {userRole === 'ADMIN' && (
            <Link to="/admin" style={styles.link}>Админ панель</Link>
          )}
          <Link to="/notifications" style={styles.link}>Хабарламалар</Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>Шығу</button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { backgroundColor: '#2c3e50', padding: '15px', color: 'white' },
  container: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' },
  logo: { color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' },
  links: { display: 'flex', gap: '20px', alignItems: 'center' },
  link: { color: 'white', textDecoration: 'none' },
  logoutBtn: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' },
};

export default Navbar;