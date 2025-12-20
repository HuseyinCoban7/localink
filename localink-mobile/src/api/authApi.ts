import { api } from "./client";
import { UserDto } from "./userApi";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: UserDto;
}

export async function login(payload: LoginRequest) {
    const res = await api.post<AuthResponse>("/auth/login", payload);
    return res.data;
}

export async function register(payload: RegisterRequest) {
    const res = await api.post<AuthResponse>("/auth/register", payload);
    return res.data;
}
