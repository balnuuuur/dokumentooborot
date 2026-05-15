import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getAllDocuments, deleteDocument, getCommentsByDocument, deleteComment } from '../services/api';
import { FiClock, FiCheckCircle, FiXCircle, FiUsers, FiFileText, FiEye, FiTrash2 } from 'react-icons/fi';

function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');
  const [documents, setDocuments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('IN_REVIEW');
  const [loading, setLoading] = useState(true);
  const [highlightId, setHighlightId] = useState(null);

  useEffect(() => {
    if (userRole !== 'ADMIN') {
      navigate('/dashboard');
    }
  }, [userRole, navigate]);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await getAllDocuments();
      const docs = res.data.data || [];
      setDocuments(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDocuments = (status) => {
    return documents.filter(d => d.status === status);
  };

  const stats = {
    pending: documents.filter(d => d.status === 'IN_REVIEW').length,
    approved: documents.filter(d => d.status === 'APPROVED').length,
    rejected: documents.filter(d => d.status === 'REJECTED').length,
  };

  const currentDocuments = getFilteredDocuments(filterStatus);

  const getStatusText = (status) => {
    switch(status) {
      case 'IN_REVIEW': return 'Қарауда';
      case 'APPROVED': return 'Бекітілген';
      case 'REJECTED': return 'Қабылданбады';
      default: return status;
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch(status) {
      case 'IN_REVIEW': return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'APPROVED': return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'REJECTED': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default: return { backgroundColor: '#e5e7eb', color: '#374151' };
    }
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
        console.error('Жою қатесі:', err);
        alert('Құжатты жою қатесі: ' + (err.response?.data?.message || err.message));
      }
    };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p>Жүктелуде...</p>
      </div>
    );
  }

  if (userRole !== 'ADMIN') return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Әкімші панелі</h1>
          <p style={styles.subtitle}>Құжаттарды тексеру және басқару</p>
        </div>
        <div style={styles.adminBadge}>
          <FiUsers size={16} /> ADMIN
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div
          style={{...styles.statCard, ...(filterStatus === 'IN_REVIEW' ? styles.statCardActive : {})}}
          onClick={() => setFilterStatus('IN_REVIEW')}
        >
          <div style={styles.yellowIcon}><FiClock size={24} /></div>
          <div>
            <p style={styles.statLabel}>Қарауда</p>
            <h2 style={styles.statValue}>{stats.pending}</h2>
          </div>
        </div>

        <div
          style={{...styles.statCard, ...(filterStatus === 'APPROVED' ? styles.statCardActive : {})}}
          onClick={() => setFilterStatus('APPROVED')}
        >
          <div style={styles.greenIcon}><FiCheckCircle size={24} /></div>
          <div>
            <p style={styles.statLabel}>Бекітілген</p>
            <h2 style={styles.statValue}>{stats.approved}</h2>
          </div>
        </div>

        <div
          style={{...styles.statCard, ...(filterStatus === 'REJECTED' ? styles.statCardActive : {})}}
          onClick={() => setFilterStatus('REJECTED')}
        >
          <div style={styles.redIcon}><FiXCircle size={24} /></div>
          <div>
            <p style={styles.statLabel}>Қабылданбаған</p>
            <h2 style={styles.statValue}>{stats.rejected}</h2>
          </div>
        </div>
      </div>

      <div style={styles.documentsCard}>
        <div style={styles.documentsHeader}>
          <div>
            <h2 style={styles.sectionTitle}>{getStatusText(filterStatus)} құжаттар</h2>
            <p style={styles.sectionSubtitle}>{currentDocuments.length} құжат</p>
          </div>
        </div>

        {currentDocuments.length === 0 ? (
          <div style={styles.emptyState}>
            <FiFileText size={54} color="#9ca3af" />
            <h3 style={styles.emptyTitle}>Құжаттар жоқ</h3>
            <p style={styles.emptyText}>Бұл санатта құжат жоқ</p>
          </div>
        ) : (
          <div style={styles.documentsList}>
            {currentDocuments.map((doc) => (
              <div
                key={doc.id}
                style={{
                  ...styles.documentItem,
                  ...(highlightId === doc.id ? styles.documentItemHighlight : {})
                }}
              >
                <div style={styles.documentLeft}>
                  <div style={styles.fileIcon}>
                    <FiFileText size={24} color="#6366f1" />
                  </div>
                  <div style={styles.documentInfo}>
                    <h3 style={styles.fileName}>{doc.fileName}</h3>
                    <div style={styles.metaInfo}>
                      <span>{doc.owner?.username || 'User'}</span>
                      <span>•</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <span style={{...styles.smallBadge, ...getStatusBadgeStyle(doc.status)}}>
                      {getStatusText(doc.status)}
                    </span>
                  </div>
                </div>
                <div style={styles.actions}>
                  <Link to={`/document/${doc.id}`} style={styles.viewBtn}>
                    <FiEye size={16} /> Көру
                  </Link>
                  <button onClick={() => handleDelete(doc.id)} style={styles.deleteBtn}>
                                      <FiTrash2 size={16} /> Жою
                                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1300px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '14px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    margin: 0,
    color: '#111827'
  },
  subtitle: {
    marginTop: '6px',
    color: '#6b7280',
    fontSize: '14px'
  },
  adminBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '999px',
    fontWeight: '600',
    fontSize: '13px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  statCardActive: {
    border: '2px solid #6366f1',
    boxShadow: '0 4px 20px rgba(99,102,241,0.2)'
  },
  yellowIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    background: '#fef3c7',
    color: '#f59e0b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  greenIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    background: '#dcfce7',
    color: '#16a34a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  redIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    background: '#fee2e2',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statLabel: {
    margin: 0,
    color: '#6b7280',
    fontSize: '14px'
  },
  statValue: {
    margin: '6px 0 0',
    fontSize: '30px',
    fontWeight: '700',
    color: '#111827'
  },
  documentsCard: {
    background: '#fff',
    borderRadius: '22px',
    padding: '28px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  documentsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827'
  },
  sectionSubtitle: {
    marginTop: '6px',
    color: '#6b7280',
    fontSize: '14px'
  },
  documentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  documentItem: {
    border: '1px solid #f1f5f9',
    borderRadius: '18px',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    transition: 'all 0.3s'
  },
  documentItemHighlight: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    boxShadow: '0 4px 12px rgba(245,158,11,0.2)'
  },
  documentLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    flex: 1,
    minWidth: '260px'
  },
  fileIcon: {
    width: '58px',
    height: '58px',
    borderRadius: '16px',
    background: '#eef2ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  documentInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  fileName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827'
  },
  metaInfo: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    color: '#6b7280',
    fontSize: '13px'
  },
  smallBadge: {
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '600',
    width: 'fit-content'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  viewBtn: {
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    textDecoration: 'none'
  },
  deleteBtn: {
      background: '#ef4444',
      color: '#fff',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '600'
    },
  emptyState: {
    textAlign: 'center',
    padding: '70px 20px'
  },
  emptyTitle: {
    marginTop: '18px',
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827'
  },
  emptyText: {
    marginTop: '8px',
    color: '#6b7280',
    fontSize: '14px'
  },
  loadingContainer: {
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px'
  },
  loader: {
    width: '45px',
    height: '45px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
};

export default AdminPanel;