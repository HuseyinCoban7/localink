import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert } from "react-native";
import Button from "../../components/Button";
import { AuthContext } from "../../context/AuthContext";
import { getMe, UserDto } from "../../api/userApi";

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

    if (!me && loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!me) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {me.avatarUrl ? (
                    <Image source={{ uri: me.avatarUrl }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.placeholder]}>
                        <Text style={styles.placeholderText}>{(me.name?.[0] ?? "U").toUpperCase()}</Text>
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{me.name}</Text>
                    <Text style={styles.sub}>@{me.username}</Text>
                    <Text style={styles.sub}>{me.email}</Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Bio</Text>
                <Text style={styles.bio}>{me.bio?.trim() ? me.bio : "Henüz bio eklenmedi."}</Text>
            </View>

            <Button title={loading ? "Yükleniyor..." : "Yenile"} onPress={load} disabled={loading} />
            <Button title="Profili Düzenle" onPress={() => navigation.navigate("EditProfile")} />
            <Button title="Çıkış Yap" onPress={signOut} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f6fb", padding: 16 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e0e6f0",
        marginBottom: 12,
    },
    avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
    placeholder: { backgroundColor: "#e4f0ff", justifyContent: "center", alignItems: "center" },
    placeholderText: { fontSize: 22, fontWeight: "800", color: "#2b4c7e" },
    name: { fontSize: 20, fontWeight: "800", color: "#233554" },
    sub: { color: "#5b6b86", marginTop: 2 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e0e6f0",
        marginBottom: 12,
    },
    cardTitle: { fontWeight: "800", marginBottom: 8, color: "#233554" },
    bio: { color: "#4a5568" },
});

export default ProfileScreen;
