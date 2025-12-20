package com.huseyincoban.localink_backend.repository;

import com.huseyincoban.localink_backend.entity.Poi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PoiRepository extends JpaRepository<Poi, Long> {
    @Query(value = """
        SELECT * FROM poi p
        WHERE (:category IS NULL OR p.category = :category)
          AND ST_DWithin(
            p.point::geography,
            ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
            :radius
        )
        """, nativeQuery = true)
    List<Poi> findNearby(
            @Param("lat") double lat,
            @Param("lon") double lon,
            @Param("radius") double radius,
            @Param("category") String category);
}
