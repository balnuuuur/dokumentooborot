package com.example.project.service;

import com.example.project.DTO.DocumentStatusRequest;
import com.example.project.entity.AuditLog;
import com.example.project.entity.Document;
import com.example.project.entity.User;
import com.example.project.enums.ActionType;
import com.example.project.enums.DocumentStatus;
import com.example.project.repository.AuditLogRepository;
import com.example.project.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final AuditLogRepository auditLogRepository;
    private final NotificationService notificationService;

    public Document uploadDocument(MultipartFile file, String username, String description) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("Файл бос. Құжат таңдаңыз.");
        }

        if (!fileStorageService.isFileValid(file)) {
            throw new RuntimeException("Тек PDF немесе DOC файлдары рұқсат етіледі");
        }

        String filePath = fileStorageService.saveFile(file);

        User owner = userService.findByUsername(username);

        Document document = new Document();
        document.setFileName(file.getOriginalFilename());
        document.setFilePath(filePath);
        document.setFileType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setOwner(owner);
        document.setStatus(DocumentStatus.DRAFT);

        Document savedDocument = documentRepository.save(document);

        saveAuditLog(username, ActionType.UPLOAD, "Құжат жүктелді: " + document.getFileName(), savedDocument.getId());

        return savedDocument;
    }

    public Document getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Құжат табылмады. ID: " + id));
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public List<Document> getUserDocuments(String username) {
        User user = userService.findByUsername(username);
        return documentRepository.findByOwnerId(user.getId());
    }

    public Document updateDocumentStatus(Long documentId, DocumentStatusRequest request, String adminUsername) {
        Document document = getDocumentById(documentId);
        DocumentStatus oldStatus = document.getStatus();
        DocumentStatus newStatus = request.getStatus();

        document.setStatus(newStatus);

        if (newStatus == DocumentStatus.REJECTED) {
            document.setRejectionReason(request.getRejectionReason());
        }

        Document updatedDocument = documentRepository.save(document);

        String actionMessage = "Статус өзгертілді: " + oldStatus + " - " + newStatus;
        saveAuditLog(adminUsername, ActionType.UPDATE_STATUS, actionMessage, documentId);

        notificationService.sendStatusNotification(document, oldStatus, newStatus);

        return updatedDocument;
    }

    public void deleteDocument(Long id, String username) throws IOException {
        Document document = getDocumentById(id);

        User user = userService.findByUsername(username);
        if (!user.getRole().name().equals("ADMIN") && !document.getOwner().getUsername().equals(username)) {
            throw new RuntimeException("Бұл құжатты жоюға рұқсат жоқ");
        }

        fileStorageService.deleteFile(document.getFilePath());

        saveAuditLog(username, ActionType.DELETE, "Құжат жойылды: " + document.getFileName(), id);

        documentRepository.delete(document);
    }

    private void saveAuditLog(String username, ActionType actionType, String details, Long documentId) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUsername(username);
        auditLog.setActionType(actionType);
        auditLog.setAction(actionType.name());
        auditLog.setDetails(details);
        auditLog.setDocumentId(documentId);
        auditLogRepository.save(auditLog);
    }
}
