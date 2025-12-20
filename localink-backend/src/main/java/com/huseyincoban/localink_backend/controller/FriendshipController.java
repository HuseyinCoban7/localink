package com.huseyincoban.localink_backend.controller;

import com.huseyincoban.localink_backend.dto.friendship.FriendshipDto;
import com.huseyincoban.localink_backend.entity.enums.FriendshipStatus;
import com.huseyincoban.localink_backend.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    @PostMapping("/{userId}/request")
    public ResponseEntity<FriendshipDto> sendRequest(
            Authentication auth,
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(friendshipService.sendRequest(auth, userId));
    }

    @PostMapping("/{friendshipId}/accept")
    public ResponseEntity<FriendshipDto> accept(
            Authentication auth,
            @PathVariable Long friendshipId
    ) {
        return ResponseEntity.ok(friendshipService.acceptRequest(auth, friendshipId));
    }

    @PostMapping("/{friendshipId}/reject")
    public ResponseEntity<FriendshipDto> reject(
            Authentication auth,
            @PathVariable Long friendshipId
    ) {
        return ResponseEntity.ok(friendshipService.rejectRequest(auth, friendshipId));
    }

    @GetMapping
    public ResponseEntity<List<FriendshipDto>> list(
            Authentication auth,
            @RequestParam(defaultValue = "ACCEPTED") FriendshipStatus status
    ) {
        return ResponseEntity.ok(friendshipService.listFriendships(auth, status));
    }
}
