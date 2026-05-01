package com.example.project.repository;

import com.example.project.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByDocumentId(Long documentId);
    List<Comment> findByAuthorId(Long authorId);
}
