import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/Home/HomeScreen";
import MapScreen from "../screens/Map/MapScreen";

// Friends stack screens
import FriendsScreen from "../screens/Friends/FriendsScreen";
import FriendRequestsScreen from "../screens/Friends/FriendRequestsScreen";

// Profile stack screens
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
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="Friends" component={FriendsStackNavigator} />
            <Tab.Screen name="Profile" component={ProfileStackNavigator} />
        </Tab.Navigator>
    );
};

export default BottomTabs;
