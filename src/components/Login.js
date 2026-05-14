import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await login(username, password);
      if (response.data.success) {
        const token = response.data.data;
        localStorage.setItem('token', token);
        const payload = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem('userRole', payload.role);
        localStorage.setItem('username', payload.sub);
        window.location.href = '/dashboard';
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Қате: Қосылу мүмкін емес');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.formContainer}>
          <div style={styles.iconContainer}>
          </div>

          <h1 style={styles.title}>Қош келдіңіз</h1>
          <p style={styles.subtitle}>Құжаттарыңызға қол жеткізу үшін кіріңіз</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Пайдаланушы аты</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Енгізу..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Құпия сөз</label>
              <input
                type="password"
                style={styles.input}
                placeholder="·········"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Кіру...' : 'Кіру'}
            </button>
          </form>

          <p style={styles.registerLink}>
            Тіркелмегенсіз бе? <Link to="/register" style={styles.link}>Тіркелу
            <div style={styles.adminLinkContainer}>
              <Link to="/admin-login" style={styles.adminLink}>Әкімшілік</Link>
            </div>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    width: '420px',
    maxWidth: '90%',
    padding: '40px',
  },
  formContainer: {
    width: '100%',
  },
  iconContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  icon: {
    fontSize: '48px',
  },
  title: {
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 'normal',
    color: '#888',
    marginBottom: '30px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'all 0.3s',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.3s',
    marginTop: '10px',
  },
  registerLink: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c00',
    padding: '12px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center',
  },
  adminLinkContainer: {
    textAlign: 'center',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  adminLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#6366f1',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default Login;