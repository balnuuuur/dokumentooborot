import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '../services/api';
import { FiUploadCloud } from 'react-icons/fi';

function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Файл таңдаңыз');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await uploadDocument(file, description);
      setSuccess('Құжат сәтті жүктелді!');
      setTimeout(() => navigate('/documents'), 2000);
    } catch (err) {
      setError('Жүктеу қатесі');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Құжат жүктеу</h1>
      <p style={styles.subtitle}>
        Тексеру және бекіту үшін жаңа құжат жүктеңіз
      </p>

      <div style={styles.card}>
        <form onSubmit={handleSubmit}>

          <div
            style={styles.uploadArea}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = '#f1f5f9')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = '#f9fafb')
            }
            </div>
            <div style={styles.uploadIcon}>
              <FiUploadCloud size={48} color="#6366f1" />
            </div>

            <p style={styles.uploadText}>
              Файлыңызды мына жерге жылжытыңыз
            </p>
            <p style={styles.uploadOr}>немесе</p>

            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={styles.fileInput}
              id="fileInput"
            />

            <label htmlFor="fileInput" style={styles.browseBtn}>
              Файл таңдау
            </label>

            {file && (
              <p style={styles.fileName}>
                Таңдалған: {file.name}
              </p>
            )}

            <p style={styles.supported}>
              PDF, DOC, DOCX, TXT (макс 10MB)
            </p>
          </div>

          <div style={styles.detailsSection}>
            <h3 style={styles.sectionTitle}>Құжат мәліметтері</h3>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Атауы *</label>
              <input
                type="text"
                placeholder="Құжат атауын енгізіңіз"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Сипаттама</label>
              <textarea
                placeholder="Қысқаша сипаттама"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.textarea}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Санат</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.input}

                <option value="">Санат таңдаңыз</option>
                <option value="Жоба жоспары">Жоба жоспары</option>
                <option value="Есеп">Есеп</option>
                <option value="Маркетинг">Маркетинг</option>
              </select>
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => navigate('/documents')}
              style={styles.cancelBtn}
              Болдырмау
            </button>

            <button
              type="submit"
              disabled={loading}
              style={styles.submitBtn}
              {loading ? 'Жүктелуде...' : 'Жүктеу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },

  title: {
    fontSize: '26px',
    fontWeight: '600',
    marginBottom: '6px',
  },

  subtitle: {
    color: '#6b7280',
    marginBottom: '24px',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
  },

  uploadArea: {
    borderRadius: '14px',
    padding: '40px',
    textAlign: 'center',
    marginBottom: '30px',
    backgroundColor: '#f9fafb',
    cursor: 'pointer',
    transition: '0.2s',
  },

  uploadIcon: { marginBottom: '12px' },

  uploadText: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#374151',
  },

  uploadOr: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: '6px 0',
  },

  fileInput: { display: 'none' },

  browseBtn: {
    display: 'inline-block',
    backgroundColor: '#6366f1',
    color: '#fff',
    padding: '10px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '12px',
  },

  fileName: {
    marginTop: '14px',
    fontSize: '14px',
    color: '#111827',
  },

  supported: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '10px',
  },

  detailsSection: {
    marginBottom: '24px',
  },

  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
  },

  inputGroup: {
    marginBottom: '18px',
  },

  label: {
    display: 'block',
    fontSize: '13px',
    marginBottom: '6px',
    color: '#6b7280',
  },

  input: {
    width: '100%',
    padding: '11px 12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    outline: 'none',
  },

  textarea: {
    width: '100%',
    padding: '11px 12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    minHeight: '90px',
  },

  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },

  cancelBtn: {
    padding: '10px 18px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },

  submitBtn: {
    padding: '10px 18px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },

  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '16px',
  },

  success: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
};

export default Upload;