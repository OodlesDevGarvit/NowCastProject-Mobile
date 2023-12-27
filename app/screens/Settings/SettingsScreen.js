import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableWithoutFeedback, StatusBar } from 'react-native';
import NavigationDrawerHeader from '../../components/NavigationDrawerHeader';
import AboutIcon from 'react-native-vector-icons/Feather';
import NotificationIcon from 'react-native-vector-icons/Entypo'
import HelpIcon from 'react-native-vector-icons/SimpleLineIcons'
import { DynamicThemeConstants } from '../../constant/ThemeConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { OpenUrl } from '../../services/TabDesignsService';

const HELP_URL='https://www.nowcast.cc/support';

export default function SettingsScreen({ navigation }) {
    const { brandColor, mobileTheme: theme } = useSelector(state => state.brandingReducer.brandingData);
    return (
        <View style={
            {
                flex: 1,
                backgroundColor: (theme == "DARK") ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE
            }
        }>
            <StatusBar
                animated={true}
                backgroundColor={brandColor} />

            <TouchableWithoutFeedback onPress={() => {  //about section of the settings-------------
                navigation.navigate('About', theme)
            }}>
                <View style={
                    {
                        ...Styles.item,
                        backgroundColor: (theme == "DARK") ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
                        borderBottomColor: (theme == "DARK") ? DynamicThemeConstants.DARK.BORDER_COLOR_PRIMARY : DynamicThemeConstants.LIGHT.BORDER_COLOR_PRIMARY
                    }
                }>
                    <AboutIcon name="info" size={20} color={'gray'} />
                    <Text style={
                        {
                            ...Styles.text,
                            color: (theme == 'DARK') ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                        }
                    }>About</Text>
                </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => { // Notifications sections of the settings------------------
                navigation.navigate('Notifications', theme)
            }}>
                <View style={
                    {
                        ...Styles.item,
                        backgroundColor: (theme == "DARK") ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
                        borderBottomColor: (theme == "DARK") ? DynamicThemeConstants.DARK.BORDER_COLOR_PRIMARY : DynamicThemeConstants.LIGHT.BORDER_COLOR_PRIMARY
                    }
                }>
                    <NotificationIcon name="notification" size={20} color={'gray'} />
                    <Text style={
                        {
                            ...Styles.text,
                            color: (theme == 'DARK') ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY

                        }
                    }>Notifications</Text>
                </View>
            </TouchableWithoutFeedback>


            <TouchableWithoutFeedback onPress={() => {  // Help section of the settings--------------------
                OpenUrl(HELP_URL)
            }}>
                <View style={
                    {
                        ...Styles.item,
                        backgroundColor: (theme == "DARK") ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
                        borderBottomColor: (theme == "DARK") ? DynamicThemeConstants.DARK.BORDER_COLOR_PRIMARY : DynamicThemeConstants.LIGHT.BORDER_COLOR_PRIMARY
                    }
                }>
                    <HelpIcon name="question" size={20} color={'gray'} />
                    <Text style={
                        {
                            ...Styles.text,
                            color: (theme == 'DARK') ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                        }
                    }>Help</Text>
                </View>
            </TouchableWithoutFeedback>
        </View>


    )
}

const Styles = StyleSheet.create({
    container: {
        //
    },
    item: {
        borderBottomWidth: 1,
        flexDirection: 'row',
        height: 70,
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    text: {
        // borderWidth: 1,
        paddingHorizontal: 30,
        fontSize: 16
    }
})
