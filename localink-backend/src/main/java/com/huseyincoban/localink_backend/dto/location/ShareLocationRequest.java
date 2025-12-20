package com.huseyincoban.localink_backend.dto.location;

import com.huseyincoban.localink_backend.entity.enums.LocationVisibility;
import jakarta.validation.constraints.NotNull;

public record ShareLocationRequest(
        @NotNull Double latitude,
        @NotNull Double longitude,
        Double accuracyMeters,
        @NotNull LocationVisibility visibility,
        @NotNull Integer ttlMinutes
) {
}
