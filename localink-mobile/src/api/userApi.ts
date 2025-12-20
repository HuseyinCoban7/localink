import { api } from "./client";

export interface UserDto {
    id: number;
    name: string;
    username: string;
    email: string;
    bio?: string;
    avatarUrl?: string;
    lastOnline?: string;
}

export interface UpdateProfileRequest {
    name?: string;
    bio?: string;
    avatarUrl?: string;
}

export async function getMe() {
    const res = await api.get<UserDto>("/users/me");
    return res.data;
}

export async function updateMe(payload: UpdateProfileRequest) {
    const res = await api.patch<UserDto>("/users/me", payload);
    return res.data;
}

export async function searchUsers(query: string) {
    const res = await api.get<UserDto[]>("/users/search", { params: { query } });
    return res.data;
}
