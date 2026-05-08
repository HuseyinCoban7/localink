import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/Home/HomeScreen";
import MapScreen from "../screens/Map/MapScreen";

import FriendsScreen from "../screens/Friends/FriendsScreen";
import FriendRequestsScreen from "../screens/Friends/FriendRequestsScreen";

import ProfileScreen from "../screens/Profile/ProfileScreen";
import EditProfileScreen from "../screens/Profile/EditProfileScreen";

export type TabParamList = {
    Home: undefined;
    Map: undefined;
    Friends: undefined;
    Profile: undefined;
};

type ProfileStackParamList = {
    ProfileMain: undefined;
    EditProfile: undefined;
};

type FriendsStackParamList = {
    FriendsMain: undefined;
    FriendRequests: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const FriendsStack = createNativeStackNavigator<FriendsStackParamList>();

const ProfileStackNavigator = () => (
    <ProfileStack.Navigator>
        <ProfileStack.Screen
            name="ProfileMain"
            component={ProfileScreen}
            options={{ title: "Profil" }}
        />
        <ProfileStack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ title: "Profili Düzenle" }}
        />
    </ProfileStack.Navigator>
);

const FriendsStackNavigator = () => (
    <FriendsStack.Navigator>
        <FriendsStack.Screen
            name="FriendsMain"
            component={FriendsScreen}
            options={{ title: "Arkadaşlar" }}
        />
        <FriendsStack.Screen
            name="FriendRequests"
            component={FriendRequestsScreen}
            options={{ title: "İstekler" }}
        />
    </FriendsStack.Navigator>
);

const BottomTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: "#2563eb",
                tabBarInactiveTintColor: "#94a3b8",
                tabBarStyle: {
                    height: 62,
                    paddingBottom: 8,
                    paddingTop: 6,
                    backgroundColor: "#ffffff",
                    borderTopColor: "#e2e8f0",
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = "home-outline";

                    if (route.name === "Home") {
                        iconName = focused ? "home" : "home-outline";
                    } else if (route.name === "Map") {
                        iconName = focused ? "map" : "map-outline";
                    } else if (route.name === "Friends") {
                        iconName = focused ? "people" : "people-outline";
                    } else if (route.name === "Profile") {
                        iconName = focused ? "person" : "person-outline";
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Ana Sayfa" }} />
            <Tab.Screen name="Map" component={MapScreen} options={{ title: "Harita" }} />
            <Tab.Screen name="Friends" component={FriendsStackNavigator} options={{ title: "Arkadaşlar" }} />
            <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: "Profil" }} />
        </Tab.Navigator>
    );
};

export default BottomTabs;