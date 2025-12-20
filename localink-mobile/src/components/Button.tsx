import React from "react";
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from "react-native";

type Props = TouchableOpacityProps & {
    title: string;
};

const Button: React.FC<Props> = ({ title, disabled, ...rest }) => {
    return (
        <TouchableOpacity
            {...rest}
            disabled={disabled}
            style={[styles.btn, disabled && styles.disabled, rest.style as any]}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    btn: {
        marginTop: 12,
        backgroundColor: "#4e8df5",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    disabled: { opacity: 0.6 },
    text: { color: "#fff", fontWeight: "700", fontSize: 14 },
});

export default Button;
