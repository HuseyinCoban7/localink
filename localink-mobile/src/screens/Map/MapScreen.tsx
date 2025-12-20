import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MapScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>🗺️ Map Screen</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f3f6fb",
    },
    text: {
        fontSize: 18,
        fontWeight: "600",
        color: "#233554",
    },
});

export default MapScreen;
