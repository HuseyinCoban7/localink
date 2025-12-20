import React, { createContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login, register } from "../api/authApi";
import { getMe, UserDto } from "../api/userApi";

type AuthState = {
    user: UserDto | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (name: string, username: string, email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshMe: () => Promise<void>;
    setUser: (u: UserDto | null) => void;
};

export const AuthContext = createContext<AuthState>({} as any);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [user, setUser] = useState<UserDto | null>(null);
    const [loading, setLoading] = useState(true);

    const persistUser = async (u: UserDto | null) => {
        if (!u) {
            await AsyncStorage.removeItem("user");
            return;
        }
        await AsyncStorage.setItem("user", JSON.stringify(u));
    };

    const hydrateMe = async () => {
        // token varsa /users/me ile güncelle
        try {
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) return;
            const me = await getMe();
            setUser(me);
            await persistUser(me);
        } catch {
            // token bozuk olabilir, sessizce geç
        }
    };

    useEffect(() => {
        (async () => {
            const stored = await AsyncStorage.getItem("user");
            if (stored) setUser(JSON.parse(stored));
            setLoading(false);
            await hydrateMe();
        })();
    }, []);

    const signIn = async (email: string, password: string) => {
        const res = await login({ email, password });
        await AsyncStorage.setItem("accessToken", res.accessToken);
        await AsyncStorage.setItem("refreshToken", res.refreshToken);

        // önce response user
        setUser(res.user);
        await persistUser(res.user);

        // sonra /me ile güncelle
        await hydrateMe();
    };

    const signUp = async (name: string, username: string, email: string, password: string) => {
        await register({ name, username, email, password });
        await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
        setUser(null);
    };


    const signOut = async () => {
        await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
        setUser(null);
    };

    const value = useMemo(
        () => ({
            user,
            loading,
            signIn,
            signUp,
            signOut,
            refreshMe: hydrateMe,
            setUser: async (u: UserDto | null) => {
                setUser(u);
                await persistUser(u);
            },
        }),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
