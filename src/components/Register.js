import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await register(formData.username, formData.email, formData.password);
      if (response.data.success) {
        setSuccess('Тіркелу сәтті аяқталды!');
        setTimeout(() => navigate('/login'), 3000);
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
        <h2 style={styles.title}>Тіркелу</h2>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label>Пайдаланушы аты</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} style={styles.input} required />
          </div>
          <div style={styles.inputGroup}>
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={styles.input} required />
          </div>
          <div style={styles.inputGroup}>
            <label>Құпия сөз</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} style={styles.input} required />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Тіркелу...' : 'Тіркелу'}
          </button>
        </form>
        <p style={styles.loginLink}>
          Парақшаңыз бар ма? <Link to="/login">Кіру</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' },
  card: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', width: '400px' },
  title: { textAlign: 'center', marginBottom: '20px' },
  inputGroup: { marginBottom: '15px' },
  input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' },
  button: { width: '100%', padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' },
  error: { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '15px' },
  success: { backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', marginBottom: '15px' },
  loginLink: { textAlign: 'center', marginTop: '15px' },
};

export default Register;