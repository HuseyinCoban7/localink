import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { AuthContext } from "../../context/AuthContext";

const LoginScreen = ({ navigation }: any) => {
    const { signIn } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);


    const onSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Eksik bilgi", "Email ve şifre zorunlu.");
            return;
        }

        setLoading(true);
        try {
            await signIn(email.trim(), password);
            // RootNavigator user state ile otomatik App’e geçer
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                "Giriş başarısız. Email/şifre kontrol et.";
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
                <Text style={styles.title}>LocaLink</Text>
                <Text style={styles.subtitle}>Hesabına giriş yap</Text>

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
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Button title={loading ? "Giriş yapılıyor..." : "Giriş Yap"} onPress={onSubmit} disabled={loading} />

                <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.linkWrap}>
                    <Text style={styles.link}>Hesabın yok mu? Kayıt ol</Text>
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
    title: { fontSize: 30, fontWeight: "800", color: "#4361ee", textAlign: "center" },
    subtitle: { marginTop: 6, marginBottom: 16, color: "#5b6b86", textAlign: "center" },
    label: { marginTop: 10, marginBottom: 6, color: "#233554", fontWeight: "600" },
    linkWrap: { marginTop: 10, alignItems: "center" },
    link: { color: "#4e8df5", fontWeight: "600" },
});

export default LoginScreen;
