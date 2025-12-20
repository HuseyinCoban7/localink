package com.huseyincoban.localink_backend.service;

import com.huseyincoban.localink_backend.dto.notification.NotificationDto;
import com.huseyincoban.localink_backend.entity.Notification;
import com.huseyincoban.localink_backend.entity.User;
import com.huseyincoban.localink_backend.entity.enums.NotificationType;
import com.huseyincoban.localink_backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(User user, NotificationType type, String message) {
        Notification n = Notification.builder()
                .user(user)
                .type(type)
                .message(message)
                .build();
        return notificationRepository.save(n);
    }

    public List<NotificationDto> getMyNotifications(Authentication auth) {
        User current = (User) auth.getPrincipal();
        return notificationRepository.findByUserOrderByCreatedAtDesc(current)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public NotificationDto markRead(Authentication auth, Long id) {
        User current = (User) auth.getPrincipal();
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bildirim bulunamadı."));
        if (!n.getUser().getId().equals(current.getId())) {
            throw new IllegalStateException("Bu bildirimi sadece sahibi okuyabilir.");
        }
        n.setReadAt(Instant.now());
        n = notificationRepository.save(n);
        return toDto(n);
    }

    private NotificationDto toDto(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getType(),
                n.getMessage(),
                n.getCreatedAt(),
                n.getReadAt()
        );
    }
}
