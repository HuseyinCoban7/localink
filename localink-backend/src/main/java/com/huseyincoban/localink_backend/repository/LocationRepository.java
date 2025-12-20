package com.huseyincoban.localink_backend.repository;

import com.huseyincoban.localink_backend.entity.Location;
import com.huseyincoban.localink_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {
    @Query("""
        SELECT l FROM Location l
        WHERE l.user = :user
        ORDER BY l.createdAt DESC
        """)
    List<Location> findLatestByUser(@Param("user") User user);

    @Query("""
        SELECT l FROM Location l
        WHERE l.user IN :friends
          AND l.visibility <> com.huseyincoban.localink_backend.entity.enums.LocationVisibility.NONE
          AND (l.expiresAt IS NULL OR l.expiresAt > :now)
          AND l.createdAt > :after
        """)
    List<Location> findValidFriendLocations(
            @Param("friends") List<User> friends,
            @Param("now") Instant now,
            @Param("after") Instant after
    );

    @Query(value = """
        SELECT * FROM location l
        WHERE ST_DWithin(
            l.point::geography,
            ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
            :radius
        )
        """, nativeQuery = true)
    List<Location> findWithinRadius(
            @Param("lat") double lat,
            @Param("lon") double lon,
            @Param("radius") double radius);
}
