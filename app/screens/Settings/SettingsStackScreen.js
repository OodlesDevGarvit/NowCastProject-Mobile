import React from 'react'
import { View, Text } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'

import NavigationDrawerHeader from '../../components/NavigationDrawerHeader';


import About from './About';
import Notifications from './Notifications';
import SettingsScreen from './SettingsScreen';
import { useSelector } from 'react-redux';

const SettingsStack = createStackNavigator();

export default function SettingsStackScreen() {
  const { brandColor, mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
    return (
      <SettingsStack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerMode: "float",
          headerBackTitleVisible:false,
          animationEnabled: false,
          cardOverlay: () => (
            <View
              style={{
                backgroundColor: brandColor,
                height: 60,
              }}
            ></View>
          ),
          cardStyle: {
            backgroundColor: "transparent",
            opacity: 1,
          },
          headerTintColor: "white",
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: "transparent",
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
        })}
      >
        <SettingsStack.Screen
          name="Settings"
          component={SettingsScreen}
          title="Settings"
          options={({ navigation }) => ({
            headerLeft: () => (
              <NavigationDrawerHeader navigationProps={navigation} />
            ),
          })}
        />
        <SettingsStack.Screen name="About" component={About} title="About" />
        <SettingsStack.Screen
          name="Notifications"
          component={Notifications}
          title="Notifications"
        />
      </SettingsStack.Navigator>
    );
}
