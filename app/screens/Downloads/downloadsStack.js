import React from 'react'
import { View,StyleSheet } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import NavigationDrawerHeader from '../../components/NavigationDrawerHeader';
import { useSelector } from 'react-redux';
import Downloads from './Downloads';


const DownloadsStack = createStackNavigator()

export default function DownloadsStackScreen({ navigation }) {
  const { brandColor, mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
    return (
      <DownloadsStack.Navigator
        screenOptions={({ navigation, route }) => ({
          animationEnabled: false,
          headerStyle: {
            backgroundColor:brandColor,
            shadowRadius: 0,
            shadowColor: "transparent",
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
          headerTintColor: "#fff",
          cardOverlay: () => (
            <View style={{ backgroundColor: brandColor, height: 60 }}></View>
          ),
          cardStyle: {
            backgroundColor: "transparent",
            opacity: 1,
          },
        })}
      >
        <DownloadsStack.Screen
          name="Downloads"
          component={Downloads}
          options={({ navigation, route }) => ({
            title: "Downloads", //Set Header Title
            headerLeft: () => (
              <NavigationDrawerHeader navigationProps={navigation} />
            ),
          
          })}
        />
      </DownloadsStack.Navigator>
    );
}

const styles = StyleSheet.create({
  backArrow: {
    position: 'absolute',
    top: 10,
    left: 0,
    width: 40,
    height: 30,
  }



})