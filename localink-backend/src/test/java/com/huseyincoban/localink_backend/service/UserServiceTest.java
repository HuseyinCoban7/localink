package com.huseyincoban.localink_backend.service.controller;

import com.huseyincoban.dto.user.UpdateProfileRequest;
import com.huseyincoban.dto.user.UserDto;
import com.huseyincoban.entity.User;
import com.huseyincoban.repository.UserRepository;
import com.huseyincoban.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserService userService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        // Her testten önce ortak bir User nesnesi hazırlayalım
        mockUser = User.builder()
                .id(1L)
                .username("burakcolak")
                .email("burak@example.com")
                .name("Burak Çolak")
                .bio("Eski Bio")
                .avatarUrl("old-avatar.jpg")
                .build();
    }

    @Test
    void getMe_ShouldReturnUserDto_WhenUserIsAuthenticated() {
        // Arrange (Hazırlık)
        when(authentication.getPrincipal()).thenReturn(mockUser);
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        // Act (Eylem)
        UserDto result = userService.getMe(authentication);

        // Assert (Doğrulama)
        assertNotNull(result);
        assertEquals("burakcolak", result.username()); // DTO'nun record olduğunu varsayıyorum
        verify(userRepository).save(mockUser); // Kaydetme işlemi çağrıldı mı? (LastOnline update için)
    }

    @Test
    void updateMe_ShouldUpdateFields_WhenRequestIsValid() {
        // Arrange
        UpdateProfileRequest request = new UpdateProfileRequest(
                "Yeni İsim",
                "Yeni Bio",
                "new-avatar.jpg"
        );

        when(authentication.getPrincipal()).thenReturn(mockUser);
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        // Act
        UserDto result = userService.updateMe(authentication, request);

        // Assert
        assertEquals("Yeni İsim", mockUser.getName());
        assertEquals("Yeni Bio", mockUser.getBio());
        assertEquals("new-avatar.jpg", mockUser.getAvatarUrl());
        verify(userRepository).save(mockUser);
    }

    @Test
    void updateMe_ShouldNotUpdateNullFields() {
        // Arrange - Sadece ismi güncellemek istiyoruz, diğerleri null
        UpdateProfileRequest request = new UpdateProfileRequest(
                "Sadece İsim",
                null,
                null
        );

        when(authentication.getPrincipal()).thenReturn(mockUser);
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        // Act
        userService.updateMe(authentication, request);

        // Assert
        assertEquals("Sadece İsim", mockUser.getName());
        assertEquals("Eski Bio", mockUser.getBio()); // Değişmemeli
    }

    @Test
    void searchUsers_ShouldReturnUserList() {
        // Arrange
        String query = "burak";
        when(userRepository.findByNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(query, query))
                .thenReturn(List.of(mockUser));

        // Act
        List<UserDto> results = userService.searchUsers(query);

        // Assert
        assertFalse(results.isEmpty());
        assertEquals(1, results.size());
        assertEquals("burakcolak", results.get(0).username());
    }
}