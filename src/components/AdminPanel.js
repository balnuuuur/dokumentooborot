import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDocuments, updateDocumentStatus, } from '../services/api';
import { FiCheckCircle, FiXCircle, FiClock, FiUsers, FiFileText, } from 'react-icons/fi';

function AdminPanel() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

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
      const res = await getAllDocuments();

      const docs = res.data.data || [];

      setDocuments(docs);

      setStats({
        pending: docs.filter(
          (d) => d.status === 'IN_REVIEW'
        ).length,

        approved: docs.filter(
          (d) =>
            d.status === 'APPROVED' &&
            new Date(d.updatedAt).toDateString() ===
              new Date().toDateString()
        ).length,

        rejected: docs.filter(
          (d) =>
            d.status === 'REJECTED' &&
            new Date(d.updatedAt).toDateString() ===
              new Date().toDateString()
        ).length,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatus = async (
    id,
    status,
    rejectionReason = null
  ) => {
    try {
      await updateDocumentStatus(id, {
        status,
        rejectionReason,
      });

      loadDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  if (userRole !== 'ADMIN') return null;

  const pendingDocuments = documents.filter(
    (d) => d.status === 'IN_REVIEW'
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Әкімші панелі
          </h1>

          <p style={styles.subtitle}>
            Құжаттарды тексеру және басқару
          </p>
        </div>

        <div style={styles.adminBadge}>
          <FiUsers size={16} />
          ADMIN
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.yellowIcon}>
            <FiClock size={24} />
          </div>

          <div>
            <p style={styles.statLabel}>
              Қарауда
            </p>

            <h2 style={styles.statValue}>
              {stats.pending}
            </h2>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.greenIcon}>
            <FiCheckCircle size={24} />
          </div>

          <div>
            <p style={styles.statLabel}>
              Бүгін бекітілген
            </p>

            <h2 style={styles.statValue}>
              {stats.approved}
            </h2>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.redIcon}>
            <FiXCircle size={24} />
          </div>

          <div>
            <p style={styles.statLabel}>
              Бүгін қабылданбаған
            </p>

            <h2 style={styles.statValue}>
              {stats.rejected}
            </h2>
          </div>
        </div>
      </div>

      <div style={styles.documentsCard}>
        <div style={styles.documentsHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Жіберілген құжаттар
            </h2>

            <p style={styles.sectionSubtitle}>
              Тексеруді қажет ететін файлдар
            </p>
          </div>

          <div style={styles.pendingBadge}>
            {pendingDocuments.length} құжат
          </div>
        </div>

        {pendingDocuments.length === 0 ? (
          <div style={styles.emptyState}>
            <FiFileText
              size={54}
              color="#9ca3af"
            />

            <h3 style={styles.emptyTitle}>
              Қараудағы құжаттар жоқ
            </h3>

            <p style={styles.emptyText}>
              Барлық құжаттар тексерілген
            </p>
          </div>
        ) : (
          <div style={styles.documentsList}>
            {pendingDocuments.map((doc) => (
              <div
                key={doc.id}
                style={styles.documentItem}
              >
                <div style={styles.documentLeft}>
                  <div style={styles.fileIcon}>
                    <FiFileText
                      size={24}
                      color="#6366f1"
                    />
                  </div>

                  <div style={styles.documentInfo}>
                    <h3 style={styles.fileName}>
                      {doc.fileName}
                    </h3>

                    <div style={styles.metaInfo}>
                      <span>
                        {' '}
                        {doc.owner?.username ||
                          'User'}
                      </span>

                      <span>•</span>

                      <span>
                        {' '}
                        {new Date(
                          doc.uploadedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={styles.actions}>
                  <button
                    onClick={() =>
                      handleStatus(
                        doc.id,
                        'APPROVED'
                      )
                    }
                    style={styles.approveBtn}
                  >
                    <FiCheckCircle size={16} />
                    Бекіту
                  </button>

                  <button
                    onClick={() => {
                      const reason = prompt(
                        'Қабылданбау себебін жазыңыз:'
                      );

                      if (reason) {
                        handleStatus(
                          doc.id,
                          'REJECTED',
                          reason
                        );
                      }
                    }}
                    style={styles.rejectBtn}
                  >
                    <FiXCircle size={16} />
                    Қабылдамау
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
    margin: '0 auto',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '14px',
  },

  title: {
    fontSize: '32px',
    fontWeight: '700',
    margin: 0,
    color: '#111827',
  },

  subtitle: {
    marginTop: '6px',
    color: '#6b7280',
    fontSize: '14px',
  },

  adminBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background:
      'linear-gradient(135deg,#6366f1,#8b5cf6)',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '999px',
    fontWeight: '600',
    fontSize: '13px',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(260px,1fr))',
    gap: '20px',
    marginBottom: '30px',
  },

  statCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },

  yellowIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    background: '#fef3c7',
    color: '#f59e0b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  greenIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    background: '#dcfce7',
    color: '#16a34a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  redIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    background: '#fee2e2',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statLabel: {
    margin: 0,
    color: '#6b7280',
    fontSize: '14px',
  },

  statValue: {
    margin: '6px 0 0',
    fontSize: '30px',
    fontWeight: '700',
    color: '#111827',
  },

  documentsCard: {
    background: '#fff',
    borderRadius: '22px',
    padding: '28px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },

  documentsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827',
  },

  sectionSubtitle: {
    marginTop: '6px',
    color: '#6b7280',
    fontSize: '14px',
  },

  pendingBadge: {
    background: '#eef2ff',
    color: '#6366f1',
    padding: '10px 16px',
    borderRadius: '999px',
    fontWeight: '600',
    fontSize: '13px',
  },

  documentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
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
    transition: '0.2s',
  },

  documentLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    flex: 1,
    minWidth: '260px',
  },

  fileIcon: {
    width: '58px',
    height: '58px',
    borderRadius: '16px',
    background: '#eef2ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  documentInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  fileName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
  },

  metaInfo: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    color: '#6b7280',
    fontSize: '13px',
  },

  actions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },

  approveBtn: {
    background:
      'linear-gradient(135deg,#22c55e,#16a34a)',
    color: '#fff',
    border: 'none',
    padding: '12px 18px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
  },

  rejectBtn: {
    background:
      'linear-gradient(135deg,#ef4444,#dc2626)',
    color: '#fff',
    border: 'none',
    padding: '12px 18px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
  },

  emptyState: {
    textAlign: 'center',
    padding: '70px 20px',
  },

  emptyTitle: {
    marginTop: '18px',
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
  },

  emptyText: {
    marginTop: '8px',
    color: '#6b7280',
    fontSize: '14px',
  },
};

export default AdminPanel;