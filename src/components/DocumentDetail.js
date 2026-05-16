import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocumentById, addComment, getCommentsByDocument, deleteComment, updateComment, updateDocumentStatus, deleteDocument, uploadDocument, getAuditLogsByDocument } from '../services/api';
import { FiDownload, FiMessageSquare, FiCalendar, FiClock, FiArrowLeft, FiFileText, FiTrash2, FiEdit2, FiCheck, FiX, FiShield, FiUpload, } from 'react-icons/fi';

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
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showReplaceMenu, setShowReplaceMenu] = useState(false);
  const [replacementFile, setReplacementFile] = useState(null);
  const [replacing, setReplacing] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  const currentUser = localStorage.getItem('username');
  const userRole = localStorage.getItem('userRole');

  const canReplace = doc?.owner?.username === currentUser;
  const showAuditLogs = userRole === 'ADMIN';

  useEffect(() => {
    loadDocument();
    loadComments();
    loadAuditLogs();
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

  const loadAuditLogs = async () => {
      try {
        const res = await getAuditLogsByDocument(id);
        console.log('Audit logs:', res.data);
        setAuditLogs(res.data.data || []);
      } catch (err) {
        console.error('Audit logs жүктеу қатесі:', err);
      }
    };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment(id, newComment);
      setNewComment('');
      loadComments();
      loadAuditLogs();
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
          loadAuditLogs();
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
          loadAuditLogs();
        } catch (err) {
          console.error(err);
          alert('Пікірді өңдеу қатесі');
        }
      };

    const cancelEditComment = () => {
        setEditingCommentId(null);
        setEditContent('');
      };

    const handleStatusChange = async (newStatus, rejectionReason = null) => {
     try {
        await updateDocumentStatus(id, newStatus, rejectionReason);
        loadDocument();
        loadAuditLogs();
        setShowStatusMenu(false);
        alert(`Құжат статусы өзгертілді: ${getStatusText(newStatus)}`);
        } catch (err) {
        console.error(err);
        alert('Статус өзгерту қатесі');
      }
   };

   const handleReplaceDocument = async () => {
       if (!replacementFile) {
         alert('Файл таңдаңыз');
         return;
       }

       if (window.confirm('Бұл құжатты басқа файлмен ауыстырғыңыз келе ме? Ескі файл жойылады.')) {
         setReplacing(true);
         try {
           await deleteDocument(id);

           await uploadDocument(replacementFile, doc?.description, doc?.category);

           alert('Құжат сәтті ауыстырылды!');
           navigate('/documents');
         } catch (err) {
           console.error(err);
           alert('Құжатты ауыстыру қатесі: ' + (err.response?.data?.message || err.message));
         } finally {
           setReplacing(false);
           setShowReplaceMenu(false);
           setReplacementFile(null);
         }
       }
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

  const getAuditActionText = (action, actionType) => {
    if (actionType === 'UPLOAD') return 'Құжат жүктелді';
    if (actionType === 'COMMENT') return 'Пікір қалдырылды';
    if (actionType === 'UPDATE_STATUS') return 'Статус жаңарды';
    if (actionType === 'DELETE') return 'Құжат жойылды';
    if (actionType === 'UPDATE_COMMENT') return 'Пікір жаңартылды';

    if (action?.includes('upload')) return 'Құжат жүктелді';
    if (action?.includes('comment')) return 'Пікір қалдырылды';
    if (action?.includes('status')) return 'Статус жаңарды';
    if (action?.includes('delete')) return 'Құжат жойылды';

    return action || 'Әрекет';
  };

  const allStatuses = [
      { value: 'DRAFT', label: 'Жоба', color: '#374151', bg: '#e5e7eb' },
      { value: 'IN_REVIEW', label: 'Қарауда', color: '#92400e', bg: '#fef3c7' },
      { value: 'APPROVED', label: 'Бекітілген', color: '#166534', bg: '#dcfce7' },
      { value: 'REJECTED', label: 'Қабылданбады', color: '#991b1b', bg: '#fee2e2' }
    ];

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

  const currentStatus =
    allStatuses.find((s) => s.value === doc?.status) || allStatuses[0];

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

          {userRole === 'ADMIN' ? (
            <div style={styles.statusDropdown}>
            <button
             onClick={() => setShowStatusMenu(!showStatusMenu)}
             style={{...styles.statusButton, backgroundColor: currentStatus.bg, color: currentStatus.color,}}>
                <span style={styles.statusIcon}>
                   {currentStatus.icon}
                </span>
                    {currentStatus.label}
                    <span style={styles.dropdownArrow}>
                      ~
                    </span>
                  </button>

           {showStatusMenu && (
               <div style={styles.statusDropdownMenu}>
               {allStatuses.map((status) => (
                <button key={status.value} onClick={() => {
                    if (status.value === 'REJECTED') {
                        const reason = prompt('Қабылданбау себебін жазыңыз:');
                    if (reason) {handleStatusChange(status.value,reason);}
                    } else {handleStatusChange(status.value);}
                 }
               }
               style={{...styles.statusDropdownItem,backgroundColor: status.bg,color: status.color,}}>
                  <span style={styles.statusIcon}>
                       {status.icon}
                   </span>
                     {status.label}
                  </button>
                 ))}
               </div>
              )}
           </div>
            ) : (
              <span style={{...styles.statusBadge,backgroundColor: currentStatus.bg,color: currentStatus.color,}}>
                  <span style={styles.statusIcon}>
                    {currentStatus.icon}
                  </span>

                  {currentStatus.label}
                </span>
              )}

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Санат</span>
                <span style={styles.infoValue}>{doc?.category || 'Жоқ'}</span>
              </div>

              <div style={styles.topInfo}>
                <div style={styles.infoItem}>
                  <FiCalendar size={14} />
                  {new Date(doc?.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.actionButtonsRow}>
                      <button onClick={handleDownload} style={styles.downloadBtn}>
                        <FiDownload size={18} /> Жүктеу
                      </button>

          {canReplace && (<div style={styles.replaceDropdown}>
          <button onClick={() => setShowReplaceMenu(!showReplaceMenu)}
                style={styles.replaceBtn}
                disabled={replacing}>
           <FiUpload size={18} /> {replacing ? 'Ауыстырылуда...' : 'Құжатты ауыстыру'}
           </button>
          {showReplaceMenu && (<div style={styles.replaceMenu}>
          <input type="file" id="replaceFile" accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => setReplacementFile(e.target.files[0])}
            style={styles.fileInput}/>
          <label htmlFor="replaceFile" style={styles.fileInputLabel}>Файл таңдау</label>
             {replacementFile && (
             <>
             <p style={styles.selectedFileInfo}>Таңдалған: {replacementFile.name}</p>
          <button onClick={handleReplaceDocument} style={styles.confirmReplaceBtn}>
              Ауыстыруды растау
          </button>
         </>
        )}
    </div>
   )}
</div>
)}
</div>
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
        {showAuditLogs && (
          <div style={styles.auditCard}>
            <div style={styles.auditHeader}>
              <h3 style={styles.auditTitle}>Әрекеттер тарихы</h3>
            </div>
            <div style={styles.auditList}>
              {auditLogs.length === 0 ? (
                <p style={styles.auditEmpty}>Әрекеттер жоқ</p>
              ) : (
                auditLogs.map((log, index) => (
                 <div key={log.id || index} style={styles.auditItem}>
                 <div style={styles.auditContent}>
                   <p style={styles.auditAction}>
                     {log.actionType === 'UPLOAD' && 'Құжат жүктелді'}
                     {log.actionType === 'COMMENT' && 'Пікір қалдырылды'}
                     {log.actionType === 'UPDATE_STATUS' && 'Статус жаңарды'}
                     {log.actionType === 'DELETE' && 'Құжат жойылды'}
                     {!log.actionType && (log.action?.includes('жүктелді') ? 'Құжат жүктелді' : log.action)}
                   </p>
                 <div style={styles.auditMeta}>
                     <span style={styles.auditUser}>{log.username}</span>
                     <span style={styles.auditTime}>
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
               ))
             )}
          </div>
         </div>
        )}
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

statusDropdown: {
  position: 'relative',
  width: 'fit-content',
  marginBottom: '14px',
},

statusButton: {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  borderRadius: '999px',
  fontSize: '13px',
  fontWeight: '600',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
},

dropdownArrow: {
  fontSize: '10px',
  marginLeft: '2px',
  display: 'flex',
  alignItems: 'center',
},

statusDropdownMenu: {
  position: 'absolute',
  top: '110%',
  left: 0,
  backgroundColor: '#fff',
  borderRadius: '16px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  zIndex: 100,
  minWidth: '220px',
  border: '1px solid #e5e7eb',
  animation: 'fadeIn 0.2s ease',
},

statusDropdownItem: {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  padding: '12px 16px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.2s ease',
  textAlign: 'left',
},

statusIcon: {
  fontSize: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
},

statusBadge: {
  padding: '10px 16px',
  borderRadius: '999px',
  fontSize: '13px',
  fontWeight: '600',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
},

  actionButtonsRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  replaceDropdown: {
      position: 'relative',
  },

  replaceBtn: {
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '12px 22px',
    borderRadius: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
  },

  replaceMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '8px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    padding: '16px',
    minWidth: '250px',
    zIndex: 100,
    border: '1px solid #e2e8f0',
  },

  fileInput: {
    display: 'none',
  },

  fileInputLabel: {
    display: 'block',
    padding: '10px 16px',
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: '12px',
  },

  selectedFileInfo: {
    fontSize: '12px',
    color: '#10b981',
    marginBottom: '12px',
    wordBreak: 'break-all',
    textAlign: 'center',
  },

  confirmReplaceBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
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
auditCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(15,23,42,0.05)',
  },
  auditHeader: {
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e2e8f0',
  },
  auditTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    color: '#1f2937',
  },
  auditList: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  auditEmpty: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '13px',
    padding: '20px',
  },
  auditItem: {
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  auditAction: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#1f2937',
    margin: 0,
    marginBottom: '4px',
  },
  auditMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  auditUser: {
    fontSize: '11px',
    color: '#6366f1',
    fontWeight: '500',
  },
  auditTime: {
    fontSize: '10px',
    color: '#94a3b8',
  },
};

export default DocumentDetail;