package com.huseyincoban.localink_backend.controller;

import com.huseyincoban.localink_backend.config.JwtService;
import com.huseyincoban.localink_backend.dto.auth.LoginResponse;
import com.huseyincoban.localink_backend.repository.UserRepository;
import com.huseyincoban.localink_backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.huseyincoban.localink_backend.dto.auth.RegisterRequest;
import com.huseyincoban.localink_backend.dto.auth.LoginRequest;
import com.huseyincoban.localink_backend.entity.User;
import com.huseyincoban.localink_backend.dto.user.UserDto;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestParam String refreshToken) {
        Long userId = jwtService.extractUserId(refreshToken);
        User user = userRepository.findById(userId).orElseThrow();
        String accessToken = jwtService.generateAccessToken(user);
        String newRefresh = jwtService.generateRefreshToken(user);

        LoginResponse response = new LoginResponse(accessToken, newRefresh,
                new UserDto(
                        user.getId(), user.getName(), user.getUsername(),
                        user.getEmail(), user.getBio(), user.getAvatarUrl(), user.getLastOnline()
                ));
        return ResponseEntity.ok(response);
    }

}
