import React, { useEffect, useMemo, useRef, useState } from "react";
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

const categoryLabels: Record<CategoryFilter, string> = {
    ALL: "Tümü",
    PHARMACY: "Eczane",
    BAKERY: "Fırın",
    CAFE: "Kafe",
    OTHER: "Diğer",
};

const MapScreen: React.FC = () => {
    const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [sharing, setSharing] = useState(false);

    const shareIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

            let loc: ExpoLocation.LocationObject | null = null;

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
        } catch {
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

    const shareCurrentLocationOnce = async () => {
        let loc = currentLocation;

        try {
            const fresh = await ExpoLocation.getCurrentPositionAsync({
                accuracy: ExpoLocation.Accuracy.High,
            });

            loc = {
                latitude: fresh.coords.latitude,
                longitude: fresh.coords.longitude,
                accuracy: fresh.coords.accuracy,
            };

            setCurrentLocation(loc);
        } catch {
            // Mevcut currentLocation varsa onunla paylaşmaya devam eder.
        }

        if (!loc) return;

        await shareLocation({
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracyMeters: loc.accuracy ?? undefined,
            visibility: "FRIENDS",
            ttlMinutes: 60,
        });
    };

    const startAutoSharing = async () => {
        try {
            await shareCurrentLocationOnce();

            setSharing(true);

            if (shareIntervalRef.current) {
                clearInterval(shareIntervalRef.current);
            }

            shareIntervalRef.current = setInterval(async () => {
                try {
                    await shareCurrentLocationOnce();
                    await loadMapData();
                } catch (e) {
                    console.log("Auto location share failed:", e);
                }
            }, 30000);

            Alert.alert("Başarılı", "Konumun otomatik olarak paylaşılmaya başladı.");
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message ?? "Konum paylaşılamadı.");
        }
    };

    const stopAutoSharing = async () => {
        try {
            if (shareIntervalRef.current) {
                clearInterval(shareIntervalRef.current);
                shareIntervalRef.current = null;
            }

            await deleteMyLocation();
            setSharing(false);

            Alert.alert("Tamam", "Konum paylaşımı kapatıldı.");
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message ?? "Konum silinemedi.");
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

    useEffect(() => {
        return () => {
            if (shareIntervalRef.current) {
                clearInterval(shareIntervalRef.current);
            }
        };
    }, []);

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

    const filterItems: CategoryFilter[] = ["ALL", "PHARMACY", "BAKERY", "CAFE"];

    return (
        <View style={styles.container}>
            {Platform.OS === "web" ? (
                <ScrollView contentContainerStyle={styles.webContainer}>
                    <Card>
                        <Text style={styles.sectionTitle}>Web Önizleme</Text>
                        <Text style={styles.infoText}>
                            Harita bileşeni web’de sınırlı olabilir. Mobil cihaz veya emulator’da daha sağlıklı test edebilirsin.
                        </Text>
                        <Text style={styles.infoText}>
                            Mevcut konum: {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
                        </Text>
                    </Card>

                    <Card>
                        <Text style={styles.sectionTitle}>Konum Paylaşımı</Text>
                        <Button
                            title={sharing ? "Paylaşımı Durdur" : "Konumumu Paylaş"}
                            onPress={sharing ? stopAutoSharing : startAutoSharing}
                        />
                        <Button title="Verileri Yenile" onPress={loadMapData} />
                    </Card>

                    <Card>
                        <Text style={styles.sectionTitle}>POI Filtreleri</Text>
                        <View style={styles.chipRow}>
                            {filterItems.map((item) => (
                                <Text
                                    key={item}
                                    onPress={() => setCategory(item)}
                                    style={[styles.chip, category === item && styles.chipActive]}
                                >
                                    {categoryLabels[item]}
                                </Text>
                            ))}
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
                                    <Text style={styles.infoText}>Son görülme: {lastSeenText(f.updatedAt)}</Text>
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
                        <View style={styles.mapPanel}>
                            <View style={styles.panelHeader}>
                                <View>
                                    <Text style={styles.panelTitle}>Konum Paylaşımı</Text>
                                    <Text style={styles.panelSubtitle}>
                                        {sharing ? "Konumun arkadaşlarınla paylaşılıyor" : "Konum paylaşımı kapalı"}
                                    </Text>
                                </View>

                                <View style={[styles.statusDot, sharing ? styles.statusOn : styles.statusOff]} />
                            </View>

                            <Button
                                title={sharing ? "Paylaşımı Durdur" : "Konumumu Paylaş"}
                                onPress={sharing ? stopAutoSharing : startAutoSharing}
                            />

                            <View style={styles.compactActions}>
                                <Button title="Yenile" onPress={loadMapData} />
                                <Button title="Konum Al" onPress={loadCurrentLocation} />
                            </View>

                            <Text style={styles.filterTitle}>Yakındaki Yerler</Text>

                            <View style={styles.chipRow}>
                                {filterItems.map((item) => (
                                    <Text
                                        key={item}
                                        onPress={() => setCategory(item)}
                                        style={[styles.chip, category === item && styles.chipActive]}
                                    >
                                        {categoryLabels[item]}
                                    </Text>
                                ))}
                            </View>
                        </View>
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
        left: 14,
        right: 14,
        bottom: 18,
    },
    mapPanel: {
        backgroundColor: "#ffffff",
        borderRadius: 22,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    panelHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    panelTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1e293b",
    },
    panelSubtitle: {
        fontSize: 12,
        color: "#64748b",
        marginTop: 3,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    statusOn: {
        backgroundColor: "#22c55e",
    },
    statusOff: {
        backgroundColor: "#ef4444",
    },
    compactActions: {
        flexDirection: "row",
        gap: 10,
    },
    filterTitle: {
        marginTop: 14,
        marginBottom: 8,
        fontSize: 13,
        fontWeight: "700",
        color: "#334155",
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "#e2e8f0",
        color: "#475569",
        fontSize: 12,
        fontWeight: "700",
        overflow: "hidden",
    },
    chipActive: {
        backgroundColor: "#2563eb",
        color: "#ffffff",
    },
    sectionTitle: {
        fontWeight: "800",
        color: "#233554",
        marginBottom: 8,
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