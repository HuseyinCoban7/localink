import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { AuthContext } from "../../context/AuthContext";
import { updateMe } from "../../api/userApi";

const EditProfileScreen = ({ navigation }: any) => {
    const { user, setUser } = useContext(AuthContext);

    const [name, setName] = useState(user?.name ?? "");
    const [bio, setBio] = useState(user?.bio ?? "");
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
    const [saving, setSaving] = useState(false);

    const onSave = async () => {
        setSaving(true);
        try {
            const updated = await updateMe({ name, bio, avatarUrl });
            await setUser(updated);
            Alert.alert("Başarılı", "Profil güncellendi.");
            navigation.goBack();
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message ?? "Profil güncellenemedi.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Ad Soyad</Text>
            <Input value={name} onChangeText={setName} placeholder="Ad Soyad" />

            <Text style={styles.label}>Bio</Text>
            <Input value={bio} onChangeText={setBio} placeholder="Bio" multiline />

            <Text style={styles.label}>Avatar URL</Text>
            <Input value={avatarUrl} onChangeText={setAvatarUrl} placeholder="https://..." autoCapitalize="none" />

            <Button title={saving ? "Kaydediliyor..." : "Kaydet"} onPress={onSave} disabled={saving} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f6fb", padding: 16 },
    label: { marginTop: 10, marginBottom: 6, color: "#233554", fontWeight: "700" },
});

export default EditProfileScreen;
