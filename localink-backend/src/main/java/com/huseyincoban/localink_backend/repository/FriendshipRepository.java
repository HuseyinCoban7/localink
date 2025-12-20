package com.huseyincoban.localink_backend.repository;

import com.huseyincoban.localink_backend.entity.Friendship;
import com.huseyincoban.localink_backend.entity.User;
import com.huseyincoban.localink_backend.entity.enums.FriendshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    List<Friendship> findByRequesterOrAddresseeAndStatus(User requester, User addressee, FriendshipStatus status);

    Optional<Friendship> findByRequesterAndAddressee(User requester, User addressee);

    List<Friendship> findByAddresseeAndStatus(User addressee, FriendshipStatus status);
}
