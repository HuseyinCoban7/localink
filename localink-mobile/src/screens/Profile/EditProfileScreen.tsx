import React, { useContext, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import Input from "../../components/Input";
import Button from "../../components/Button";
import { AuthContext } from "../../context/AuthContext";
import { updateMe, uploadAvatar } from "../../api/userApi";

const EditProfileScreen = ({ navigation }: any) => {
    const { user, setUser } = useContext(AuthContext);

    const [name, setName] = useState(user?.name ?? "");
    const [bio, setBio] = useState(user?.bio ?? "");
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const initials = useMemo(() => {
        if (!name.trim()) return "U";

        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    }, [name]);

    const avatarPreview = selectedImageUri || user?.avatarUrl || "";

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert("İzin gerekli", "Profil fotoğrafı seçmek için galeri izni vermelisin.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            setSelectedImageUri(result.assets[0].uri);
        }
    };

    const onSave = async () => {
        const cleanName = name.trim();
        const cleanBio = bio.trim();

        if (!cleanName) {
            Alert.alert("Eksik bilgi", "Ad soyad alanı boş bırakılamaz.");
            return;
        }

        setSaving(true);

        try {
            let updated = await updateMe({
                name: cleanName,
                bio: cleanBio,
            });

            if (selectedImageUri) {
                updated = await uploadAvatar(selectedImageUri);
            }

            await setUser(updated);

            Alert.alert("Başarılı", "Profil güncellendi.");
            navigation.goBack();
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message ?? "Profil güncellenemedi.");
        } finally {
            setSaving(false);
        }
    };

    const clearSelectedImage = () => {
        setSelectedImageUri(null);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={22} color="#1e293b" />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                    <Text style={styles.pageTitle}>Profili Düzenle</Text>
                    <Text style={styles.pageSubtitle}>Hesap görünümünü güncelle</Text>
                </View>
            </View>

            <View style={styles.previewCard}>
                {avatarPreview ? (
                    <Image source={{ uri: avatarPreview }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                    <Ionicons name="camera-outline" size={18} color="#2563eb" />
                    <Text style={styles.photoButtonText}>Fotoğraf Seç</Text>
                </TouchableOpacity>

                {selectedImageUri ? (
                    <TouchableOpacity style={styles.removePhotoButton} onPress={clearSelectedImage}>
                        <Ionicons name="close-circle-outline" size={17} color="#dc2626" />
                        <Text style={styles.removePhotoText}>Seçimi kaldır</Text>
                    </TouchableOpacity>
                ) : null}

                <Text style={styles.previewName}>{name.trim() || "Ad Soyad"}</Text>
                <Text style={styles.previewUsername}>@{user?.username ?? "username"}</Text>

                <Text style={styles.previewHint}>
                    Seçtiğin fotoğraf kaydet dediğinde profil fotoğrafın olarak yüklenecek.
                </Text>
            </View>

            <View style={styles.formCard}>
                <Text style={styles.cardTitle}>Profil Bilgileri</Text>

                <Text style={styles.label}>Ad Soyad</Text>
                <Input value={name} onChangeText={setName} placeholder="Ad Soyad" />

                <Text style={styles.label}>Bio</Text>
                <Input
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Kendinden kısaca bahset"
                    multiline
                    style={styles.bioInput}
                />
            </View>

            <View style={styles.actionsCard}>
                <Button
                    title={saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                    onPress={onSave}
                    disabled={saving}
                />

                {saving ? (
                    <View style={styles.savingRow}>
                        <ActivityIndicator size="small" />
                        <Text style={styles.savingText}>Profil güncelleniyor...</Text>
                    </View>
                ) : null}

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                    disabled={saving}
                >
                    <Text style={styles.cancelText}>Vazgeç</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={21} color="#2563eb" />
                <Text style={styles.infoText}>
                    Profil fotoğrafın güvenli şekilde sunucuya yüklenir ve profilinde otomatik görünür.
                </Text>
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
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
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
        fontSize: 25,
        fontWeight: "900",
        color: "#1e293b",
    },
    pageSubtitle: {
        marginTop: 3,
        fontSize: 13,
        color: "#64748b",
    },
    previewCard: {
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 18,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e0e6f0",
        marginBottom: 14,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 34,
        marginBottom: 12,
    },
    avatarPlaceholder: {
        width: 96,
        height: 96,
        borderRadius: 34,
        backgroundColor: "#dbeafe",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 30,
        fontWeight: "900",
        color: "#2563eb",
    },
    photoButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        backgroundColor: "#eff6ff",
        borderWidth: 1,
        borderColor: "#bfdbfe",
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 14,
        marginBottom: 8,
    },
    photoButtonText: {
        color: "#2563eb",
        fontWeight: "900",
        fontSize: 13,
    },
    removePhotoButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#fff1f2",
        borderWidth: 1,
        borderColor: "#fecaca",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 13,
        marginBottom: 10,
    },
    removePhotoText: {
        color: "#dc2626",
        fontWeight: "800",
        fontSize: 12,
    },
    previewName: {
        fontSize: 21,
        fontWeight: "900",
        color: "#1e293b",
        textAlign: "center",
    },
    previewUsername: {
        marginTop: 4,
        color: "#64748b",
        fontWeight: "700",
    },
    previewHint: {
        marginTop: 10,
        color: "#64748b",
        fontSize: 12,
        textAlign: "center",
        lineHeight: 18,
    },
    formCard: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e0e6f0",
        marginBottom: 14,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "900",
        color: "#1e293b",
        marginBottom: 10,
    },
    label: {
        marginTop: 10,
        marginBottom: 7,
        color: "#334155",
        fontWeight: "800",
        fontSize: 13,
    },
    bioInput: {
        minHeight: 90,
        textAlignVertical: "top",
    },
    actionsCard: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e0e6f0",
        marginBottom: 14,
    },
    savingRow: {
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    savingText: {
        color: "#64748b",
        fontSize: 12,
        fontWeight: "600",
    },
    cancelButton: {
        marginTop: 10,
        alignItems: "center",
        paddingVertical: 11,
        borderRadius: 12,
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    cancelText: {
        color: "#475569",
        fontWeight: "800",
    },
    infoBox: {
        flexDirection: "row",
        gap: 10,
        backgroundColor: "#eff6ff",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#bfdbfe",
    },
    infoText: {
        flex: 1,
        color: "#1e40af",
        fontSize: 12,
        lineHeight: 18,
        fontWeight: "600",
    },
});

export default EditProfileScreen;