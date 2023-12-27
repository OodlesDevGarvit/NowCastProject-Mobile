import React, { useState, useEffect } from 'react'
import { View, Text, StatusBar, StyleSheet } from 'react-native'
import { DynamicThemeConstants } from '../../constant/ThemeConstant'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/Fontisto'
import { useSelector } from 'react-redux'

export default function NotLoggedInSubscriptionDetails() {

    const { mobileTheme: theme } = useSelector(state => state.brandingReducer.brandingData);
    return (
        <View style={{
            backgroundColor: (theme == 'DARK') ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 100

        }
        }>
            <StatusBar animated={true} backgroundColor={"gray"} />
            <Icon name="flash" size={80} style={{
                ...styles.icons,
                color: (theme == 'DARK') ? DynamicThemeConstants.DARK.ICON_COLOR_WHITE : DynamicThemeConstants.LIGHT.ICON_COLOR
            }} />
            <Text style={{
                ...styles.text,
                color: (theme == 'DARK' ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY)
            }}>You must be logged in to access this.</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    icons: {

    },
    text: {
        fontWeight: 'bold',
        fontSize: 23,
        textAlign: 'center',
        paddingHorizontal: 20,
        marginTop: 25
    }
})


