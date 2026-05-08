import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocumentById, addComment, getCommentsByDocument, deleteComment, updateComment } from '../services/api';
import { FiDownload, FiMessageSquare, FiCalendar, FiClock, FiArrowLeft, FiFileText, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [textPreview, setTextPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const currentUser = localStorage.getItem('username');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    loadDocument();
    loadComments();
  }, [id]);

  const loadDocument = async () => {
    try {
      const res = await getDocumentById(id);
      const documentData = res.data.data;

      setDoc(documentData);

      await loadPreview(documentData);
    } catch (err) {
      console.error(err);
      setError('Құжатты жүктеу қатесі');
      setLoading(false);
    }
  };

  const loadPreview = async (documentData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8080/api/documents/${id}/preview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Файл жүктелмеді');
      }

      if (documentData?.fileType?.includes('pdf')) {
      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);
      setPdfUrl(localUrl);
      }

      else if (
        documentData?.fileType?.includes('text') ||
        documentData?.fileName?.toLowerCase().endsWith('.txt')
      ) {
        const text = await response.text();
        setTextPreview(text);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setPdfUrl(null);
      setTextPreview('');
      setLoading(false);
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

  const handleDeleteComment = async (commentId, commentAuthor) => {
      if (commentAuthor !== currentUser && userRole !== 'ADMIN') {
        alert('Сіз бұл пікірді өшіре алмайсыз');
        return;
      }

      if (window.confirm('Бұл пікірді жойғыңыз келе ме?')) {
        try {
          await deleteComment(commentId);
          loadComments();
        } catch (err) {
          console.error(err);
          alert('Пікірді жою қатесі');
        }
      }
    };

    const canEditComment = (commentId) => {
    const comment = comments.find((c) => c.id === commentId);

     if (!comment) return false;

     return comment.author?.username === currentUser;
  };

    const startEditComment = (commentId, currentContent) => {
        if (!canEditComment(commentId)) {
          alert('Сіз бұл пікірді өңдей алмайсыз');
          return;
        }
        setEditingCommentId(commentId);
        setEditContent(currentContent);
      };

    const saveEditComment = async (commentId) => {
        if (!editContent.trim()) {
          alert('Пікір бос болуы мүмкін емес');
          return;
        }
        try {
          await updateComment(commentId, editContent);
          setEditingCommentId(null);
          setEditContent('');
          loadComments();
        } catch (err) {
          console.error(err);
          alert('Пікірді өңдеу қатесі');
        }
      };

    const cancelEditComment = () => {
        setEditingCommentId(null);
        setEditContent('');
      };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8080/api/documents/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = doc?.fileName || 'document';

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p>Жүктелуде...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p>{error}</p>
        <button
          onClick={() => navigate(-1)}
          style={styles.errorBtn}
        >
          Артқа
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <button
        onClick={() => navigate(-1)}
        style={styles.backBtn}
      >
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
              <h1 style={styles.title}>
                {doc?.fileName}
              </h1>

              <p style={styles.description}>
                {doc?.description || 'Сипаттама қосылмаған'}
              </p>

              <div style={styles.topInfo}>
                <span
                  style={{
                    ...styles.statusBadge,
                    ...getStatusStyle(doc?.status),
                  }}
                >
                  {getStatusText(doc?.status)}
                </span>

                <div style={styles.infoItem}>
                  <FiCalendar size={14} />
                  {new Date(doc?.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownload}
            style={styles.downloadBtn}
          >
            <FiDownload size={18} />
            Жүктеу
          </button>

          <div style={styles.previewCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                Құжат алдын ала қарау
              </h3>
            </div>

            <div style={styles.pdfContainer}>
              {doc?.fileType?.includes('pdf') && pdfUrl ? (

                  <object
                  data={pdfUrl}
                    type="application/pdf"
                    style={styles.pdfIframe}
                  >
                    <p>PDF ашылмады</p>
                  </object>

              ) : doc?.fileType?.includes('text') ||
                doc?.fileName?.toLowerCase().endsWith('.txt') ? (

                <div style={styles.txtPreview}>
                  <pre style={styles.txtContent}>
                    {textPreview}
                  </pre>
                </div>
              ) : (
                <div style={styles.previewBox}>
                  <FiFileText
                    size={70}
                    color="#667eea"
                  />

                  <p style={styles.previewText}>
                    Алдын ала қарау қолжетімсіз
                  </p>

                  <button
                    onClick={handleDownload}
                    style={styles.downloadPreviewBtn}
                  >
                    <FiDownload size={16} />
                    Жүктеу
                  </button>
                </div>
              )}
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
                <FiMessageSquare
                  size={40}
                  color="#cbd5e1"
                />

                <p>Пікірлер жоқ</p>
              </div>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  style={styles.commentItem}
                >
                  <div style={styles.commentAvatar}>
                    {c.author?.username
                      ?.charAt(0)
                      ?.toUpperCase() || 'U'}
                  </div>

                  <div style={styles.commentContent}>
                    <div style={styles.commentTop}>
                      <strong>
                        {c.author?.username}
                      </strong>

                      <span style={styles.commentDate}>
                        <FiClock size={12} />

                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {editingCommentId === c.id ? (
                      <div style={styles.editContainer}>
                         <textarea
                         value={editContent}
                         onChange={(e) => setEditContent(e.target.value)}
                         style={styles.editTextarea}
                         autoFocus
                        />
                      <div style={styles.editButtons}>
                          <button
                            onClick={() => saveEditComment(c.id)}
                            style={styles.saveEditBtn}
                          >
                            <FiCheck size={16} />
                            Сақтау
                      </button>

                          <button
                            onClick={cancelEditComment}
                            style={styles.cancelEditBtn}
                          >
                            <FiX size={16} />
                            Болдырмау
                       </button>
                    </div>
                 </div>
                    ) : (
                      <p style={styles.commentText}>
                        {c.content}
                      </p>

                 )}
                 </div>

                  <div style={styles.commentActions}>
                     {canEditComment(c.id) && (
                     <button
                        onClick={() =>
                          startEditComment(c.id, c.content)
                        }
                       style={styles.editCommentBtn}
                       >
                       <FiEdit2 size={16} />
                     </button>
                     )}

                    {(c.author?.username === currentUser ||
                      userRole === 'ADMIN') && (
                  <button
                        onClick={() =>
                          handleDeleteComment(
                            c.id,
                            c.author?.username
                          )
                        }
                    style={styles.deleteCommentBtn}
                    >
                    <FiTrash2 size={16} />
                  </button>
                )}
                  </div>
                </div>
              ))
            )}

            <div style={styles.commentInputBox}>
              <textarea
                placeholder="Пікір қалдыру..."
                value={newComment}
                onChange={(e) =>
                  setNewComment(e.target.value)
                }
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
            <h3 style={styles.infoTitle}>
              Құжат ақпараты
            </h3>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>
                Иесі
              </span>

              <span style={styles.infoValue}>
                {doc?.owner?.username}
              </span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>
                Құрылған
              </span>

              <span style={styles.infoValue}>
                {new Date(
                  doc?.uploadedAt
                ).toLocaleDateString()}
              </span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>
                Өзгертілген
              </span>

              <span style={styles.infoValue}>
                {new Date(
                  doc?.updatedAt
                ).toLocaleDateString()}
              </span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>
                Файл түрі
              </span>

              <span style={styles.infoValue}>
                {doc?.fileName
                  ?.split('.')
                  .pop()
                  ?.toUpperCase()}
              </span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>
                Өлшемі
              </span>

              <span style={styles.infoValue}>
                {(doc?.fileSize / 1024).toFixed(1)} KB
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
    marginBottom: '20px',
    fontWeight: '600',
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
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: '30px',
    fontWeight: '700',
    marginBottom: '12px',
  },

  description: {
    color: '#64748b',
    lineHeight: '1.7',
    marginBottom: '18px',
  },

  topInfo: {
    display: 'flex',
    gap: '12px',
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
    color: '#64748b',
    fontSize: '14px',
  },

  downloadBtn: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    padding: '12px 22px',
    borderRadius: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: 'fit-content',
    fontWeight: '600',
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
  },

  pdfContainer: {
    overflow: 'hidden',
    borderRadius: '20px',
    backgroundColor: '#f8fafc',
  },

  pdfIframe: {
    width: '100%',
    height: '700px',
    border: 'none',
  },

  txtPreview: {
    padding: '24px',
    backgroundColor: '#fff',
    maxHeight: '700px',
    overflowY: 'auto',
  },

  txtContent: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: '14px',
    lineHeight: '1.7',
    color: '#334155',
    fontFamily: 'monospace',
  },

  previewBox: {
    padding: '70px 20px',
    textAlign: 'center',
  },

  previewText: {
    marginTop: '18px',
    color: '#64748b',
  },

  downloadPreviewBtn: {
    marginTop: '20px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '12px',
    cursor: 'pointer',
  },

  commentsCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '28px',
    boxShadow: '0 4px 20px rgba(15,23,42,0.05)',
  },

  emptyComments: {
    textAlign: 'center',
    padding: '40px',
    color: '#94a3b8',
  },

  commentItem: {
    display: 'flex',
    gap: '14px',
    padding: '16px',
    borderRadius: '18px',
    backgroundColor: '#f8fafc',
    marginBottom: '16px',
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
  },

  commentContent: {
    flex: 1,
  },

  commentTop: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
    flexWrap: 'wrap',
  },

  commentDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#94a3b8',
    fontSize: '12px',
  },

  commentText: {
    color: '#475569',
    lineHeight: '1.6',
  },

  commentActions: {
    display: 'flex',
    gap: '4px',
    flexShrink: 0,
  },

  editCommentBtn: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    padding: '8px',
  },

  deleteCommentBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '8px',
  },

  editContainer: {
    width: '100%',
    marginTop: '8px',
  },

  editTextarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #6366f1',
    resize: 'vertical',
    minHeight: '80px',
    marginBottom: '10px',
    outline: 'none',
  },

  editButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },

  saveEditBtn: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
  },

  cancelEditBtn: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
  },

  commentInputBox: {
    marginTop: '20px',
  },

  textarea: {
    width: '100%',
    minHeight: '110px',
    padding: '16px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    resize: 'none',
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
  },

  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9',
  },

  infoLabel: {
    color: '#64748b',
  },

  infoValue: {
    fontWeight: '600',
    color: '#111827',
  },

  loadingContainer: {
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
  },

  loader: {
    width: '42px',
    height: '42px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
  },

  errorContainer: {
    textAlign: 'center',
    padding: '50px',
  },

  errorBtn: {
    marginTop: '20px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
  },
};

export default DocumentDetail;