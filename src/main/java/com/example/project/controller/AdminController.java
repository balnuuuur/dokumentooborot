package com.example.project.controller;

import com.example.project.DTO.ApiResponse;
import com.example.project.entity.AuditLog;
import com.example.project.entity.User;
import com.example.project.repository.UserRepository;
import com.example.project.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AuditService auditService;
    private final UserRepository userRepository;

    @GetMapping("/users")
    public ApiResponse<List<User>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return ApiResponse.success(users);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/audit-logs")
    public ApiResponse<List<AuditLog>> getAllAuditLogs() {
        try {
            List<AuditLog> logs = auditService.getAllLogs();
            return ApiResponse.success(logs);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
