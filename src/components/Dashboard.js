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
              <td><td colSpan="7" style={styles.noData}>Құжаттар жоқ</td></tr>
            ) : (
              documents.map((doc, index) => (
                <tr key={doc.id}>
                  <td>{index + 1}</td>
                  <td>{doc.fileName}</td>
                  <td>{doc.fileType?.split('/')[1] || 'unknown'}</td>
                  <td>{(doc.fileSize / 1024).toFixed(1)} KB</td>
                  <td><span style={{...styles.statusBadge, backgroundColor: getStatusColor(doc.status)}}>{getStatusLabel(doc.status)}</span></td>
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
  container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
  title: { textAlign: 'center', marginBottom: '20px' },
  searchBox: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  searchInput: { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' },
  searchSelect: { padding: '10px', border: '1px solid #ddd', borderRadius: '5px' },
  searchBtn: { padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  resetBtn: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' },
  statusBadge: { padding: '5px 10px', borderRadius: '20px', color: 'white', fontSize: '12px' },
  actions: { display: 'flex', gap: '5px' },
  viewBtn: { padding: '5px 10px', backgroundColor: '#2ecc71', color: 'white', textDecoration: 'none', borderRadius: '5px' },
  deleteBtn: { padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  loading: { textAlign: 'center', padding: '50px', fontSize: '20px' },
  error: { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '20px' },
  noData: { textAlign: 'center', padding: '30px' },
};

export default Dashboard;