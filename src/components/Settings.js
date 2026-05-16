import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiSave, FiArrowLeft } from 'react-icons/fi';
import { changePassword } from '../services/api';

function Settings() {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      showMessage('Жаңа құпия сөздер сәйкес келмейді', 'error');
      return;
    }
    if (passwords.new.length < 6) {
      showMessage('Құпия сөз кемінде 6 таңба болуы керек', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new
      });

      if (response.data.success) {
        showMessage('Құпия сөз сәтті өзгертілді!', 'success');
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        showMessage(response.data.message || 'Қате орын алды', 'error');
      }
    } catch (err) {
      showMessage('Қате: ' + (err.response?.data?.message || 'Ағымдағы құпия сөз қате'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        <FiArrowLeft size={18} /> Артқа
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>Құпия сөзді өзгерту</h1>
        <p style={styles.subtitle}>Қауіпсіздік үшін құпия сөзіңізді жаңартыңыз</p>
      </div>

      {message.text && (
        <div style={{...styles.message, ...(message.type === 'success' ? styles.success : styles.error)}}>
          {message.text}
        </div>
      )}

      <div style={styles.card}>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Ағымдағы құпия сөз</label>
            <div style={styles.inputWrapper}>
              <FiLock size={18} color="#9ca3af" />
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                placeholder="Ағымдағы құпия сөз"
                style={styles.inputWithIcon}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Жаңа құпия сөз</label>
            <div style={styles.inputWrapper}>
              <FiLock size={18} color="#9ca3af" />
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                placeholder="Жаңа құпия сөз"
                style={styles.inputWithIcon}
                required
              />
            </div>
            <p style={styles.hint}>Кемінде 6 таңба</p>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Жаңа құпия сөзді растау</label>
            <div style={styles.inputWrapper}>
              <FiLock size={18} color="#9ca3af" />
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                placeholder="Жаңа құпия сөзді растау"
                style={styles.inputWithIcon}
                required
              />
            </div>
          </div>

          <button type="submit" style={styles.saveBtn} disabled={loading}>
            <FiSave size={16} /> {loading ? 'Өзгерту...' : 'Құпия сөзді өзгерту'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },
  header: {
    marginBottom: '28px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '6px'
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '14px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 4px 20px rgba(15,23,42,0.05)'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '0 14px',
    backgroundColor: '#fff'
  },
  inputWithIcon: {
    width: '100%',
    padding: '12px 0',
    border: 'none',
    fontSize: '14px',
    outline: 'none'
  },
  hint: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '4px'
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    justifyContent: 'center',
    marginTop: '10px'
  },
  message: {
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  success: {
    backgroundColor: '#dcfce7',
    color: '#166534'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  }
};

export default Settings;