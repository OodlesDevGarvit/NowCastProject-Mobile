import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Login/LoginScreen';
import RegisterScreen from '../screens/Register/RegisterScreen';
import ForgotScreen from '../screens/ForgotPassword/ForgotScreen';
import { useSelector } from 'react-redux';
import { Platform } from 'react-native';

const Stack = createStackNavigator();

const Auth = () => {
  const { brandColor } = useSelector(state => state.brandingReducer.brandingData);
  return (
    <Stack.Navigator
      initialRouteName="LoginScreen"
      detachInactiveScreens={false}
      screenOptions={{
        headerBackTitleVisible:false,
        headerStatusBarHeight: Platform.OS == 'android' ? 0 : undefined,
        headerMode: 'float',
        headerShown: true,
        animationEnabled: false,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: brandColor,
          shadowColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: brandColor,
        },

      }}
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ title: "" }} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ title: "REGISTER" }} />
      <Stack.Screen name="ForgotScreen" component={ForgotScreen} options={{ title: "FORGOT PASSWORD" }} />
    </Stack.Navigator>
  );
};

export default Auth;
