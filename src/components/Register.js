import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [usernameError, setUsernameError] = useState('');

  const handleChange = (e) => {
      const { name, value } = e.target;

      if (name === 'username') {
        const valueWithoutSpaces = value.replace(/\s/g, '');

        const latinRegex = /^[a-zA-Z0-9_]*$/;

        if (!latinRegex.test(valueWithoutSpaces)) {
          setUsernameError('Тек латын әліпбиі');
        } else {
          setUsernameError('');
        }
      }

      setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameError) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await register(formData.username, formData.email, formData.password);
      if (response.data.success) {
        setSuccess('Тіркелу сәтті аяқталды!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Қате: ' + (err.response?.data?.message || 'Серверге қосылу мүмкін емес'));
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

          <h1 style={styles.title}>Тіркелу</h1>
          <p style={styles.subtitle}>Жаңа парақша құрып, бастаңыз</p>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Пайдаланушы аты-жөні</label>
              <input
                type="text"
                name="username"
                style={{
                  ...styles.input,
                  borderColor: usernameError ? 'red' : '#e0e0e0',
                }}
                placeholder="Енгізу..."
                value={formData.username}
                onChange={handleChange}
                required
              />
              {usernameError && (
                <small style={styles.errorText}>
                  {usernameError}
                </small>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                style={styles.input}
                placeholder="Енгізу..."
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Құпия сөз</label>
              <input
                type="password"
                name="password"
                style={styles.input}
                placeholder="·········"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Тіркелу...' : 'Тіркелу'}
            </button>
          </form>

          <p style={styles.loginLink}>
            Парақшаңыз бар ма? <Link to="/login" style={styles.link}>Кіру</Link>
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
  loginLink: {
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
  success: {
    backgroundColor: '#efe',
    color: '#0a0',
    padding: '12px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center',
  },
  hint: {
    display: 'block',
    marginTop: '5px',
    fontSize: '12px',
    color: '#999'
  },
};

export default Register;