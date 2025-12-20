package com.huseyincoban.localink_backend.controller;

import com.huseyincoban.localink_backend.dto.location.FriendLocationDto;
import com.huseyincoban.localink_backend.dto.location.ShareLocationRequest;
import com.huseyincoban.localink_backend.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PostMapping("/share")
    public ResponseEntity<Void> share(
            Authentication auth,
            @Valid @RequestBody ShareLocationRequest request
    ) {
        locationService.shareLocation(auth, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/friends")
    public ResponseEntity<List<FriendLocationDto>> friends(
            Authentication auth,
            @RequestParam(defaultValue = "24") int maxAgeHours
    ) {
        return ResponseEntity.ok(locationService.getFriendsLocations(auth, maxAgeHours));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyLocation(Authentication auth) {
        locationService.deleteMyLocation(auth);
        return ResponseEntity.noContent().build();
    }
}
