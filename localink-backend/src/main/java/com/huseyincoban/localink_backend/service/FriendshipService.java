package com.huseyincoban.localink_backend.service;

import com.huseyincoban.localink_backend.dto.friendship.FriendshipDto;
import com.huseyincoban.localink_backend.entity.Friendship;
import com.huseyincoban.localink_backend.entity.User;
import com.huseyincoban.localink_backend.entity.enums.FriendshipStatus;
import com.huseyincoban.localink_backend.entity.enums.NotificationType;
import com.huseyincoban.localink_backend.repository.FriendshipRepository;
import com.huseyincoban.localink_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private User currentUser(Authentication auth) {
        return (User) auth.getPrincipal();
    }

    public FriendshipDto sendRequest(Authentication auth, Long targetUserId) {
        User requester = currentUser(auth);

        if (requester.getId().equals(targetUserId)) {
            throw new IllegalArgumentException("Kendine arkadaşlık isteği gönderemezsin.");
        }

        User addressee = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı."));

        // Zaten mevcut ilişki var mı?
        friendshipRepository.findByRequesterAndAddressee(requester, addressee)
                .ifPresent(f -> {
                    throw new IllegalStateException("Bu kullanıcıyla zaten bir arkadaşlık kaydın var.");
                });

        friendshipRepository.findByRequesterAndAddressee(addressee, requester)
                .ifPresent(f -> {
                    throw new IllegalStateException("Bu kullanıcıyla zaten bir arkadaşlık kaydın var.");
                });

        Friendship friendship = Friendship.builder()
                .requester(requester)
                .addressee(addressee)
                .status(FriendshipStatus.REQUESTED)
                .build();

        friendship = friendshipRepository.save(friendship);

        // Bildirim: friend request
        notificationService.createNotification(
                addressee,
                NotificationType.FRIEND_REQUEST,
                requester.getName() + " sana arkadaşlık isteği gönderdi."
        );

        return toDto(friendship);
    }

    public FriendshipDto acceptRequest(Authentication auth, Long friendshipId) {
        User current = currentUser(auth);

        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new IllegalArgumentException("Arkadaşlık isteği bulunamadı."));

        if (!friendship.getAddressee().getId().equals(current.getId())) {
            throw new IllegalStateException("Bu isteği sadece alıcı kullanıcı kabul edebilir.");
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        friendship = friendshipRepository.save(friendship);

        // Bildirim: friend accept
        notificationService.createNotification(
                friendship.getRequester(),
                NotificationType.FRIEND_ACCEPT,
                current.getName() + " arkadaşlık isteğini kabul etti."
        );

        return toDto(friendship);
    }

    public FriendshipDto rejectRequest(Authentication auth, Long friendshipId) {
        User current = currentUser(auth);

        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new IllegalArgumentException("Arkadaşlık isteği bulunamadı."));

        if (!friendship.getAddressee().getId().equals(current.getId())) {
            throw new IllegalStateException("Bu isteği sadece alıcı kullanıcı reddedebilir.");
        }

        // İstersen burada BLOCKED yapabilir, istersen tamamen silebilirsin.
        friendship.setStatus(FriendshipStatus.BLOCKED);
        friendship = friendshipRepository.save(friendship);

        return toDto(friendship);
    }

    public List<FriendshipDto> listFriendships(Authentication auth, FriendshipStatus status) {
        User current = currentUser(auth);

        List<Friendship> list = friendshipRepository
                .findByRequesterOrAddresseeAndStatus(current, current, status);

        return list.stream().map(this::toDto).toList();
    }

    private FriendshipDto toDto(Friendship f) {
        return new FriendshipDto(
                f.getId(),
                f.getRequester().getId(),
                f.getRequester().getName(),
                f.getAddressee().getId(),
                f.getAddressee().getName(),
                f.getStatus(),
                f.getCreatedAt()
        );
    }
}
