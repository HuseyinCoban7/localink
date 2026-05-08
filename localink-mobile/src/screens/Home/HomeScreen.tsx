import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";

const HomeScreen = ({ navigation }: any) => {
    const { user } = useContext(AuthContext);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.headerCard}>
                <View style={styles.logoBadge}>
                    <Ionicons name="location" size={22} color="#2563eb" />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.appName}>LocaLink</Text>
                    <Text style={styles.welcome}>
                        Hoş geldin, {user?.name ?? user?.username} 👋
                    </Text>
                    <Text style={styles.description}>
                        Arkadaşlarını ve yakındaki yerleri haritadan takip et.
                    </Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Ionicons name="people-outline" size={22} color="#2563eb" />
                    <Text style={styles.statValue}>Arkadaşlar</Text>
                    <Text style={styles.statLabel}>Bağlantılarını yönet</Text>
                </View>

                <View style={styles.statCard}>
                    <Ionicons name="location-outline" size={22} color="#2563eb" />
                    <Text style={styles.statValue}>Konum</Text>
                    <Text style={styles.statLabel}>Paylaşımı kontrol et</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Map")}>
                <View style={styles.actionIcon}>
                    <Ionicons name="map-outline" size={22} color="#2563eb" />
                </View>
                <View style={styles.actionTextWrap}>
                    <Text style={styles.actionTitle}>Haritayı Aç</Text>
                    <Text style={styles.actionSubtitle}>
                        Arkadaşlarını ve yakındaki POI’leri görüntüle.
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Friends")}>
                <View style={styles.actionIcon}>
                    <Ionicons name="person-add-outline" size={22} color="#2563eb" />
                </View>
                <View style={styles.actionTextWrap}>
                    <Text style={styles.actionTitle}>Arkadaş Ara</Text>
                    <Text style={styles.actionSubtitle}>
                        Yeni arkadaşlar ekle veya isteklerini kontrol et.
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Profile")}>
                <View style={styles.actionIcon}>
                    <Ionicons name="person-outline" size={22} color="#2563eb" />
                </View>
                <View style={styles.actionTextWrap}>
                    <Text style={styles.actionTitle}>Profilini Düzenle</Text>
                    <Text style={styles.actionSubtitle}>
                        Bio ve profil bilgilerini güncelle.
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <View style={styles.tipCard}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#16a34a" />
                <View style={{ flex: 1 }}>
                    <Text style={styles.tipTitle}>Gizlilik sende</Text>
                    <Text style={styles.tipText}>
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
        paddingBottom: 28,
    },
    headerCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 22,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e0e6f0",
    },
    logoBadge: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    appName: {
        fontSize: 24,
        fontWeight: "900",
        color: "#2563eb",
        marginBottom: 2,
    },
    welcome: {
        fontSize: 14,
        fontWeight: "800",
        color: "#1e293b",
        marginBottom: 4,
    },
    description: {
        fontSize: 12,
        color: "#64748b",
        lineHeight: 17,
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e0e6f0",
    },
    statValue: {
        marginTop: 10,
        fontSize: 15,
        fontWeight: "800",
        color: "#1e293b",
    },
    statLabel: {
        marginTop: 4,
        fontSize: 12,
        color: "#64748b",
        lineHeight: 17,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "900",
        color: "#1e293b",
        marginBottom: 10,
    },
    actionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 18,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#e0e6f0",
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
    actionTextWrap: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#1e293b",
    },
    actionSubtitle: {
        marginTop: 3,
        fontSize: 12,
        color: "#64748b",
        lineHeight: 17,
    },
    tipCard: {
        marginTop: 8,
        flexDirection: "row",
        gap: 12,
        backgroundColor: "#ecfdf5",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#bbf7d0",
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: "900",
        color: "#166534",
    },
    tipText: {
        marginTop: 3,
        fontSize: 12,
        color: "#166534",
        lineHeight: 17,
    },
});

export default HomeScreen;