package com.example.project.controller;

import com.example.project.DTO.ApiResponse;
import com.example.project.DTO.ChangePasswordRequest;
import com.example.project.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/change-password")
    public ApiResponse<String> changePassword(@RequestBody ChangePasswordRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            userService.changePassword(username, request);
            return ApiResponse.success("Құпия сөз сәтті өзгертілді", null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @DeleteMapping("/delete-account")
    public ApiResponse<String> deleteAccount() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            userService.deleteAccount(username);
            return ApiResponse.success("Аккаунт сәтті жойылды", null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
