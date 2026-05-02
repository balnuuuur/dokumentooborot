package com.example.project.controller;

import com.example.project.DTO.ApiResponse;
import com.example.project.entity.AuditLog;
import com.example.project.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<AuditLog>> getAllLogs() {
        try {
            List<AuditLog> logs = auditService.getAllLogs();
            return ApiResponse.success(logs);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/logs/user/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<AuditLog>> getLogsByUser(@PathVariable String username) {
        try {
            List<AuditLog> logs = auditService.getLogsByUsername(username);
            return ApiResponse.success(logs);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/logs/document/{documentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<AuditLog>> getLogsByDocument(@PathVariable Long documentId) {
        try {
            List<AuditLog> logs = auditService.getLogsByDocumentId(documentId);
            return ApiResponse.success(logs);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
