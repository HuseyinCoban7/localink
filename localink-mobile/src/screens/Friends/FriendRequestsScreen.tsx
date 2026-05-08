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

import Card from "../../components/Card";
import Button from "../../components/Button";
import { AuthContext } from "../../context/AuthContext";
import {
    acceptFriendRequest,
    getFriendRequests,
    rejectFriendRequest,
    FriendshipDto,
} from "../../api/friendsApi";

const FriendRequestsScreen = ({ navigation }: any) => {
    const { user } = useContext(AuthContext);
    const myId = user?.id ?? -1;

    const [requests, setRequests] = useState<FriendshipDto[]>([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const list = await getFriendRequests();

            // Güvenlik: sadece bekleyen istekleri göster
            setRequests(list.filter((item) => item.status === "REQUESTED"));
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message ?? "İstekler alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsub = navigation.addListener("focus", load);
        return unsub;
    }, [navigation]);

    const getInitials = (name: string) => {
        return name
            ?.split(" ")
            ?.map((n) => n[0])
            ?.join("")
            ?.slice(0, 2)
            ?.toUpperCase();
    };

    const incomingCount = useMemo(
        () => requests.filter((r) => r.addresseeId === myId).length,
        [requests, myId]
    );

    const outgoingCount = useMemo(
        () => requests.filter((r) => r.requesterId === myId).length,
        [requests, myId]
    );

    const onAccept = async (id: number) => {
        setLoading(true);
        try {
            await acceptFriendRequest(id);
            await load();
            Alert.alert("Başarılı", "İstek kabul edildi.");
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message ?? "Kabul edilemedi.");
        } finally {
            setLoading(false);
        }
    };

    const onReject = async (id: number) => {
        setLoading(true);
        try {
            await rejectFriendRequest(id);
            await load();
            Alert.alert("Tamam", "İstek reddedildi.");
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message ?? "Reddedilemedi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={22} color="#1e293b" />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                    <Text style={styles.pageTitle}>İstekler</Text>
                    <Text style={styles.pageSubtitle}>
                        Gelen ve gönderilen arkadaşlık istekleri
                    </Text>
                </View>
            </View>

            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <Ionicons name="download-outline" size={20} color="#2563eb" />
                    <Text style={styles.summaryValue}>{incomingCount}</Text>
                    <Text style={styles.summaryLabel}>Gelen</Text>
                </View>

                <View style={styles.summaryCard}>
                    <Ionicons name="send-outline" size={20} color="#2563eb" />
                    <Text style={styles.summaryValue}>{outgoingCount}</Text>
                    <Text style={styles.summaryLabel}>Gönderilen</Text>
                </View>
            </View>

            <FlatList
                data={requests}
                keyExtractor={(item) => String(item.id)}
                refreshing={loading}
                onRefresh={load}
                contentContainerStyle={{ paddingBottom: 24 }}
                renderItem={({ item }) => {
                    const isIncoming = item.addresseeId === myId;
                    const otherName = isIncoming ? item.requesterName : item.addresseeName;

                    return (
                        <Card style={styles.requestCard}>
                            <View style={styles.requestRow}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{getInitials(otherName)}</Text>
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={styles.name}>{otherName}</Text>

                                    <View style={styles.badgeRow}>
                                        <View
                                            style={[
                                                styles.badge,
                                                isIncoming ? styles.incomingBadge : styles.outgoingBadge,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.badgeText,
                                                    isIncoming
                                                        ? styles.incomingBadgeText
                                                        : styles.outgoingBadgeText,
                                                ]}
                                            >
                                                {isIncoming ? "Gelen istek" : "Gönderilen istek"}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {isIncoming ? (
                                <View style={styles.actions}>
                                    <Button
                                        title="Kabul Et"
                                        onPress={() => onAccept(item.id)}
                                        disabled={loading}
                                    />
                                    <TouchableOpacity
                                        style={styles.rejectButton}
                                        onPress={() => onReject(item.id)}
                                        disabled={loading}
                                    >
                                        <Text style={styles.rejectText}>Reddet</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.pendingBox}>
                                    <Ionicons name="time-outline" size={18} color="#64748b" />
                                    <Text style={styles.pendingText}>
                                        Bu isteği sen gönderdin. Cevap bekleniyor.
                                    </Text>
                                </View>
                            )}
                        </Card>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <Ionicons name="mail-open-outline" size={46} color="#94a3b8" />
                        <Text style={styles.emptyTitle}>Bekleyen istek yok</Text>
                        <Text style={styles.emptyText}>
                            Yeni arkadaşlık istekleri geldiğinde burada görünecek.
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
        alignItems: "center",
        marginBottom: 16,
        gap: 12,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e0e6f0",
    },
    pageTitle: {
        fontSize: 26,
        fontWeight: "900",
        color: "#1e293b",
    },
    pageSubtitle: {
        marginTop: 3,
        fontSize: 13,
        color: "#64748b",
    },
    summaryRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e0e6f0",
    },
    summaryValue: {
        marginTop: 8,
        fontSize: 22,
        fontWeight: "900",
        color: "#1e293b",
    },
    summaryLabel: {
        marginTop: 2,
        color: "#64748b",
        fontSize: 12,
        fontWeight: "600",
    },
    requestCard: {
        marginBottom: 12,
    },
    requestRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    avatarText: {
        fontWeight: "900",
        color: "#2563eb",
        fontSize: 16,
    },
    name: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1e293b",
    },
    badgeRow: {
        flexDirection: "row",
        marginTop: 6,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    incomingBadge: {
        backgroundColor: "#dbeafe",
    },
    outgoingBadge: {
        backgroundColor: "#fef3c7",
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "800",
    },
    incomingBadgeText: {
        color: "#2563eb",
    },
    outgoingBadgeText: {
        color: "#b45309",
    },
    actions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 14,
    },
    rejectButton: {
        flex: 1,
        marginTop: 8,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#fecaca",
        backgroundColor: "#fff1f2",
        alignItems: "center",
        justifyContent: "center",
    },
    rejectText: {
        color: "#dc2626",
        fontWeight: "800",
        fontSize: 13,
    },
    pendingBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        borderRadius: 14,
        padding: 10,
        marginTop: 14,
        gap: 8,
    },
    pendingText: {
        color: "#64748b",
        fontSize: 12,
        flex: 1,
        lineHeight: 17,
    },
    emptyWrap: {
        alignItems: "center",
        marginTop: 45,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: "900",
        color: "#1e293b",
    },
    emptyText: {
        marginTop: 6,
        textAlign: "center",
        color: "#64748b",
        lineHeight: 20,
    },
});

export default FriendRequestsScreen;