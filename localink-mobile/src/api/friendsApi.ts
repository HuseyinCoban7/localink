import { api } from "./client";

export type FriendshipStatus = "REQUESTED" | "ACCEPTED" | "BLOCKED";

export interface FriendshipDto {
    id: number;
    requesterId: number;
    requesterName: string;
    addresseeId: number;
    addresseeName: string;
    status: FriendshipStatus;
    createdAt: string;
}

export async function getFriends() {
    const res = await api.get<FriendshipDto[]>("/friends", {
        params: { status: "ACCEPTED" },
    });
    return res.data;
}

export async function getFriendRequests() {
    const res = await api.get<FriendshipDto[]>("/friends", {
        params: { status: "REQUESTED" },
    });
    return res.data;
}

export async function sendFriendRequest(userId: number) {
    const res = await api.post<FriendshipDto>(`/friends/${userId}/request`);
    return res.data;
}

export async function acceptFriendRequest(friendshipId: number) {
    const res = await api.post<FriendshipDto>(`/friends/${friendshipId}/accept`);
    return res.data;
}

export async function rejectFriendRequest(friendshipId: number) {
    const res = await api.post<FriendshipDto>(`/friends/${friendshipId}/reject`);
    return res.data;
}
