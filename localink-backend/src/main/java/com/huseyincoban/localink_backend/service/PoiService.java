package com.huseyincoban.localink_backend.service;

import com.huseyincoban.localink_backend.dto.poi.PoiDto;
import com.huseyincoban.localink_backend.entity.Poi;
import com.huseyincoban.localink_backend.entity.enums.PoiCategory;
import com.huseyincoban.localink_backend.repository.PoiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PoiService {

    private final PoiRepository poiRepository;

    public List<PoiDto> findNearby(double lat, double lon, double radius, PoiCategory category) {
        String categoryStr = category != null ? category.name() : null;

        List<Poi> pois = poiRepository.findNearby(lat, lon, radius, categoryStr);

        return pois.stream()
                .map(this::toDto)
                .toList();
    }

    private PoiDto toDto(Poi p) {
        return new PoiDto(
                p.getId(),
                p.getName(),
                p.getCategory(),
                p.getLatitude(),
                p.getLongitude(),
                p.getAddress(),
                p.getSource(),
                p.getUpdatedAt()
        );
    }
}
