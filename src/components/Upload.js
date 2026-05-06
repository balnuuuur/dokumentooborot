import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '../services/api';
import { FiUploadCloud, FiFile } from 'react-icons/fi';

function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const navigate = useNavigate();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!title) {
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  }, [title]);

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  }, [title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Файл таңдаңыз');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

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
      <h1 style={styles.title}>Құжатты жүктеу</h1>
      <p style={styles.subtitle}>Тексеру және бекіту үшін жаңа құжат жүктеңіз</p>

      <form onSubmit={handleSubmit}>
        <div style={styles.card}>
          <p style={styles.cardTitle}>Құжат таңдау</p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              ...styles.uploadArea,
              ...(isDragOver ? styles.uploadAreaDragOver : {}),
              ...(file ? styles.uploadAreaWithFile : {})
            }}
          >
            {file ? (
              <>
                <FiFile size={48} color="#6366f1" />
                <p style={styles.selectedFileName}>{file.name}</p>
                <p style={styles.fileSize}>
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  style={styles.removeFileBtn}
                >
                  Басқа файл таңдау
                </button>
              </>
            ) : (
              <>
                <FiUploadCloud size={48} color="#6366f1" />
                <p style={styles.uploadText}>Файлыңызды мына жерге жылжытыңыз</p>
                <p style={styles.uploadOr}>немесе</p>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  style={styles.fileInput}
                  id="fileInput"
                  accept=".pdf,.doc,.docx,.txt"
                />
                <label htmlFor="fileInput" style={styles.browseBtn}>
                  Файл таңдау
                </label>
                <p style={styles.supported}>PDF, DOC, DOCX, TXT (макс 10MB)</p>
              </>
            )}
          </div>
        </div>

        <div style={styles.card}>
          <p style={styles.cardTitle}>Құжат мәліметтері</p>

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
            >
              <option value="">Санат таңдаңыз</option>
              <option value="Жоба жоспары">Жоба жоспары</option>
              <option value="Есеп">Есеп</option>
              <option value="Маркетинг">Маркетинг</option>
              <option value="Келісімшарт">Келісімшарт</option>
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
          >
            Болдырмау
          </button>
          <button
            type="submit"
            disabled={loading || !file}
            style={{
              ...styles.submitBtn,
              ...((loading || !file) ? styles.submitBtnDisabled : {})
            }}
          >
            {loading ? 'Жүктелуде...' : 'Құжат жүктеу'}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 16px',
  },

  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#1f2937',
  },

  subtitle: {
    color: '#6b7280',
    marginBottom: '32px',
  },

  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },

  cardTitle: {
    fontWeight: '600',
    marginBottom: '16px',
    fontSize: '16px',
    color: '#374151',
  },

  uploadArea: {
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '40px 24px',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    backgroundColor: '#fafafa',
  },

  uploadAreaDragOver: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },

  uploadAreaWithFile: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },

  uploadText: {
    fontWeight: '500',
    marginTop: '16px',
    color: '#374151',
  },

  uploadOr: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: '8px 0',
  },

  fileInput: {
    display: 'none',
  },

  browseBtn: {
    marginTop: '8px',
    background: '#6366f1',
    color: '#fff',
    padding: '10px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
  },

  supported: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '16px',
  },

  selectedFileName: {
    fontWeight: '600',
    fontSize: '16px',
    marginTop: '12px',
    color: '#10b981',
    wordBreak: 'break-all',
  },

  fileSize: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  },

  removeFileBtn: {
    marginTop: '16px',
    background: 'none',
    border: '1px solid #d1d5db',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#6b7280',
  },

  inputGroup: {
    marginBottom: '20px',
  },

  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '6px',
    color: '#374151',
  },

  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },

  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    minHeight: '80px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },

  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },

  cancelBtn: {
    padding: '10px 20px',
    border: '1px solid #d1d5db',
    background: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },

  submitBtn: {
    padding: '10px 24px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },

  submitBtnDisabled: {
    background: '#9ca3af',
    cursor: 'not-allowed',
  },

  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },

  success: {
    backgroundColor: '#ecfdf5',
    color: '#10b981',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
};

export default Upload;