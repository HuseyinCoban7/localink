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

export async function uploadAvatar(uri: string) {
    const filename = uri.split("/").pop() ?? `avatar-${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    const formData = new FormData();

    formData.append("file", {
        uri,
        name: filename,
        type,
    } as any);

    const res = await api.post<UserDto>("/users/me/avatar", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data;
}
