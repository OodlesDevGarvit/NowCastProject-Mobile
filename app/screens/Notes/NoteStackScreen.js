import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import NavigationDrawerHeader from '../../components/NavigationDrawerHeader';
import AddNote from './AddNote';
import NotesHome from './NotesHome';
import SingleNote from './SingleNote';

import { createStackNavigator } from '@react-navigation/stack'
import { useSelector } from 'react-redux';


const NoteStack = createStackNavigator();

export default function NoteStackScreen({ navigation }) {
  const { brandColor, mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );

    return (
      <NoteStack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerBackTitleVisible:false,
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
          cardOverlay: () => (
            <View style={{ backgroundColor: brandColor, height: 60 }}></View>
          ),
          cardStyle: {
            backgroundColor: "transparent",
            opacity: 1,
          },
          animationEnabled: false,
        })}
      >
        <NoteStack.Screen
          name="NotesHome"
          component={NotesHome}
          options={({ navigation, route }) => ({
            title: "Notes",
            headerLeft: () => (
              <NavigationDrawerHeader navigationProps={navigation} />
            ),
            headerRightContainerStyle: {
              marginRight: 20,
            },
          })}
        />
        <NoteStack.Screen
          name="AddNote"
          component={AddNote}
          title={null}
          options={({ navigation, route }) => ({
            title: null,
            // headerRightContainerStyle: {
            //     marginRight: 15
            // }
          })}
        />
        <NoteStack.Screen
          name="SingleNote"
          component={SingleNote}
          title={null}
          options={({ navigation, route }) => ({
            title: null,
            headerRightContainerStyle: {
              marginRight: 15,
            },
          })}
        />
      </NoteStack.Navigator>
    );
}

