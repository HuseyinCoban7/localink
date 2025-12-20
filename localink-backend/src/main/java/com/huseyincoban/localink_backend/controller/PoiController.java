package com.huseyincoban.localink_backend.controller;

import com.huseyincoban.localink_backend.dto.poi.PoiDto;
import com.huseyincoban.localink_backend.entity.enums.PoiCategory;
import com.huseyincoban.localink_backend.service.PoiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/poi")
@RequiredArgsConstructor
public class PoiController {

    private final PoiService poiService;

    @GetMapping("/nearby")
    public ResponseEntity<List<PoiDto>> nearby(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "1000") double radius,
            @RequestParam(required = false) PoiCategory category
    ) {
        return ResponseEntity.ok(poiService.findNearby(lat, lon, radius, category));
    }
}
