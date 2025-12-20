package com.huseyincoban.localink_backend.entity;

import com.huseyincoban.localink_backend.entity.enums.PoiCategory;
import com.huseyincoban.localink_backend.entity.enums.PoiSource;
import jakarta.persistence.*;
import lombok.*;

import java.awt.*;
import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Poi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private PoiCategory category;

    private double latitude;
    private double longitude;
    private String address;

    @Enumerated(EnumType.STRING)
    private PoiSource source;

    private Instant updatedAt;

    @Column(columnDefinition = "geometry(Point, 4326)")
    private Point point;

}
