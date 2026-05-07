import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocumentById, addComment, getCommentsByDocument, } from '../services/api';
import { FiDownload, FiUser, FiMessageSquare, FiCalendar, FiClock, FiArrowLeft, FiFileText, } from 'react-icons/fi';

function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadDocument();
    loadComments();
  }, [id]);

  const loadDocument = async () => {
    try {
      const res = await getDocumentById(id);
      setDoc(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadComments = async () => {
    try {
      const res = await getCommentsByDocument(id);
      setComments(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment(id, newComment);
      setNewComment('');
      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPROVED':
        return {
          backgroundColor: '#dcfce7',
          color: '#166534',
        };

      case 'REJECTED':
        return {
          backgroundColor: '#fee2e2',
          color: '#991b1b',
        };

      case 'IN_REVIEW':
        return {
          backgroundColor: '#fef3c7',
          color: '#92400e',
        };

      default:
        return {
          backgroundColor: '#e5e7eb',
          color: '#374151',
        };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'Бекітілген';

      case 'REJECTED':
        return 'Қабылданбады';

      case 'IN_REVIEW':
        return 'Қарауда';

      default:
        return 'Жоба';
    }
  };

  if (!doc) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p>Жүктелуде...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        <FiArrowLeft size={18} />
        Артқа
      </button>

      <div style={styles.container}>
        <div style={styles.main}>
          <div style={styles.headerCard}>
            <div style={styles.fileIcon}>
              <FiFileText size={32} />
            </div>

            <div style={styles.headerContent}>
              <h1 style={styles.title}>{doc.fileName}</h1>

              <p style={styles.description}>
                {doc.description ||
                  'Сипаттама қосылмаған'}
              </p>

              <div style={styles.topInfo}>
                <span
                  style={{
                    ...styles.statusBadge,
                    ...getStatusStyle(doc.status),
                  }}
                >
                  {getStatusText(doc.status)}
                </span>

                <div style={styles.infoItem}>
                  <FiCalendar size={14} />
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.actionsRow}>
            <button style={styles.downloadBtn}>
              <FiDownload size={18} />
              Жүктеу
            </button>
          </div>

          <div style={styles.previewCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Құжат алдын ала қарау</h3>
            </div>

            <div style={styles.previewBox}>
              <FiFileText size={80} color="#667eea" />

              <p style={styles.previewText}>
                Құжат preview осы жерде көрсетіледі
              </p>

              <span style={styles.previewPages}> Бет 1 / 12</span>
            </div>
          </div>

          <div style={styles.commentsCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                Пікірлер ({comments.length})
              </h3>
            </div>

            {comments.length === 0 ? (
              <div style={styles.emptyComments}>
                <FiMessageSquare size={40} color="#cbd5e1" />
                <p>Пікірлер әлі жоқ</p>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.id} style={styles.commentItem}>
                  <div style={styles.commentAvatar}>
                    {c.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>

                  <div style={styles.commentContent}>
                    <div style={styles.commentTop}>
                      <strong>{c.author?.username}</strong>

                      <span style={styles.commentDate}>
                        <FiClock size={12} />
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p style={styles.commentText}>{c.content}</p>
                  </div>
                </div>
              ))
            )}

            <div style={styles.commentInputBox}>
              <textarea
                placeholder="Пікір қалдыру..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={styles.textarea}
              />

              <button
                onClick={handleAddComment}
                style={styles.addCommentBtn}
              >
                <FiMessageSquare size={16} />
                Пікір қосу
              </button>
            </div>
          </div>
        </div>

        <div style={styles.sidebar}>
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>Құжат ақпараты</h3>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Иесі</span>
              <span style={styles.infoValue}>
                {doc.owner?.username || 'Unknown'}
              </span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Құрылған күні</span>
              <span style={styles.infoValue}>
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Соңғы өзгерту</span>
              <span style={styles.infoValue}>
                {new Date(doc.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Статус</span>

              <span
                style={{
                  ...styles.smallStatus,
                  ...getStatusStyle(doc.status),
                }}
              >
                {getStatusText(doc.status)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    paddingBottom: '40px',
  },

  container: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    alignItems: 'start',
  },

  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  sidebar: {
    position: 'sticky',
    top: '100px',
  },

  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    marginBottom: '24px',
    fontSize: '15px',
    fontWeight: '500',
  },

  headerCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '28px',
    display: 'flex',
    gap: '20px',
    boxShadow: '0 4px 20px rgba(15,23,42,0.05)',
  },

  fileIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    backgroundColor: '#eef2ff',
    color: '#667eea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: '30px',
    fontWeight: '700',
    marginBottom: '14px',
    color: '#111827',
  },

  description: {
    color: '#6b7280',
    lineHeight: '1.7',
    marginBottom: '18px',
  },

  topInfo: {
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  statusBadge: {
    padding: '8px 16px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '600',
  },

  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#6b7280',
    fontSize: '14px',
  },

  actionsRow: {
    display: 'flex',
    gap: '16px',
  },

  downloadBtn: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    padding: '12px 22px',
    borderRadius: '14px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: '600',
    fontSize: '14px',
  },

  previewCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '28px',
    boxShadow: '0 4px 20px rgba(15,23,42,0.05)',
  },

  sectionHeader: {
    marginBottom: '20px',
  },

  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
  },

  previewBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '20px',
    padding: '70px 20px',
    textAlign: 'center',
    border: '2px dashed #dbeafe',
  },

  previewText: {
    marginTop: '20px',
    color: '#64748b',
    fontSize: '15px',
  },

  previewPages: {
    display: 'inline-block',
    marginTop: '14px',
    color: '#94a3b8',
    fontSize: '14px',
  },

  commentsCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '28px',
    boxShadow: '0 4px 20px rgba(15,23,42,0.05)',
  },

  emptyComments: {
    textAlign: 'center',
    padding: '50px 20px',
    color: '#94a3b8',
  },

  commentItem: {
    display: 'flex',
    gap: '14px',
    marginBottom: '18px',
    padding: '16px',
    borderRadius: '18px',
    backgroundColor: '#f8fafc',
  },

  commentAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    flexShrink: 0,
  },

  commentContent: {
    flex: 1,
  },

  commentTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
    flexWrap: 'wrap',
    gap: '8px',
  },

  commentDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#94a3b8',
  },

  commentText: {
    margin: 0,
    color: '#475569',
    lineHeight: '1.6',
  },

  commentInputBox: {
    marginTop: '24px',
  },

  textarea: {
    width: '100%',
    minHeight: '110px',
    padding: '16px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    resize: 'none',
    fontSize: '14px',
    outline: 'none',
    marginBottom: '16px',
    boxSizing: 'border-box',
  },

  addCommentBtn: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
  },

  infoCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(15,23,42,0.05)',
  },

  infoTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#111827',
  },

  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid #f1f5f9',
    gap: '10px',
  },

  infoLabel: {
    color: '#64748b',
    fontSize: '14px',
  },

  infoValue: {
    color: '#111827',
    fontWeight: '600',
    fontSize: '14px',
  },

  smallStatus: {
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '600',
  },

  loadingContainer: {
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    color: '#64748b',
  },

  loader: {
    width: '42px',
    height: '42px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

export default DocumentDetail;