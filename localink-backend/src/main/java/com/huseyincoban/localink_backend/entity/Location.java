package com.huseyincoban.localink_backend.entity;

import com.huseyincoban.localink_backend.entity.enums.LocationVisibility;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.locationtech.jts.geom.Point;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    private double latitude;
    private double longitude;

    @Enumerated(EnumType.STRING)
    private LocationVisibility visibility;

    private Double accuracyMeters;

    @CreationTimestamp
    private Instant createdAt;

    private Instant expiresAt;

    @Column(columnDefinition = "geometry(Point, 4326)")
    private Point point;

}
