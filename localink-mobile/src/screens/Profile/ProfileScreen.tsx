import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ActivityIndicator,
    Alert,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../../context/AuthContext";
import { getMe, UserDto } from "../../api/userApi";
import { API_BASE_URL } from "../../api/client";

const ProfileScreen = ({ navigation }: any) => {
    const { user, signOut, setUser } = useContext(AuthContext);
    const [me, setMe] = useState<UserDto | null>(user);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const fresh = await getMe();
            setMe(fresh);
            await setUser(fresh);
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message ?? "Profil bilgisi alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsub = navigation.addListener("focus", load);
        return unsub;
    }, [navigation]);

    const getInitials = (name?: string) => {
        if (!name?.trim()) return "U";

        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    const avatarSource = useMemo(() => {
        const raw = me?.avatarUrl?.trim();

        if (!raw) return null;

        return {
            uri: raw.startsWith("http") ? raw : `${API_BASE_URL}${raw}`,
        };
    }, [me?.avatarUrl]);

    const handleLogout = () => {
        Alert.alert("Çıkış Yap", "Hesabından çıkış yapmak istiyor musun?", [
            { text: "Vazgeç", style: "cancel" },
            {
                text: "Çıkış Yap",
                style: "destructive",
                onPress: signOut,
            },
        ]);
    };

    if (!me && loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>Profil yükleniyor...</Text>
            </View>
        );
    }

    if (!me) return null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.headerCard}>
                <View style={styles.avatarWrap}>
                    {avatarSource ? (
                        <Image
                            source={avatarSource}
                            style={styles.avatar}
                            resizeMode="cover"
                            onError={(error) => {
                                console.log("Avatar image load error:", error.nativeEvent);
                            }}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{getInitials(me.name)}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.profileInfo}>
                    <Text style={styles.name}>{me.name}</Text>
                    <Text style={styles.username}>@{me.username}</Text>

                    <View style={styles.statusPill}>
                        <Ionicons name="checkmark-circle" size={15} color="#16a34a" />
                        <Text style={styles.statusText}>Aktif hesap</Text>
                    </View>
                </View>
            </View>

            <View style={styles.infoGrid}>
                <View style={styles.infoCard}>
                    <Ionicons name="mail-outline" size={20} color="#2563eb" />
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                        {me.email}
                    </Text>
                </View>

                <View style={styles.infoCard}>
                    <Ionicons name="person-outline" size={20} color="#2563eb" />
                    <Text style={styles.infoLabel}>Kullanıcı</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                        @{me.username}
                    </Text>
                </View>
            </View>

            <View style={styles.bioCard}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.cardTitle}>Bio</Text>
                        <Text style={styles.cardSubtitle}>Kendini kısaca tanıt</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.editMiniButton}
                        onPress={() => navigation.navigate("EditProfile")}
                    >
                        <Ionicons name="create-outline" size={18} color="#2563eb" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.bioText}>
                    {me.bio?.trim()
                        ? me.bio
                        : "Henüz bio eklenmedi. Profilini düzenleyerek kendinden bahsedebilirsin."}
                </Text>
            </View>

            <View style={styles.actionsCard}>
                <TouchableOpacity
                    style={styles.actionRow}
                    onPress={() => navigation.navigate("EditProfile")}
                >
                    <View style={styles.actionIcon}>
                        <Ionicons name="create-outline" size={20} color="#2563eb" />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={styles.actionTitle}>Profili Düzenle</Text>
                        <Text style={styles.actionSubtitle}>Ad, bio ve avatar bilgilerini güncelle</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRow} onPress={load} disabled={loading}>
                    <View style={styles.actionIcon}>
                        <Ionicons name="refresh-outline" size={20} color="#2563eb" />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={styles.actionTitle}>
                            {loading ? "Yükleniyor..." : "Bilgileri Yenile"}
                        </Text>
                        <Text style={styles.actionSubtitle}>Profil bilgilerini sunucudan tekrar al</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="small" />
                    ) : (
                        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionRow, styles.logoutRow]} onPress={handleLogout}>
                    <View style={[styles.actionIcon, styles.logoutIcon]}>
                        <Ionicons name="log-out-outline" size={20} color="#dc2626" />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={styles.logoutTitle}>Çıkış Yap</Text>
                        <Text style={styles.actionSubtitle}>Hesabından güvenli şekilde çık</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.privacyCard}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#16a34a" />
                <View style={{ flex: 1 }}>
                    <Text style={styles.privacyTitle}>Gizlilik kontrolü sende</Text>
                    <Text style={styles.privacyText}>
                        Konum paylaşımını istediğin zaman harita ekranından durdurabilirsin.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f3f6fb",
    },
    content: {
        padding: 16,
        paddingBottom: 30,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f3f6fb",
    },
    loadingText: {
        marginTop: 10,
        color: "#64748b",
    },
    headerCard: {
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: "#e0e6f0",
        alignItems: "center",
        marginBottom: 14,
    },
    avatarWrap: {
        marginBottom: 12,
    },
    avatar: {
        width: 92,
        height: 92,
        borderRadius: 32,
    },
    avatarPlaceholder: {
        width: 92,
        height: 92,
        borderRadius: 32,
        backgroundColor: "#dbeafe",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 30,
        fontWeight: "900",
        color: "#2563eb",
    },
    profileInfo: {
        alignItems: "center",
    },
    name: {
        fontSize: 23,
        fontWeight: "900",
        color: "#1e293b",
        textAlign: "center",
    },
    username: {
        marginTop: 4,
        color: "#64748b",
        fontWeight: "600",
    },
    statusPill: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#ecfdf5",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
    },
    statusText: {
        color: "#166534",
        fontSize: 12,
        fontWeight: "800",
    },
    infoGrid: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 14,
    },
    infoCard: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e0e6f0",
    },
    infoLabel: {
        marginTop: 9,
        color: "#64748b",
        fontSize: 12,
        fontWeight: "700",
    },
    infoValue: {
        marginTop: 4,
        color: "#1e293b",
        fontSize: 13,
        fontWeight: "800",
    },
    bioCard: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e0e6f0",
        marginBottom: 14,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "900",
        color: "#1e293b",
    },
    cardSubtitle: {
        marginTop: 3,
        fontSize: 12,
        color: "#64748b",
    },
    editMiniButton: {
        width: 38,
        height: 38,
        borderRadius: 13,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
    },
    bioText: {
        color: "#475569",
        lineHeight: 20,
    },
    actionsCard: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#e0e6f0",
        overflow: "hidden",
        marginBottom: 14,
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#edf2f7",
    },
    actionIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: "900",
        color: "#1e293b",
    },
    actionSubtitle: {
        marginTop: 3,
        color: "#64748b",
        fontSize: 12,
    },
    logoutRow: {
        borderBottomWidth: 0,
    },
    logoutIcon: {
        backgroundColor: "#fff1f2",
    },
    logoutTitle: {
        fontSize: 14,
        fontWeight: "900",
        color: "#dc2626",
    },
    privacyCard: {
        flexDirection: "row",
        gap: 12,
        backgroundColor: "#ecfdf5",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#bbf7d0",
    },
    privacyTitle: {
        fontWeight: "900",
        color: "#166534",
    },
    privacyText: {
        marginTop: 4,
        color: "#166534",
        fontSize: 12,
        lineHeight: 18,
    },
});

export default ProfileScreen;