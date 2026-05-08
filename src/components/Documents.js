import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyDocuments, deleteDocument, getCommentsByDocument, deleteComment } from '../services/api';
import { FiFileText, FiEye, FiTrash2, FiCalendar,} from 'react-icons/fi';

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await getMyDocuments();
      setDocuments(res.data.data || []);
      setError('');
    } catch (err) {
      setError('Құжаттарды жүктеу қатесі');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Бұл құжатты жойғыңыз келе ме?')) {
      try {
        await deleteDocument(id);
        const commentsRes = await getCommentsByDocument(id);
        const comments = commentsRes.data.data || [];

        for (const comment of comments) {
          await deleteComment(comment.id);
        }
           await deleteDocument(id);
           await loadDocuments();
      } catch (err) {
        console.error(err);
        setError('Жою қатесі: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Менің құжаттарым</h1>
          <p style={styles.subtitle}>
            Жүктелген барлық құжаттар тізімі
          </p>
        </div>

        <div style={styles.countBadge}>
          {documents.length} файл
        </div>
      </div>

      {documents.length === 0 ? (
        <div style={styles.emptyCard}>
          <FiFileText size={60} color="#9ca3af" />
          <h3 style={styles.emptyTitle}>Құжаттар жоқ</h3>
          <p style={styles.emptyText}>
            Сіз әлі ешқандай құжат жүктемедіңіз
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {documents.map((doc) => (
            <div
              key={doc.id}
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow =
                  '0 12px 24px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(0,0,0,0.05)';
              }}
            >
              <div style={styles.iconWrapper}>
                <FiFileText size={34} color="#6366f1" />
              </div>

              <h3 style={styles.fileName}>
                {doc.fileName}
              </h3>

              <div style={styles.dateBox}>
                <FiCalendar size={14} />
                <span>
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </span>
              </div>

              <div style={styles.buttons}>
                <Link
                  to={`/document/${doc.id}`}
                  style={styles.viewBtn}
                >
                  <FiEye size={15} />
                  Көру
                </Link>

                <button
                  onClick={() => handleDelete(doc.id)}
                  style={styles.deleteBtn}
                >
                  <FiTrash2 size={15} />
                  Жою
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '12px',
  },

  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: 0,
    color: '#111827',
  },

  subtitle: {
    marginTop: '6px',
    color: '#6b7280',
    fontSize: '14px',
  },

  countBadge: {
    backgroundColor: '#eef2ff',
    color: '#6366f1',
    padding: '10px 16px',
    borderRadius: '999px',
    fontWeight: '600',
    fontSize: '14px',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: '18px',
    padding: '24px',
    transition: '0.25s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  iconWrapper: {
    width: '72px',
    height: '72px',
    borderRadius: '18px',
    backgroundColor: '#eef2ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '18px',
  },

  fileName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '12px',
    textAlign: 'center',
    lineHeight: '1.4',
    wordBreak: 'break-word',
  },

  dateBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#6b7280',
    fontSize: '13px',
    marginBottom: '22px',
  },

  buttons: {
    display: 'flex',
    gap: '10px',
    width: '100%',
  },

  viewBtn: {
    flex: 1,
    backgroundColor: '#6366f1',
    color: '#fff',
    padding: '10px',
    borderRadius: '10px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '500',
  },

  deleteBtn: {
    flex: 1,
    backgroundColor: '#ef4444',
    color: '#fff',
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '500',
  },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '60px 20px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
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

export default Documents;