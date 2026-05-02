package com.example.project.service;

import com.example.project.entity.Comment;
import com.example.project.entity.Document;
import com.example.project.entity.User;
import com.example.project.repository.CommentRepository;
import com.example.project.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final DocumentRepository documentRepository;
    private final UserService userService;
    private final AuditService auditService;

    public Comment addComment(Long documentId, String username, String content) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Құжат табылмады. ID: " + documentId));

        User author = userService.findByUsername(username);

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setAuthor(author);
        comment.setDocument(document);

        Comment saved = commentRepository.save(comment);

        auditService.log(username, "Пікір қалдырылды: " + document.getFileName(), documentId);

        return saved;
    }

    public List<Comment> getCommentsByDocument(Long documentId) {
        return commentRepository.findByDocumentId(documentId);
    }

    public Comment updateComment(Long commentId, String username, String newContent) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Пікір табылмады. ID: " + commentId));

        if (!comment.getAuthor().getUsername().equals(username)) {
            throw new RuntimeException("Бұл пікірді жаңартуға рұқсат жоқ");
        }

        comment.setContent(newContent);
        Comment saved = commentRepository.save(comment);

        auditService.log(username, "Пікір жаңартылды. ID: " + commentId, comment.getDocument().getId());

        return saved;
    }

    public void deleteComment(Long commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Пікір табылмады. ID: " + commentId));

        User user = userService.findByUsername(username);

        if (!comment.getAuthor().getUsername().equals(username) && !user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Бұл пікірді жоюға рұқсат жоқ");
        }

        commentRepository.delete(comment);

        auditService.log(username, "Пікір жойылды. ID: " + commentId, comment.getDocument().getId());
    }
}
