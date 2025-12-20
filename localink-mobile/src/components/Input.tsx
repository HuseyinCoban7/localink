import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";

type Props = TextInputProps;

const Input: React.FC<Props> = (props) => {
    return (
        <TextInput
            {...props}
            style={[styles.input, props.style]}
            placeholderTextColor="#9aa6b2"
        />
    );
};

const styles = StyleSheet.create({
    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#d9e2ef",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: "#233554",
    },
});

export default Input;
