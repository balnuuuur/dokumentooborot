import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { FiShield, FiLock, FiUser, FiArrowLeft } from 'react-icons/fi';

function AdminLogin() {
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
        const payload = JSON.parse(atob(token.split('.')[1]));

        if (payload.role !== 'ADMIN') {
          setError('Бұл бет тек әкімшілерге арналған');
          return;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('userRole', payload.role);
        localStorage.setItem('username', payload.sub);

        window.location.href = '/admin';
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err.response?.data?.message === 'Bad credentials') {
        setError('Қате');
      } else {
        setError('Қате: ' + (err.response?.data?.message || 'Қосылу мүмкін емес'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.formContainer}>
          <div style={styles.iconContainer}>
            <div style={styles.adminBadge}>
              <FiShield size={42} />
            </div>
          </div>

          <h1 style={styles.title}>Әкімшілік кіру</h1>

          <p style={styles.subtitle}>
            Әкімші панеліне кіру үшін авторизациядан өтіңіз
          </p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Пайдаланушы аты
              </label>

              <div style={styles.inputWrapper}>
                <FiUser size={18} color="#9ca3af" />

                <input
                  type="text"
                  style={styles.input}
                  placeholder="Енгізу..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Құпия сөз
              </label>

              <div style={styles.inputWrapper}>
                <FiLock size={18} color="#9ca3af" />

                <input
                  type="password"
                  style={styles.input}
                  placeholder="·········"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading ? 'Кіру...' : 'Әкімші панельге кіру'}
            </button>
          </form>

          <Link to="/login" style={styles.backLink}>
            <FiArrowLeft size={16} />
            Қолданушы бетіне оралу
          </Link>
        </div>
      </div>
    </div>
  );

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f8fafc',
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

  adminBadge: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    boxShadow: '0 10px 25px rgba(102,126,234,0.3)',
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
    lineHeight: '1.5',
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

  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '0 14px',
    backgroundColor: '#fff',
    transition: 'all 0.3s',
  },

  input: {
    width: '100%',
    padding: '14px 0',
    border: 'none',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'transparent',
  },

  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.3s',
    marginTop: '10px',
  },

  backLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px',
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '14px',
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
};

export default AdminLogin;