package com.huseyincoban.localink_backend.service;

import com.huseyincoban.localink_backend.entity.User;
import com.huseyincoban.localink_backend.entity.Location;
import com.huseyincoban.localink_backend.entity.Friendship;
import com.huseyincoban.localink_backend.entity.enums.FriendshipStatus;
import com.huseyincoban.localink_backend.repository.LocationRepository;
import com.huseyincoban.localink_backend.repository.FriendshipRepository;
import com.huseyincoban.localink_backend.dto.location.ShareLocationRequest;
import com.huseyincoban.localink_backend.dto.location.FriendLocationDto;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.locationtech.jts.geom.Coordinate;
import org.springframework.security.core.Authentication;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final FriendshipRepository friendshipRepository;
    private final GeometryFactory geometryFactory =
            new GeometryFactory(new PrecisionModel(), 4326);

    public void shareLocation(Authentication auth, ShareLocationRequest request) {
        User user = (User) auth.getPrincipal();

        Point point = geometryFactory.createPoint(
                new Coordinate(
                        request.longitude(),
                        request.latitude()
                )
        );

        Location location = Location.builder()
                .user(user)
                .latitude(request.latitude())
                .longitude(request.longitude())
                .accuracyMeters(request.accuracyMeters())
                .visibility(request.visibility())
                .point(point)
                .expiresAt(Instant.now().plus(request.ttlMinutes(), ChronoUnit.MINUTES))
                .build();

        locationRepository.save(location);
    }

    public List<FriendLocationDto> getFriendsLocations(Authentication auth, int maxAgeHours) {
        User current = (User) auth.getPrincipal();

        List<Friendship> friendships = friendshipRepository
                .findByRequesterOrAddresseeAndStatus(
                        current, current, FriendshipStatus.ACCEPTED
                );

        List<User> friends = friendships.stream()
                .map(f -> f.getRequester().equals(current)
                        ? f.getAddressee()
                        : f.getRequester())
                .toList();

        Instant after = Instant.now().minus(maxAgeHours, ChronoUnit.HOURS);

        List<Location> locations = locationRepository
                .findValidFriendLocations(friends, Instant.now(), after);

        return locations.stream()
                .collect(
                        java.util.stream.Collectors.toMap(
                                l -> l.getUser().getId(),
                                l -> l,
                                // keep latest
                                (l1, l2) -> l1.getCreatedAt().isAfter(l2.getCreatedAt()) ? l1 : l2
                        )
                )
                .values()
                .stream()
                .map(l -> new FriendLocationDto(
                        l.getUser().getId(),
                        l.getUser().getName(),
                        l.getLatitude(),
                        l.getLongitude(),
                        l.getCreatedAt()
                ))
                .toList();
    }

    public void deleteMyLocation(Authentication auth) {
        User current = (User) auth.getPrincipal();
        List<Location> all = locationRepository.findLatestByUser(current);
        locationRepository.deleteAll(all);
    }

}
