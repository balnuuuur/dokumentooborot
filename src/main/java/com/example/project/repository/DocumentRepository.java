package com.example.project.repository;

import com.example.project.entity.Document;
import com.example.project.enums.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByOwnerId(Long ownerId);
    List<Document> findByStatus(DocumentStatus status);
    List<Document> findByOwnerIdAndStatus(Long ownerId, DocumentStatus status);
}
