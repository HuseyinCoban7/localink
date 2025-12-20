import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AuthContext } from "../../context/AuthContext";

const HomeScreen: React.FC = () => {
    const { user } = useContext(AuthContext);
    return (
        <View style={styles.container}>
            <Text style={styles.title}>LocaLink</Text>
            <Text style={styles.subtitle}>Hoş geldin, {user?.name ?? user?.username} 👋</Text>
            <Text style={styles.text}>Harita sekmesinden arkadaşlarını ve POI’leri görebilirsin.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f6fb", padding: 16, justifyContent: "center" },
    title: { fontSize: 28, fontWeight: "800", color: "#4361ee", marginBottom: 8 },
    subtitle: { fontSize: 16, fontWeight: "600", color: "#233554", marginBottom: 8 },
    text: { color: "#5b6b86" },
});

export default HomeScreen;
