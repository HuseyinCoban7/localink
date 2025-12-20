import React, { useContext, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { getFriends, sendFriendRequest, FriendshipDto } from "../../api/friendsApi";
import { searchUsers, UserDto } from "../../api/userApi";
import { AuthContext } from "../../context/AuthContext";

function getFriendName(item: FriendshipDto, myUserId: number) {
    // Ben requester isem arkadaş addressee, değilsem requester
    return item.requesterId === myUserId ? item.addresseeName : item.requesterName;
}

function getFriendId(item: FriendshipDto, myUserId: number) {
    return item.requesterId === myUserId ? item.addresseeId : item.requesterId;
}

const FriendsScreen = ({ navigation }: any) => {
    const { user } = useContext(AuthContext);
    const myId = user?.id ?? -1;

    const [friends, setFriends] = useState<FriendshipDto[]>([]);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [pendingUserIds, setPendingUserIds] = useState<Record<number, boolean>>({});
    const [searchedOnce, setSearchedOnce] = useState(false);

    const loadFriends = async () => {
        setLoading(true);
        try {
            const list = await getFriends();
            setFriends(list);
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message ?? "Arkadaşlar alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsub = navigation.addListener("focus", loadFriends);
        return unsub;
    }, [navigation]);

    // ✅ accepted arkadaş id set'i (arama sonuçlarında "Arkadaş" disable için)
    const acceptedFriendIdSet = useMemo(() => {
        const s = new Set<number>();
        friends.forEach((f) => s.add(getFriendId(f, myId)));
        return s;
    }, [friends, myId]);

    const doSearch = async () => {
        const q = query.trim();
        if (!q) return;

        setLoading(true);
        setSearchedOnce(true);
        try {
            const list = await searchUsers(q);
            setResults(list.filter((u) => u.id !== myId));
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message ?? "Arama yapılamadı.");
        } finally {
            setLoading(false);
        }
    };

    const onSendRequest = async (targetId: number) => {
        // Zaten arkadaşıysa hiç yollama
        if (acceptedFriendIdSet.has(targetId)) return;

        // UI: anında pending yap
        setPendingUserIds((prev) => ({ ...prev, [targetId]: true }));

        try {
            await sendFriendRequest(targetId);
            // Alert opsiyonel: istersen kaldırabiliriz
            Alert.alert("Başarılı", "Arkadaşlık isteği gönderildi.");
        } catch (e: any) {
            // başarısızsa geri al
            setPendingUserIds((prev) => {
                const copy = { ...prev };
                delete copy[targetId];
                return copy;
            });

            const status = e?.response?.status;

            // 401 normal değil ama olursa kullanıcıyı net bilgilendirelim
            const msg =
                e?.response?.data?.message ||
                (status === 409
                    ? "Zaten istek gönderilmiş veya zaten arkadaşsınız."
                    : status === 401
                        ? "Oturum doğrulanamadı. Çıkış yapıp tekrar giriş yapmayı dene."
                        : "İstek gönderilemedi.");

            Alert.alert("Hata", msg);
        }
    };

    const acceptedLabel = useMemo(() => `Arkadaşlarım (${friends.length})`, [friends.length]);

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <Text style={styles.title}>{acceptedLabel}</Text>
                <Button title="İstekler" onPress={() => navigation.navigate("FriendRequests")} />
            </View>

            <Card>
                <Text style={styles.sectionTitle}>Kullanıcı Ara</Text>
                <Input
                    value={query}
                    onChangeText={setQuery}
                    placeholder="İsim / kullanıcı adı / email"
                    autoCapitalize="none"
                />
                <Button title={loading ? "Aranıyor..." : "Ara"} onPress={doSearch} disabled={loading} />

                {results.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.sectionTitle}>Arama Sonuçları</Text>

                        {results.map((u) => {
                            const isPending = !!pendingUserIds[u.id];
                            const isFriend = acceptedFriendIdSet.has(u.id);

                            const title = isFriend ? "Arkadaş" : isPending ? "Gönderildi" : "Ekle";
                            const disabled = loading || isPending || isFriend;

                            return (
                                <View key={u.id} style={styles.row}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.rowTitle}>{u.name}</Text>
                                        <Text style={styles.rowSub}>@{u.username}</Text>
                                    </View>

                                    <Button title={title} onPress={() => onSendRequest(u.id)} disabled={disabled} />
                                </View>
                            );
                        })}
                    </View>
                )}

                {searchedOnce && results.length === 0 && !loading && (
                    <Text style={styles.emptyInline}>Sonuç bulunamadı.</Text>
                )}
            </Card>

            <FlatList
                data={friends}
                keyExtractor={(item) => String(item.id)}
                onRefresh={loadFriends}
                refreshing={loading}
                renderItem={({ item }) => {
                    const friendName = getFriendName(item, myId);
                    return (
                        <Card>
                            <Text style={styles.rowTitle}>{friendName}</Text>
                            <Text style={styles.rowSub}>Durum: {item.status}</Text>
                        </Card>
                    );
                }}
                ListEmptyComponent={
                    <Text style={styles.empty}>Henüz arkadaşın yok. Arama yaparak ekleyebilirsin.</Text>
                }
                contentContainerStyle={{ paddingBottom: 24 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f6fb", padding: 16 },
    topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    title: { fontSize: 18, fontWeight: "800", color: "#233554" },
    sectionTitle: { fontWeight: "800", color: "#233554", marginBottom: 8 },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: "#edf2f7",
        gap: 10,
    },
    rowTitle: { fontWeight: "800", color: "#233554" },
    rowSub: { color: "#5b6b86", marginTop: 4 },
    empty: { color: "#5b6b86", marginTop: 14, textAlign: "center" },
    emptyInline: { color: "#5b6b86", marginTop: 10 },
});

export default FriendsScreen;
