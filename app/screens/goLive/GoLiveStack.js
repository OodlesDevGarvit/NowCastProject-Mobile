import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import NavigationDrawerHeader from '../../components/NavigationDrawerHeader';

import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'
import { useSelector } from 'react-redux';
import ItemsList from './itemsList/ItemsList';
import ItemDetail from './itemDetail/ItemDetail';
import LiveScreen from './liveScreen/LiveScreen';


const Stack = createStackNavigator();

export default function GoLiveStackScreen() {
    const { brandColor, mobileTheme: theme } = useSelector(
        (state) => state.brandingReducer.brandingData
    );

    return (
        <Stack.Navigator
            screenOptions={({ navigation, route }) => ({
                headerBackTitleVisible: false,
                headerTintColor: "#fff",
                headerStyle: {
                    backgroundColor: brandColor,
                    shadowRadius: 0,
                    shadowColor: "transparent",
                    elevation: 0,
                    shadowOffset: {
                        height: 0,
                    },
                },
                animationEnabled: false,
            })}
        >
            <Stack.Screen
                name="ItemsList"
                component={ItemsList}
                options={({ navigation, route }) => ({
                    title: "Live",
                    headerStatusBarHeight: Platform.OS == 'android' ? 0 : undefined,
                    headerLeft: () => (
                        <NavigationDrawerHeader navigationProps={navigation} />
                    ),
                    headerRightContainerStyle: {
                        marginRight: 20,
                    },
                })}
            />
            <Stack.Screen
                name="ItemDetail"
                component={ItemDetail}
                title={null}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="LiveScreen"
                component={LiveScreen}
                title={null}
                options={{
                    headerShown: false
                }}
            />
        </Stack.Navigator>
    );
}

