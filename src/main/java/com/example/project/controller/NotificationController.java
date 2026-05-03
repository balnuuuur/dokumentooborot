package com.example.project.controller;

import com.example.project.DTO.ApiResponse;
import com.example.project.entity.Notification;
import com.example.project.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ApiResponse<List<Notification>> getUserNotifications() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            List<Notification> notifications = notificationService.getUserNotifications(username);
            return ApiResponse.success("Хабарламалар тізімі", notifications);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/unread")
    public ApiResponse<List<Notification>> getUnreadNotifications() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            List<Notification> notifications = notificationService.getUnreadNotifications(username);
            return ApiResponse.success("Оқылмаған хабарламалар", notifications);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/unread/count")
    public ApiResponse<Long> getUnreadCount() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            long count = notificationService.getUnreadCount(username);
            return ApiResponse.success("Оқылмаған хабарламалар саны", count);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/read")
    public ApiResponse<Notification> markAsRead(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Notification notification = notificationService.markAsRead(id, username);
            return ApiResponse.success("Хабарлама оқылды", notification);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/read-all")
    public ApiResponse<String> markAllAsRead() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            notificationService.markAllAsRead(username);
            return ApiResponse.success("Барлық хабарламалар оқылды", null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
