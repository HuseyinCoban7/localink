import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    Platform,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import * as ExpoLocation from "expo-location";
import Button from "../../components/Button";
import Card from "../../components/Card";
import {
    deleteMyLocation,
    getFriendsLocations,
    shareLocation,
    FriendLocationDto,
} from "../../api/locationsApi";
import { getNearbyPoi, PoiCategory, PoiDto } from "../../api/poiApi";

// ✅ react-native-maps web'de patlamasın diye conditional require
let MapView: any = null;
let Marker: any = null;
let Callout: any = null;

if (Platform.OS !== "web") {
    const Maps = require("react-native-maps");
    MapView = Maps.default;
    Marker = Maps.Marker;
    Callout = Maps.Callout;
}

type CategoryFilter = "ALL" | PoiCategory;

const MapScreen: React.FC = () => {
    const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [sharing, setSharing] = useState(false);

    const [currentLocation, setCurrentLocation] = useState<{
        latitude: number;
        longitude: number;
        accuracy?: number | null;
    } | null>(null);

    const [friendsLocations, setFriendsLocations] = useState<FriendLocationDto[]>([]);
    const [pois, setPois] = useState<PoiDto[]>([]);
    const [category, setCategory] = useState<CategoryFilter>("ALL");

    const loadCurrentLocation = async () => {
        try {
            setLoading(true);

            const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                setPermissionGranted(false);
                setLoading(false);
                Alert.alert("İzin gerekli", "Harita için konum izni vermelisin.");
                return;
            }

            setPermissionGranted(true);

            const enabled = await ExpoLocation.hasServicesEnabledAsync();
            if (!enabled) {
                setLoading(false);
                Alert.alert("Konum kapalı", "Cihazda veya emulatorde konum servisi açık değil.");
                return;
            }

            let loc: ExpoLocation.LocationObject | ExpoLocation.LocationObject | null = null;

            try {
                loc = await ExpoLocation.getCurrentPositionAsync({
                    accuracy: ExpoLocation.Accuracy.High,
                });
            } catch {
                loc = await ExpoLocation.getLastKnownPositionAsync();
            }

            if (!loc?.coords) {
                setLoading(false);
                Alert.alert(
                    "Konum alınamadı",
                    "Geçerli konum bulunamadı. Emulator kullanıyorsan manuel location ayarlayıp tekrar dene."
                );
                return;
            }

            setCurrentLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                accuracy: loc.coords.accuracy,
            });
        } catch (e) {
            Alert.alert("Hata", "Konum alınırken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const loadMapData = async () => {
        if (!currentLocation) return;

        setLoading(true);
        try {
            const [friends, nearbyPois] = await Promise.all([
                getFriendsLocations(24).catch(() => []),
                getNearbyPoi(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    1500,
                    category === "ALL" ? undefined : category
                ).catch(() => []),
            ]);

            setFriendsLocations(friends);
            setPois(nearbyPois);
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message ?? "Harita verileri alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCurrentLocation();
    }, []);

    useEffect(() => {
        if (currentLocation) {
            loadMapData();
        }
    }, [currentLocation, category]);

    const onShareLocation = async () => {
        if (!currentLocation) return;

        try {
            await shareLocation({
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                accuracyMeters: currentLocation.accuracy ?? undefined,
                visibility: "FRIENDS",
                ttlMinutes: 60,
            });

            setSharing(true);
            Alert.alert("Başarılı", "Konumun arkadaşlarınla paylaşıldı.");
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message ?? "Konum paylaşılamadı.");
        }
    };

    const onStopSharing = async () => {
        try {
            await deleteMyLocation();
            setSharing(false);
            Alert.alert("Tamam", "Konum paylaşımı kapatıldı.");
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message ?? "Konum silinemedi.");
        }
    };

    const lastSeenText = (updatedAt: string) => {
        const diffMs = Date.now() - new Date(updatedAt).getTime();
        const mins = Math.max(1, Math.floor(diffMs / 60000));

        if (mins < 60) return `${mins} dk önce`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} saat önce`;
        const days = Math.floor(hours / 24);
        return `${days} gün önce`;
    };

    const region = useMemo(() => {
        if (!currentLocation) return undefined;

        return {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
        };
    }, [currentLocation]);

    if (loading && !currentLocation) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text style={styles.infoText}>Harita hazırlanıyor...</Text>
            </View>
        );
    }

    if (permissionGranted === false) {
        return (
            <View style={styles.center}>
                <Text style={styles.infoText}>Konum izni verilmedi.</Text>
            </View>
        );
    }

    if (!currentLocation || !region) {
        return (
            <View style={styles.center}>
                <Text style={styles.infoText}>Konum alınamadı.</Text>
                <Button title="Tekrar Dene" onPress={loadCurrentLocation} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {Platform.OS === "web" ? (
                <ScrollView contentContainerStyle={styles.webContainer}>
                    <Card>
                        <Text style={styles.sectionTitle}>Web Önizleme</Text>
                        <Text style={styles.infoText}>
                            Harita bileşeni web’de sınırlı olabilir. Mobil cihaz veya emulator’da
                            daha sağlıklı test edebilirsin.
                        </Text>
                        <Text style={styles.infoText}>
                            Mevcut konum: {currentLocation.latitude.toFixed(5)},{" "}
                            {currentLocation.longitude.toFixed(5)}
                        </Text>
                    </Card>

                    <Card>
                        <Text style={styles.sectionTitle}>Konum Paylaşımı</Text>
                        <Button
                            title={sharing ? "Konum Paylaşımını Durdur" : "Konumumu Paylaş"}
                            onPress={sharing ? onStopSharing : onShareLocation}
                        />
                        <Button title="Verileri Yenile" onPress={loadMapData} />
                    </Card>

                    <Card>
                        <Text style={styles.sectionTitle}>POI Filtreleri</Text>
                        <View style={styles.filterRow}>
                            <Button title="ALL" onPress={() => setCategory("ALL")} disabled={category === "ALL"} />
                            <Button
                                title="PHARMACY"
                                onPress={() => setCategory("PHARMACY")}
                                disabled={category === "PHARMACY"}
                            />
                        </View>
                        <View style={styles.filterRow}>
                            <Button
                                title="BAKERY"
                                onPress={() => setCategory("BAKERY")}
                                disabled={category === "BAKERY"}
                            />
                            <Button title="CAFE" onPress={() => setCategory("CAFE")} disabled={category === "CAFE"} />
                        </View>
                    </Card>

                    <Card>
                        <Text style={styles.sectionTitle}>Arkadaş Konumları</Text>
                        {friendsLocations.length === 0 ? (
                            <Text style={styles.infoText}>Konum paylaşan arkadaş yok.</Text>
                        ) : (
                            friendsLocations.map((f) => (
                                <View key={f.friendId} style={styles.listItem}>
                                    <Text style={styles.listTitle}>{f.friendName}</Text>
                                    <Text style={styles.infoText}>
                                        {f.latitude.toFixed(5)}, {f.longitude.toFixed(5)}
                                    </Text>
                                    <Text style={styles.infoText}>
                                        Son görülme: {lastSeenText(f.updatedAt)}
                                    </Text>
                                </View>
                            ))
                        )}
                    </Card>

                    <Card>
                        <Text style={styles.sectionTitle}>Yakındaki Yerler</Text>
                        {pois.length === 0 ? (
                            <Text style={styles.infoText}>POI bulunamadı.</Text>
                        ) : (
                            pois.map((p) => (
                                <View key={p.id} style={styles.listItem}>
                                    <Text style={styles.listTitle}>{p.name}</Text>
                                    <Text style={styles.infoText}>{p.category}</Text>
                                    {p.address ? <Text style={styles.infoText}>{p.address}</Text> : null}
                                </View>
                            ))
                        )}
                    </Card>
                </ScrollView>
            ) : (
                <>
                    <MapView style={styles.map} initialRegion={region} showsUserLocation>
                        <Marker
                            coordinate={{
                                latitude: currentLocation.latitude,
                                longitude: currentLocation.longitude,
                            }}
                            title="Ben"
                            description="Mevcut konumun"
                            pinColor="blue"
                        />

                        {friendsLocations.map((f) => (
                            <Marker
                                key={f.friendId}
                                coordinate={{
                                    latitude: f.latitude,
                                    longitude: f.longitude,
                                }}
                                title={f.friendName}
                                description={`Son görülme: ${lastSeenText(f.updatedAt)}`}
                            >
                                <Callout>
                                    <View style={{ minWidth: 120 }}>
                                        <Text style={{ fontWeight: "700" }}>{f.friendName}</Text>
                                        <Text>Son görülme: {lastSeenText(f.updatedAt)}</Text>
                                    </View>
                                </Callout>
                            </Marker>
                        ))}

                        {pois.map((p) => (
                            <Marker
                                key={p.id}
                                coordinate={{
                                    latitude: p.latitude,
                                    longitude: p.longitude,
                                }}
                                title={p.name}
                                description={p.category}
                                pinColor={
                                    p.category === "PHARMACY"
                                        ? "green"
                                        : p.category === "BAKERY"
                                            ? "orange"
                                            : p.category === "CAFE"
                                                ? "purple"
                                                : "red"
                                }
                            />
                        ))}
                    </MapView>

                    <View style={styles.overlay}>
                        <Card>
                            <Text style={styles.sectionTitle}>Konum Paylaşımı</Text>
                            <Button
                                title={sharing ? "Konum Paylaşımını Durdur" : "Konumumu Paylaş"}
                                onPress={sharing ? onStopSharing : onShareLocation}
                            />
                            <Button title="Verileri Yenile" onPress={loadMapData} />
                            <Button title="Konumu Yeniden Al" onPress={loadCurrentLocation} />
                        </Card>

                        <Card>
                            <Text style={styles.sectionTitle}>POI Filtreleri</Text>
                            <View style={styles.filterRow}>
                                <Button title="ALL" onPress={() => setCategory("ALL")} disabled={category === "ALL"} />
                                <Button
                                    title="PHARMACY"
                                    onPress={() => setCategory("PHARMACY")}
                                    disabled={category === "PHARMACY"}
                                />
                            </View>
                            <View style={styles.filterRow}>
                                <Button
                                    title="BAKERY"
                                    onPress={() => setCategory("BAKERY")}
                                    disabled={category === "BAKERY"}
                                />
                                <Button title="CAFE" onPress={() => setCategory("CAFE")} disabled={category === "CAFE"} />
                            </View>
                        </Card>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f6fb" },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f3f6fb",
        padding: 16,
        gap: 12,
    },
    infoText: {
        color: "#5b6b86",
        marginTop: 6,
        textAlign: "center",
    },
    map: {
        flex: 1,
    },
    overlay: {
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 12,
    },
    sectionTitle: {
        fontWeight: "800",
        color: "#233554",
        marginBottom: 8,
    },
    filterRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 6,
    },
    webContainer: {
        padding: 16,
        paddingBottom: 30,
    },
    listItem: {
        paddingVertical: 8,
        borderTopWidth: 1,
        borderColor: "#edf2f7",
    },
    listTitle: {
        fontWeight: "700",
        color: "#233554",
    },
});

export default MapScreen;