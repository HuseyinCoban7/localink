import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Input from "../../components/Input";
import Button from "../../components/Button";
import Card from "../../components/Card";

import {
    getFriends,
    sendFriendRequest,
    FriendshipDto,
} from "../../api/friendsApi";

import {
    searchUsers,
    UserDto,
} from "../../api/userApi";

import { AuthContext } from "../../context/AuthContext";

function getFriendName(item: FriendshipDto, myUserId: number) {
    return item.requesterId === myUserId
        ? item.addresseeName
        : item.requesterName;
}

function getFriendId(item: FriendshipDto, myUserId: number) {
    return item.requesterId === myUserId
        ? item.addresseeId
        : item.requesterId;
}

const FriendsScreen = ({ navigation }: any) => {
    const { user } = useContext(AuthContext);
    const myId = user?.id ?? -1;

    const [friends, setFriends] = useState<FriendshipDto[]>([]);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(false);

    const [pendingUserIds, setPendingUserIds] =
        useState<Record<number, boolean>>({});

    const [searchedOnce, setSearchedOnce] = useState(false);

    const loadFriends = async () => {
        setLoading(true);

        try {
            const list = await getFriends();
            setFriends(list);
        } catch (e: any) {
            Alert.alert(
                "Hata",
                e?.response?.data?.message ??
                "Arkadaşlar alınamadı."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsub = navigation.addListener("focus", loadFriends);
        return unsub;
    }, [navigation]);

    const acceptedFriendIdSet = useMemo(() => {
        const s = new Set<number>();

        friends.forEach((f) =>
            s.add(getFriendId(f, myId))
        );

        return s;
    }, [friends, myId]);

    const doSearch = async () => {
        const q = query.trim();

        if (!q) return;

        setLoading(true);
        setSearchedOnce(true);

        try {
            const list = await searchUsers(q);

            setResults(
                list.filter((u) => u.id !== myId)
            );
        } catch (e: any) {
            Alert.alert(
                "Hata",
                e?.response?.data?.message ??
                "Arama yapılamadı."
            );
        } finally {
            setLoading(false);
        }
    };

    const onSendRequest = async (targetId: number) => {
        if (acceptedFriendIdSet.has(targetId)) return;

        setPendingUserIds((prev) => ({
            ...prev,
            [targetId]: true,
        }));

        try {
            await sendFriendRequest(targetId);

            Alert.alert(
                "Başarılı",
                "Arkadaşlık isteği gönderildi."
            );
        } catch (e: any) {
            setPendingUserIds((prev) => {
                const copy = { ...prev };
                delete copy[targetId];
                return copy;
            });

            const status = e?.response?.status;

            const msg =
                e?.response?.data?.message ||
                (status === 409
                    ? "Zaten istek gönderilmiş veya zaten arkadaşsınız."
                    : status === 401
                        ? "Oturum doğrulanamadı."
                        : "İstek gönderilemedi.");

            Alert.alert("Hata", msg);
        }
    };

    const acceptedLabel = useMemo(
        () => `Arkadaşlarım (${friends.length})`,
        [friends.length]
    );

    const getInitials = (name: string) => {
        return name
            ?.split(" ")
            ?.map((n) => n[0])
            ?.join("")
            ?.slice(0, 2)
            ?.toUpperCase();
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.pageTitle}>Arkadaşlar</Text>
                    <Text style={styles.pageSubtitle}>
                        Bağlantılarını yönet
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.requestButton}
                    onPress={() =>
                        navigation.navigate("FriendRequests")
                    }
                >
                    <Ionicons
                        name="notifications-outline"
                        size={18}
                        color="#fff"
                    />
                </TouchableOpacity>
            </View>

            <Card style={styles.searchCard}>
                <Text style={styles.sectionTitle}>
                    Kullanıcı Ara
                </Text>

                <Input
                    value={query}
                    onChangeText={setQuery}
                    placeholder="İsim / kullanıcı adı / email"
                    autoCapitalize="none"
                />

                <Button
                    title={loading ? "Aranıyor..." : "Ara"}
                    onPress={doSearch}
                    disabled={loading}
                />

                {results.length > 0 && (
                    <View style={{ marginTop: 14 }}>
                        <Text style={styles.searchTitle}>
                            Arama Sonuçları
                        </Text>

                        {results.map((u) => {
                            const isPending =
                                !!pendingUserIds[u.id];

                            const isFriend =
                                acceptedFriendIdSet.has(u.id);

                            const title = isFriend
                                ? "Arkadaş"
                                : isPending
                                    ? "Gönderildi"
                                    : "Ekle";

                            const disabled =
                                loading ||
                                isPending ||
                                isFriend;

                            return (
                                <View
                                    key={u.id}
                                    style={styles.searchRow}
                                >
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {getInitials(u.name)}
                                        </Text>
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.friendName}>
                                            {u.name}
                                        </Text>

                                        <Text style={styles.friendUsername}>
                                            @{u.username}
                                        </Text>
                                    </View>

                                    <Button
                                        title={title}
                                        onPress={() =>
                                            onSendRequest(u.id)
                                        }
                                        disabled={disabled}
                                    />
                                </View>
                            );
                        })}
                    </View>
                )}

                {searchedOnce &&
                    results.length === 0 &&
                    !loading && (
                        <Text style={styles.emptyInline}>
                            Sonuç bulunamadı.
                        </Text>
                    )}
            </Card>

            <View style={styles.friendHeader}>
                <Text style={styles.friendHeaderTitle}>
                    {acceptedLabel}
                </Text>
            </View>

            <FlatList
                data={friends}
                keyExtractor={(item) => String(item.id)}
                onRefresh={loadFriends}
                refreshing={loading}
                contentContainerStyle={{
                    paddingBottom: 24,
                }}
                renderItem={({ item }) => {
                    const friendName = getFriendName(
                        item,
                        myId
                    );

                    return (
                        <Card style={styles.friendCard}>
                            <View style={styles.friendRow}>
                                <View style={styles.friendAvatar}>
                                    <Text style={styles.friendAvatarText}>
                                        {getInitials(friendName)}
                                    </Text>
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={styles.friendCardName}>
                                        {friendName}
                                    </Text>

                                    <Text style={styles.friendStatus}>
                                        Arkadaş olarak bağlısınız
                                    </Text>
                                </View>

                                <Ionicons
                                    name="checkmark-circle"
                                    size={22}
                                    color="#22c55e"
                                />
                            </View>
                        </Card>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <Ionicons
                            name="people-outline"
                            size={42}
                            color="#94a3b8"
                        />

                        <Text style={styles.emptyTitle}>
                            Henüz arkadaşın yok
                        </Text>

                        <Text style={styles.emptyText}>
                            Kullanıcı aratarak yeni arkadaşlar ekleyebilirsin.
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f3f6fb",
        padding: 16,
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },

    pageTitle: {
        fontSize: 28,
        fontWeight: "900",
        color: "#1e293b",
    },

    pageSubtitle: {
        marginTop: 4,
        color: "#64748b",
    },

    requestButton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: "#2563eb",
        justifyContent: "center",
        alignItems: "center",
    },

    searchCard: {
        marginBottom: 18,
    },

    sectionTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#1e293b",
        marginBottom: 10,
    },

    searchTitle: {
        fontWeight: "800",
        color: "#1e293b",
        marginBottom: 8,
    },

    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderColor: "#edf2f7",
        gap: 12,
    },

    avatar: {
        width: 46,
        height: 46,
        borderRadius: 16,
        backgroundColor: "#dbeafe",
        justifyContent: "center",
        alignItems: "center",
    },

    avatarText: {
        fontWeight: "900",
        color: "#2563eb",
    },

    friendName: {
        fontWeight: "800",
        fontSize: 15,
        color: "#1e293b",
    },

    friendUsername: {
        color: "#64748b",
        marginTop: 3,
    },

    emptyInline: {
        color: "#64748b",
        marginTop: 10,
    },

    friendHeader: {
        marginBottom: 10,
    },

    friendHeaderTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: "#1e293b",
    },

    friendCard: {
        marginBottom: 12,
    },

    friendRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    friendAvatar: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },

    friendAvatarText: {
        fontWeight: "900",
        fontSize: 16,
        color: "#2563eb",
    },

    friendCardName: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1e293b",
    },

    friendStatus: {
        marginTop: 4,
        color: "#64748b",
    },

    emptyWrap: {
        alignItems: "center",
        marginTop: 40,
        paddingHorizontal: 20,
    },

    emptyTitle: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: "800",
        color: "#1e293b",
    },

    emptyText: {
        marginTop: 6,
        textAlign: "center",
        color: "#64748b",
        lineHeight: 20,
    },
});

export default FriendsScreen;