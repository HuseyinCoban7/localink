import React, { useContext, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
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
            setRequests(list);
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

    const title = useMemo(() => `Arkadaşlık İstekleri (${requests.length})`, [requests.length]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>

            <FlatList
                data={requests}
                keyExtractor={(item) => String(item.id)}
                refreshing={loading}
                onRefresh={load}
                renderItem={({ item }) => {
                    const isIncoming = item.addresseeId === myId;
                    const otherName = isIncoming ? item.requesterName : item.addresseeName;

                    return (
                        <Card>
                            <Text style={styles.rowTitle}>{otherName}</Text>
                            <Text style={styles.rowSub}>
                                Durum: {item.status} • {isIncoming ? "Gelen istek" : "Gönderilen istek"}
                            </Text>

                            {isIncoming ? (
                                <View style={styles.actions}>
                                    <Button title="Kabul" onPress={() => onAccept(item.id)} disabled={loading} />
                                    <Button title="Reddet" onPress={() => onReject(item.id)} disabled={loading} />
                                </View>
                            ) : (
                                <Text style={styles.pending}>Bu isteği sen gönderdin.</Text>
                            )}
                        </Card>
                    );
                }}
                ListEmptyComponent={<Text style={styles.empty}>Şu an bekleyen istek yok.</Text>}
                contentContainerStyle={{ paddingBottom: 24 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f6fb", padding: 16 },
    title: { fontSize: 18, fontWeight: "800", color: "#233554", marginBottom: 10 },
    rowTitle: { fontWeight: "800", color: "#233554" },
    rowSub: { color: "#5b6b86", marginTop: 4 },
    actions: { flexDirection: "row", gap: 10, marginTop: 10 },
    pending: { marginTop: 10, color: "#5b6b86", fontStyle: "italic" },
    empty: { color: "#5b6b86", marginTop: 14, textAlign: "center" },
});

export default FriendRequestsScreen;
