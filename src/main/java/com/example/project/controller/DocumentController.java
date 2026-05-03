package com.example.project.controller;

import com.example.project.DTO.ApiResponse;
import com.example.project.DTO.DocumentStatusRequest;
import com.example.project.entity.Document;
import com.example.project.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Document> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        try {
            Document document = documentService.uploadDocument(file, username, description);
            return ApiResponse.success("Құжат сәтті жүктелді", document);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<Document>> getAllDocuments() {
        try {
            List<Document> documents = documentService.getAllDocuments();
            return ApiResponse.success(documents);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/my")
    public ApiResponse<List<Document>> getMyDocuments() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        try {
            List<Document> documents = documentService.getUserDocuments(username);
            return ApiResponse.success(documents);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<Document> getDocumentById(@PathVariable Long id) {
        try {
            Document document = documentService.getDocumentById(id);
            return ApiResponse.success(document);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<byte[]> previewDocument(@PathVariable Long id) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            byte[] fileContent = documentService.getFileContent(id, username);
            Document document = documentService.getDocumentById(id);

            String contentType = document.getFileType() != null ? document.getFileType() : "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + document.getFileName() + "\"")
                    .body(fileContent);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/advanced-search")
    public ApiResponse<List<Document>> advancedSearch(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long minSize,
            @RequestParam(required = false) Long maxSize,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        try {
            List<Document> documents = documentService.searchDocumentsAdvanced(
                    username, keyword, status, minSize, maxSize, startDate, endDate
            );
            return ApiResponse.success("Іздеу нәтижелері", documents);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Document> updateStatus(@PathVariable Long id, @RequestBody DocumentStatusRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Document document = documentService.updateDocumentStatus(id, request, username);
            return ApiResponse.success("Құжат статусы өзгертілді", document);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteDocument(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        try {
            documentService.deleteDocument(id, username);
            return ApiResponse.success("Құжат сәтті жойылды", null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
