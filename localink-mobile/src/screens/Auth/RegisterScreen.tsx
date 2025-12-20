import React, { useContext, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { AuthContext } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RegisterScreen = ({ navigation }: any) => {
    const { signUp } = useContext(AuthContext);

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]).catch(() => { });
    }, []);

    const onSubmit = async () => {
        const cleanName = name.trim();
        const cleanUsername = username.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password;

        if (!cleanName || !cleanUsername || !cleanEmail || !cleanPassword.trim()) {
            Alert.alert("Eksik bilgi", "Tüm alanlar zorunlu.");
            return;
        }
        if (cleanPassword.length < 6) {
            Alert.alert("Zayıf şifre", "Şifre en az 6 karakter olmalı.");
            return;
        }

        setLoading(true);
        try {
            await signUp(cleanName, cleanUsername, cleanEmail, cleanPassword);

            // ✅ Alert'e bağımlı olmadan direkt Login'e yönlendir
            navigation.reset({
                index: 0,
                routes: [{ name: "Login", params: { prefillEmail: cleanEmail } }],
            });
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                "Kayıt başarısız. Email/username zaten kullanılıyor olabilir.";
            Alert.alert("Hata", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.card}>
                <Text style={styles.title}>Kayıt Ol</Text>
                <Text style={styles.subtitle}>Yeni hesap oluştur</Text>

                <Text style={styles.label}>Ad Soyad</Text>
                <Input placeholder="Ad Soyad" value={name} onChangeText={setName} />

                <Text style={styles.label}>Kullanıcı adı</Text>
                <Input
                    placeholder="kullaniciadi"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Email</Text>
                <Input
                    placeholder="ornek@mail.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Text style={styles.label}>Şifre</Text>
                <Input
                    placeholder="En az 6 karakter"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Button
                    title={loading ? "Kaydediliyor..." : "Kayıt Ol"}
                    onPress={onSubmit}
                    disabled={loading}
                />

                <TouchableOpacity
                    onPress={() => navigation.replace("Login")}
                    style={styles.linkWrap}
                >
                    <Text style={styles.link}>Zaten hesabın var mı? Giriş yap</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f6fb", justifyContent: "center", padding: 16 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: "#e0e6f0",
    },
    title: { fontSize: 26, fontWeight: "800", color: "#4361ee", textAlign: "center" },
    subtitle: { marginTop: 6, marginBottom: 16, color: "#5b6b86", textAlign: "center" },
    label: { marginTop: 10, marginBottom: 6, color: "#233554", fontWeight: "600" },
    linkWrap: { marginTop: 10, alignItems: "center" },
    link: { color: "#4e8df5", fontWeight: "600" },
});

export default RegisterScreen;
