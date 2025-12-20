package com.huseyincoban.localink_backend.repository;

import com.huseyincoban.localink_backend.entity.Notification;
import com.huseyincoban.localink_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
}
