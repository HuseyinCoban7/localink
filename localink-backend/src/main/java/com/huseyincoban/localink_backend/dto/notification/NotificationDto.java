package com.huseyincoban.localink_backend.dto.notification;

import com.huseyincoban.localink_backend.entity.enums.NotificationType;

import java.time.Instant;

public record NotificationDto(
        Long id,
        NotificationType type,
        String message,
        Instant createdAt,
        Instant readAt
) {}