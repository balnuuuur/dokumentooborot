import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiSave, FiArrowLeft, FiBell, FiBellOff, FiChevronDown, FiShield } from 'react-icons/fi';
import { changePassword } from '../services/api';

function Settings() {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notificationsEnabled') !== 'false';
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [securityOpen, setSecurityOpen] = useState(false);

  const handleNotificationsChange = (checked) => {
    setNotificationsEnabled(checked);
    localStorage.setItem('notificationsEnabled', checked);

    window.dispatchEvent(new CustomEvent('notificationsChanged', { detail: checked }));
  };

  useEffect(() => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled);
  }, [notificationsEnabled]);

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
        <h1 style={styles.title}>Баптаулар</h1>
        <p style={styles.subtitle}>Аккаунт параметрлерін басқарыңыз</p>
      </div>

      {message.text && (
        <div style={{...styles.message, ...(message.type === 'success' ? styles.success : styles.error)}}>
          {message.text}
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionHeaderLeft}>
            <div style={styles.sectionIcon}>
              <FiBell size={18} />
            </div>
            <div>
              <h2 style={styles.sectionTitle}>Хабарландырулар</h2>
              <p style={styles.sectionSubtitle}>Жаңа хабарламалар туралы ескертулер</p>
            </div>
          </div>
          <label style={styles.switch}>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => handleNotificationsChange(e.target.checked)}
            />
            <span style={{
              ...styles.slider,
              backgroundColor: notificationsEnabled ? '#6366f1' : '#cbd5e1'
            }}>
              <span style={{
                position: 'absolute',
                height: '22px',
                width: '22px',
                left: notificationsEnabled ? '28px' : '4px',
                bottom: '4px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: '0.3s'
              }} />
            </span>
          </label>
        </div>
      </div>

      <div style={styles.card}>
        <div
          style={styles.sectionHeader}
          onClick={() => setSecurityOpen(!securityOpen)}
        >
          <div style={styles.sectionHeaderLeft}>
            <div style={styles.sectionIcon}>
              <FiShield size={18} />
            </div>
            <div>
              <h2 style={styles.sectionTitle}>Қауіпсіздік</h2>
              <p style={styles.sectionSubtitle}>Құпия сөзді жаңарту және аккаунт қауіпсіздігі</p>
            </div>
          </div>
          <FiChevronDown
            size={20}
            style={{
              transform: securityOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: '0.3s'
            }}
          />
        </div>

        {securityOpen && (
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
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '32px 20px'
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
    marginBottom: '32px'
  },
  title: {
    fontSize: '34px',
    fontWeight: '800',
    color: '#111827',
    marginBottom: '10px',
    letterSpacing: '-1px'
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '15px',
    lineHeight: '1.6'
  },
  card: {
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(12px)',
    borderRadius: '28px',
    padding: '20px 28px',
    marginBottom: '20px',
    boxShadow: '0 10px 35px rgba(15,23,42,0.08)',
    border: '1px solid rgba(255,255,255,0.6)',
    transition: '0.3s ease'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer'
  },
  sectionHeaderLeft: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  },
  sectionIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: 0,
    color: '#111827'
  },
  sectionSubtitle: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '4px',
    marginBottom: 0
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '54px',
    height: '30px'
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transition: '.3s',
    borderRadius: '999px'
  },
  inputGroup: {
    marginBottom: '20px',
    marginTop: '24px'
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
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '0 16px',
    backgroundColor: '#fff',
    transition: '0.2s ease',
    height: '52px'
  },
  inputWithIcon: {
    width: '100%',
    border: 'none',
    fontSize: '15px',
    outline: 'none',
    background: 'transparent'
  },
  hint: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '4px'
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
    justifyContent: 'center',
    marginTop: '16px',
    transition: '0.3s ease',
    boxShadow: '0 10px 25px rgba(99,102,241,0.3)'
  },
  message: {
    padding: '14px 18px',
    borderRadius: '16px',
    marginBottom: '24px',
    fontSize: '14px',
    fontWeight: '500',
    backdropFilter: 'blur(10px)'
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