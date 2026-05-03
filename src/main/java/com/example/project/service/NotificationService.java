package com.example.project.service;

import com.example.project.entity.Document;
import com.example.project.entity.Notification;
import com.example.project.entity.User;
import com.example.project.enums.DocumentStatus;
import com.example.project.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public void sendStatusNotification(Document document, DocumentStatus oldStatus, DocumentStatus newStatus) {
        User owner = document.getOwner();

        String title;
        String message;

        if (newStatus == DocumentStatus.APPROVED) {
            title = "Құжат бекітілді";
            message = String.format(
                    "Құжатыңыз \"%s\" бекітілді.",
                    document.getFileName()
            );
        } else if (newStatus == DocumentStatus.REJECTED) {
            title = "Құжат қабылданбады";
            String reason = document.getRejectionReason() != null
                    ? " Себебі: " + document.getRejectionReason()
                    : "";
            message = String.format(
                    "Құжатыңыз \"%s\" қабылданбады.%s",
                    document.getFileName(),
                    reason
            );
        } else if (newStatus == DocumentStatus.IN_REVIEW) {
            title = "Құжат қаралуда";
            message = String.format("Құжатыңыз \"%s\" қарау сатысына өтті.", document.getFileName());
        } else {
            return;
        }

        createNotification(owner, title, message, document.getId());
    }

    public void createNotification(User user, String title, String message, Long documentId) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setDocumentId(documentId);
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(String username) {
        User user = userService.findByUsername(username);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public List<Notification> getUnreadNotifications(String username) {
        User user = userService.findByUsername(username);
        return notificationRepository.findByUserIdAndIsReadFalse(user.getId());
    }

    public long getUnreadCount(String username) {
        User user = userService.findByUsername(username);
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    public Notification markAsRead(Long notificationId, String username) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Хабарлама табылмады. ID: " + notificationId));

        User user = userService.findByUsername(username);

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Бұл хабарлама сізге тиесілі емес");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String username) {
        User user = userService.findByUsername(username);
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(user.getId());

        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }
}
