import React, { useState, useEffect, useCallback } from 'react';
import { getMyDocuments, getAllDocuments, deleteDocument, searchDocuments } from '../services/api';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const userRole = localStorage.getItem('userRole');

  const loadDocuments = useCallback(async () => {
    try {
      let response;
      if (userRole === 'ADMIN') {
        response = await getAllDocuments();
      } else {
        response = await getMyDocuments();
      }
      setDocuments(response.data.data || []);
    } catch (err) {
      setError('Құжаттарды жүктеу қатесі: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await searchDocuments(searchKeyword, searchStatus);
      setDocuments(response.data.data || []);
    } catch (err) {
      setError('Іздеу қатесі: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Бұл құжатты жойғыңыз келе ме?')) {
      try {
        await deleteDocument(id);
        loadDocuments();
      } catch (err) {
        setError('Жою қатесі: ' + err.message);
      }
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'DRAFT': return '#ffc107';
      case 'IN_REVIEW': return '#17a2b8';
      case 'APPROVED': return '#28a745';
      case 'REJECTED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'DRAFT': return 'Жоба';
      case 'IN_REVIEW': return 'Қарауда';
      case 'APPROVED': return 'Бекітілген';
      case 'REJECTED': return 'Қабылданбады';
      default: return status;
    }
  };

  if (loading) return <div style={styles.loading}>Жүктелуде...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Құжаттар тізімі</h1>

      <div style={styles.searchBox}>
        <input
          type="text"
          placeholder="Атауы бойынша іздеу..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={styles.searchInput}
        />
        <select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)} style={styles.searchSelect}>
          <option value="">Барлық статус</option>
          <option value="DRAFT">Жоба</option>
          <option value="IN_REVIEW">Қарауда</option>
          <option value="APPROVED">Бекітілген</option>
          <option value="REJECTED">Қабылданбады</option>
        </select>
        <button onClick={handleSearch} style={styles.searchBtn}>Іздеу</button>
        <button onClick={loadDocuments} style={styles.resetBtn}>Тазалау</button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>№</th>
              <th>Файл атауы</th>
              <th>Түрі</th>
              <th>Өлшемі</th>
              <th>Статус</th>
              <th>Жүктелген күн</th>
              <th>Әрекеттер</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.noData}>Құжаттар жоқ</td>
              </tr>
            ) : (
              documents.map((doc, index) => (
                <tr key={doc.id}>
                  <td>{index + 1}</td>
                  <td>{doc.fileName}</td>
                  <td>{doc.fileType?.split('/')[1] || 'unknown'}</td>
                  <td>{(doc.fileSize / 1024).toFixed(1)} KB</td>
                  <td>
                    <span style={{...styles.statusBadge, backgroundColor: getStatusColor(doc.status)}}>
                      {getStatusLabel(doc.status)}
                    </span>
                  </td>
                  <td>{new Date(doc.uploadedAt).toLocaleDateString('kk-KZ')}</td>
                  <td style={styles.actions}>
                    <Link to={`/document/${doc.id}`} style={styles.viewBtn}>Көру</Link>
                    <button onClick={() => handleDelete(doc.id)} style={styles.deleteBtn}>Жою</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
  },

  title: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '16px',
  },

  searchBox: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },

  searchInput: {
    flex: 1,
    padding: '10px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
  },

  searchSelect: {
    padding: '10px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
  },

  searchBtn: {
    padding: '10px 16px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },

  resetBtn: {
    padding: '10px 16px',
    backgroundColor: '#e5e7eb',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },

  tableWrapper: {
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  th: {
    textAlign: 'left',
    padding: '12px',
    fontSize: '12px',
    color: '#6b7280',
  },

  td: {
    padding: '14px 12px',
    fontSize: '14px',
  },

  row: {
    borderBottom: '1px solid #f1f5f9',
  },

  statusBadge: {
    padding: '4px 10px',
    borderRadius: '999px',
    color: '#fff',
    fontSize: '12px',
  },

  actions: {
    display: 'flex',
    gap: '6px',
  },

  viewBtn: {
    backgroundColor: '#22c55e',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '12px',
  },

  deleteBtn: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },

  loading: {
    textAlign: 'center',
    marginTop: '40px',
  },

  error: {
    color: '#ef4444',
    marginBottom: '10px',
  },

  noData: {
    textAlign: 'center',
    padding: '30px',
    color: '#9ca3af',
  },
};

export default Dashboard;