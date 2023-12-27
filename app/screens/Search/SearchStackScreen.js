import React from 'react'
import { View, Text } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack';
import NavigationDrawerHeader from '../../components/NavigationDrawerHeader';
import Search from './Search';
import Speakers from './Speakers';
import ContentOfSpeaker from './ContentOfSpeaker';
import { useSelector } from 'react-redux';


const SearchStack = createStackNavigator();

export default function SearchStackScreen({ navigation, route }) {
    const { brandColor, mobileTheme: theme } = useSelector(
        (state) => state.brandingReducer.brandingData
    );
    
    return (
        <SearchStack.Navigator
            screenOptions={{
                headerShown: true,
            }}>

            <SearchStack.Screen
                name="Search"
                component={Search}
                options={{
                    title: "Search", //Set Header Title
                    headerLeft: () => (
                        <NavigationDrawerHeader navigationProps={navigation} />
                    ),
                    headerStyle: {
                        backgroundColor: brandColor      //Set Header color
                    },

                    headerTintColor: '#fff', //Set Header text color
                }}
            />
            <SearchStack.Screen
                name="Speakers"
                component={Speakers}
                options={{
                    headerStyle: {
                        backgroundColor: '#fff'
                    }
                }} />
            <SearchStack.Screen
                name="ContentOfSpeaker"
                component={ContentOfSpeaker}
                options={({ navigation, route }) => (
                    {
                        headerStyle: {
                            backgroundColor: '#fff'
                        }
                    }
                )} />




        </SearchStack.Navigator>
    )
}
