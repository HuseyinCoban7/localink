import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://10.0.2.2:8088";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
    async (config) => {
        const url = config.url ?? "";

        // 🔐 Auth endpoint'lerine token EKLEME
        if (url.startsWith("/auth/")) {
            if ((config.headers as any)?.Authorization) {
                delete (config.headers as any).Authorization;
            }
            return config;
        }

        const token = await AsyncStorage.getItem("accessToken");


        // ✅ Token varsa ekle, yoksa header'a hiç dokunma
        if (token && token !== "null" && token !== "undefined") {
            config.headers = config.headers ?? {};
            (config.headers as any).Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;
        const url = error?.config?.url ?? "";

        const isAuth = typeof url === "string" && url.startsWith("/auth/");

        if (status === 401 && !isAuth) {
            await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]).catch(() => { });
        }

        return Promise.reject(error);
    }
);
