package com.huseyincoban.localink_backend.dto.poi;

import com.huseyincoban.localink_backend.entity.enums.PoiCategory;
import com.huseyincoban.localink_backend.entity.enums.PoiSource;

import java.time.Instant;

public record PoiDto(
        Long id,
        String name,
        PoiCategory category,
        double latitude,
        double longitude,
        String address,
        PoiSource source,
        Instant updatedAt
) {}
