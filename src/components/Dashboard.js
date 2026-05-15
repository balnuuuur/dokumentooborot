import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMyDocuments, getAllDocuments, deleteDocument, searchDocuments, getCommentsByDocument, deleteComment, updateDocumentStatus } from '../services/api';
import { FiFileText, FiTrash2, FiEye, FiSearch, FiRefreshCw, FiCalendar } from 'react-icons/fi';

function Dashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const userRole = localStorage.getItem('userRole');

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = userRole === 'ADMIN'
        ? await getAllDocuments()
        : await getMyDocuments();
      setDocuments(response.data.data || []);
    } catch (err) {
      setError('Құжаттарды жүктеу қатесі: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');

      if (!searchKeyword.trim() && !searchStatus) {
        await loadDocuments();
        return;
      }

      const response = await searchDocuments(searchKeyword, searchStatus);

      if (response.data.success) {
      setDocuments(response.data.data || []);
        if (response.data.data?.length === 0) {
          setError('Сұраныс бойынша құжаттар жоқ');
        }
      } else {
        setError(response.data.message || 'Іздеу нәтижесі жоқ');
        setDocuments([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      if (err.response?.status === 400) {
        setError('Іздеу сұранысы дұрыс емес. Қайталап көріңіз.');
      } else {
        setError('Іздеу қатесі: ' + (err.response?.data?.message || err.message));
      }
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchKeyword('');
    setSearchStatus('');
    loadDocuments();
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Бұл құжатты жойғыңыз келе ме? Барлық пікірлер де жойылады.');
    if (!confirmed) return;

      try {
        const commentsRes = await getCommentsByDocument(id);
        const comments = commentsRes.data.data || [];
        for (const comment of comments) {
                  await deleteComment(comment.id);
        }
        await deleteDocument(id);
        await loadDocuments();
      } catch (err) {
        setError('Жою қатесі: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReview = async (id) => {
    try {
      setLoading(true);
      await updateDocumentStatus(id, 'IN_REVIEW', null);
      await loadDocuments();
    } catch (err) {
      setError('Статусты өзгерту қатесі: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'DRAFT': return {text: 'Жоба', bg: '#fef3c7', color: '#92400e'};
      case 'IN_REVIEW': return {text: 'Қарауда', bg: '#dbeafe', color: '#1d4ed8'};
      case 'APPROVED': return {text: 'Бекітілген', bg: '#dcfce7', color: '#166534'};
      case 'REJECTED': return {text: 'Қабылданбады', bg: '#fee2e2', color: '#991b1b'};
      default: return {text: status, bg: '#e5e7eb', color: '#374151'};
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>Жүктелуде...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
      <h1 style={styles.title}>Құжаттар тізімі</h1>
          <p style={styles.subtitle}>Барлық жүктелген құжаттар</p>
        </div>
      </div>

      <div style={styles.searchCard}>
        <div style={styles.searchInputWrapper}>
          <FiSearch size={18} color="#94a3b8" />
        <input
          type="text"
          placeholder="Атауы бойынша іздеу..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={styles.searchInput}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        </div>
        {userRole !== 'ADMIN' && (
        <select
          value={searchStatus}
          onChange={(e) => setSearchStatus(e.target.value)}
          style={styles.searchSelect}
        >
          <option value="">Барлық статус</option>
          <option value="DRAFT">Жоба</option>
          <option value="IN_REVIEW">Қарауда</option>
          <option value="APPROVED">Бекітілген</option>
          <option value="REJECTED">Қабылданбады</option>
        </select>
        )}
        <button onClick={handleSearch} style={styles.searchBtn}>
          <FiSearch size={16} /> Іздеу
        </button>
        <button onClick={handleReset} style={styles.resetBtn}>
          <FiRefreshCw size={16} /> Тазалау
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>№</th>
              <th style={styles.th}>Файл атауы</th>
              <th style={styles.th}>Түрі</th>
              <th style={styles.th}>Өлшемі</th>
              <th style={styles.th}>Статус</th>
              <th style={styles.th}>Жүктелген күн</th>
              <th style={styles.th}>Әрекеттер</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.emptyState}>
                  <div style={styles.emptyStateContent}>
                    <FiFileText size={48} color="#cbd5e1" />
                    <p>Құжаттар жоқ</p>
                  </div>
                </td>
              </tr>
            ) : (
              documents.map((doc, index) => {
                const status = getStatusColor(doc.status);
                return (
                  <tr key={doc.id} style={styles.tr}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>
                      <div style={styles.fileInfo}>
                        <div style={styles.fileIcon}>
                          <FiFileText size={20} />
                        </div>
                        <div>
                          <div style={styles.fileName}>{doc.fileName}</div>
                          <div style={styles.fileSub}>Құжат файлы</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.formatBadge}>
                        {doc?.fileName?.split('.').pop()?.toUpperCase() || 'FILE'}
                      </span>
                    </td>
                    <td style={styles.td}>{(doc.fileSize / 1024).toFixed(1)} KB</td>
                    <td style={styles.td}>
                      <span style={{...styles.statusBadge, backgroundColor: status.bg, color: status.color}}>
                        {status.text}
                    </span>
                  </td>
                    <td style={styles.td}>
                      <div style={styles.dateBox}>
                        <FiCalendar size={14} />
                        {new Date(doc.uploadedAt).toLocaleDateString('kk-KZ')}
                      </div>
                    </td>
                    <td style={styles.actionsTd}>
                      {userRole === 'ADMIN' ? (
                        <button onClick={() => handleReview(doc.id)} style={styles.reviewBtn}>
                          <FiEye size={15} /> Қарауда
                        </button>
                      ) : (
                      <Link to={`/document/${doc.id}`} style={styles.viewBtn}>
                        <FiEye size={15} /> Көру
                      </Link>
                      )}
                      <button onClick={() => handleDelete(doc.id)} style={styles.deleteBtn}>
                        <FiTrash2 size={15} /> Жою
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '20px' },
  header: { marginBottom: '24px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' },
  subtitle: { color: '#64748b', fontSize: '15px' },

  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '20px',
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(15,23,42,0.05)',
    flexWrap: 'wrap',
  },

  searchInputWrapper: {
    flex: 1,
    minWidth: '250px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '0 14px',
    height: '48px',
    backgroundColor: '#f8fafc',
  },

  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    width: '100%',
    fontSize: '14px',
  },

  searchSelect: {
    height: '48px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    padding: '0 14px',
    backgroundColor: '#f8fafc',
    outline: 'none',
    color: '#334155',
    fontSize: '14px',
  },

  searchBtn: {
    height: '48px',
    padding: '0 18px',
    border: 'none',
    borderRadius: '14px',
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
  },

  resetBtn: {
    height: '48px',
    padding: '0 18px',
    border: 'none',
    borderRadius: '14px',
    backgroundColor: '#e2e8f0',
    color: '#334155',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
  },

  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(15,23,42,0.05)',
  },

  table: { width: '100%', borderCollapse: 'collapse' },

  th: {
    textAlign: 'left',
    padding: '18px 20px',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '600',
    borderBottom: '1px solid #e2e8f0',
  },

  tr: { borderBottom: '1px solid #f1f5f9' },

  td: { padding: '18px 20px', verticalAlign: 'middle', color: '#0f172a', fontSize: '14px' },

  actionsTd: { padding: '18px 20px', display: 'flex', gap: '10px' },

  fileInfo: { display: 'flex', alignItems: 'center', gap: '14px' },

  fileIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    backgroundColor: '#eef2ff',
    color: '#6366f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  fileName: { fontWeight: '600', color: '#0f172a', marginBottom: '4px' },
  fileSub: { fontSize: '12px', color: '#94a3b8' },

  formatBadge: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '600',
  },

  statusBadge: { padding: '7px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' },

  dateBox: { display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' },

  viewBtn: {
    backgroundColor: '#22c55e',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '10px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '600',
  },
  reviewBtn: {
    backgroundColor: '#f59e0b',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '10px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '600',
  },

  loadingWrapper: {
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },

  loader: {
    width: '45px',
    height: '45px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  loadingText: { color: '#64748b' },

  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '14px',
    borderRadius: '14px',
    marginBottom: '20px',
  },

  emptyState: { textAlign: 'center', padding: '50px' },
  emptyStateContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#94a3b8' },
};

export default Dashboard;