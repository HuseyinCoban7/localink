import { api } from "./client";

export type PoiCategory = "PHARMACY" | "BAKERY" | "CAFE" | "OTHER";

export interface PoiDto {
    id: number;
    name: string;
    category: PoiCategory;
    latitude: number;
    longitude: number;
    address?: string;
    source?: "OSM" | "MANUAL";
    updatedAt?: string;
}

export async function getNearbyPoi(
    lat: number,
    lon: number,
    radius = 1000,
    category?: PoiCategory
) {
    const res = await api.get<PoiDto[]>("/poi/nearby", {
        params: {
            lat,
            lon,
            radius,
            category,
        },
    });
    return res.data;
}