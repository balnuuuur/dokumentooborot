package com.example.project.controller;

import com.example.project.DTO.ApiResponse;
import com.example.project.DTO.LoginRequest;
import com.example.project.DTO.RegisterRequest;
import com.example.project.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ApiResponse<String> register(@Valid @RequestBody RegisterRequest request) {
        try {
            String message = userService.register(request);
            return ApiResponse.success(message, null);
        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ApiResponse<String> login(@Valid @RequestBody LoginRequest request) {
        try {
            String token = userService.login(request);
            return ApiResponse.success("Сәтті кірдіңіз", token);
        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
