import React from 'react'
import { View, Text } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import InboxHome from './InboxHome'
import InboxDetail from './InboxDetail'
import NavigationDrawerHeader from '../../components/NavigationDrawerHeader';
import ThemeConstant from '../../constant/ThemeConstant'
import { useSelector } from 'react-redux'


const InboxStack = createStackNavigator()

export default function InboxStackScreen({ navigation }) {
  const { brandColor, mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
    return (
      <InboxStack.Navigator
        screenOptions={({ navigation, route }) => ({
          animationEnabled: false,
          headerBackTitleVisible:false,
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
        <InboxStack.Screen
          name="InboxHome"
          component={InboxHome}
          options={({ navigation, route }) => ({
            title: "Inbox", //Set Header Title
            headerLeft: () => (
              <NavigationDrawerHeader navigationProps={navigation} />
            ),
          })}
        />

        <InboxStack.Screen
          name="InboxDetail"
          component={InboxDetail}
          options={({ navigation, route }) => ({
            title: null,
            //Set Header Title
          })}
        />
      </InboxStack.Navigator>
    );
}
