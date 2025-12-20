package com.huseyincoban.localink_backend.dto.friendship;

import com.huseyincoban.localink_backend.entity.enums.FriendshipStatus;

import java.time.Instant;

public record FriendshipDto(
        Long id,
        Long requesterId,
        String requesterName,
        Long addresseeId,
        String addresseeName,
        FriendshipStatus status,
        Instant createdAt
) {}
