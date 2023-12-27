import React from 'react'
import { View, Text,button,StyleSheet,TouchableOpacity } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import contactUsFea from './contactUsFeature';
import NavigationDrawerHeader from '../../components/NavigationDrawerHeader';
import ThemeConstant from '../../constant/ThemeConstant'
import { useSelector } from 'react-redux'
import { Button } from 'react-native-share';
import QuerySent from './QuerySent';


const ContactUsStack = createStackNavigator()

export default function ContactUsStackScreen({ navigation }) {
  const { brandColor, mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
    return (
      <ContactUsStack.Navigator
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
        <ContactUsStack.Screen
          name="ContactUs"
          component={contactUsFea}
          options={({ navigation, route }) => ({
            title: "Contact Us", //Set Header Title
            headerLeft: () => (
              <NavigationDrawerHeader navigationProps={navigation} />
            ),
          
          })}
        />

{/* <ContactUsStack.Screen
          name="QuerySent"
          component={QuerySent}
          options={({ navigation, route }) => ({
            title: "", //Set Header Title
            // headerLeft: () => (
            //   <NavigationDrawerHeader navigationProps={navigation} />
            // ),
          
          })}
        /> */}


      </ContactUsStack.Navigator>
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