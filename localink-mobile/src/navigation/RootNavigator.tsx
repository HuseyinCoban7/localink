import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthContext } from "../context/AuthContext";

// Auth screens
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";

// App (tabs)
import BottomTabs from "./BottomTabs";

/**
 * Root stack param list
 */
export type RootStackParamList = {
    Auth: undefined;
    App: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

/**
 * Auth stack param list
 */
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Auth Stack (Login / Register)
 */
const AuthStackNavigator: React.FC = () => {
    return (
        <AuthStack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerShown: false,
            }}
        >
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
    );
};

/**
 * Root Navigator
 */
const RootNavigator: React.FC = () => {
    const { user, loading } = useContext(AuthContext);

    // Auth state yüklenirken beyaz ekran / splash
    if (loading) {
        return null; // istersen ActivityIndicator koyabiliriz
    }

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <RootStack.Screen name="App" component={BottomTabs} />
                ) : (
                    <RootStack.Screen name="Auth" component={AuthStackNavigator} />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;
