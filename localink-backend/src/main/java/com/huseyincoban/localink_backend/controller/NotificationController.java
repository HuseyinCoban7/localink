package com.huseyincoban.localink_backend.controller;

import com.huseyincoban.localink_backend.dto.notification.NotificationDto;
import com.huseyincoban.localink_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> list(Authentication auth) {
        return ResponseEntity.ok(notificationService.getMyNotifications(auth));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markRead(
            Authentication auth,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(notificationService.markRead(auth, id));
    }
}
