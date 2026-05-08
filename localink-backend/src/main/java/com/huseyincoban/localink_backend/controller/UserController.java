package com.huseyincoban.localink_backend.controller;

import com.huseyincoban.localink_backend.dto.user.UpdateProfileRequest;
import com.huseyincoban.localink_backend.dto.user.UserDto;
import com.huseyincoban.localink_backend.entity.User;
import com.huseyincoban.localink_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.http.MediaType;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getMe(Authentication auth) {
        return ResponseEntity.ok(userService.getMe(auth));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserDto> updateMe(
            Authentication auth,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(userService.updateMe(auth, request));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> search(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDto> uploadAvatar(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userService.uploadAvatar(currentUser, file));
    }
}
