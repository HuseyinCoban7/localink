package com.huseyincoban.localink_backend.service;

import com.huseyincoban.localink_backend.dto.user.UpdateProfileRequest;
import com.huseyincoban.localink_backend.dto.user.UserDto;
import com.huseyincoban.localink_backend.entity.User;
import com.huseyincoban.localink_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getCurrentUser(Authentication auth) {
        return (User) auth.getPrincipal();
    }

    public UserDto getMe(Authentication auth) {
        User user = getCurrentUser(auth);
        user.setLastOnline(Instant.now());
        userRepository.save(user);
        return toDto(user);
    }

    public UserDto updateMe(Authentication auth, UpdateProfileRequest request) {
        User user = getCurrentUser(auth);
        if (request.name() != null) user.setName(request.name());
        if (request.bio() != null) user.setBio(request.bio());
        if (request.avatarUrl() != null) user.setAvatarUrl(request.avatarUrl());
        user = userRepository.save(user);
        return toDto(user);
    }

    public List<UserDto> searchUsers(String query) {
        return userRepository
                .findByNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(query, query)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public UserDto uploadAvatar(User currentUser, MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("Dosya boş olamaz.");
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("Sadece görsel dosyası yüklenebilir.");
            }

            Path avatarDir = Paths.get(uploadDir, "avatars");
            Files.createDirectories(avatarDir);

            String originalFilename = file.getOriginalFilename();
            String extension = ".jpg";

            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String filename = "avatar-user-" + currentUser.getId() + "-" + System.currentTimeMillis() + extension;
            Path targetPath = avatarDir.resolve(filename);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String avatarUrl = "/uploads/avatars/" + filename;

            currentUser.setAvatarUrl(avatarUrl);
            User saved = userRepository.save(currentUser);

            return toDto(saved);
        } catch (IOException e) {
            throw new RuntimeException("Avatar yüklenirken hata oluştu.");
        }
    }

    private UserDto toDto(User user) {
        return new UserDto(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getLastOnline()
        );
    }

}
