import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";

type Props = ViewProps & {
    children: React.ReactNode;
};

const Card: React.FC<Props> = ({ children, style, ...rest }) => {
    return (
        <View {...rest} style={[styles.card, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e0e6f0",
        marginBottom: 12,
    },
});

export default Card;
