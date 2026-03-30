import { api } from "./client";

export type LocationVisibility = "EVERYONE" | "FRIENDS" | "NONE";

export interface ShareLocationRequest {
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    visibility: LocationVisibility;
    ttlMinutes: number;
}

export interface FriendLocationDto {
    friendId: number;
    friendName: string;
    latitude: number;
    longitude: number;
    updatedAt: string;
}

export async function shareLocation(payload: ShareLocationRequest) {
    const res = await api.post("/locations/share", payload);
    return res.data;
}

export async function getFriendsLocations(maxAgeHours = 24) {
    const res = await api.get<FriendLocationDto[]>("/locations/friends", {
        params: { maxAgeHours },
    });
    return res.data;
}

export async function deleteMyLocation() {
    const res = await api.delete("/locations/me");
    return res.data;
}