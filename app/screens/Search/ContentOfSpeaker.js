import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, Image, Dimensions, StyleSheet } from 'react-native'

import ThemeConstant from '../../constant/ThemeConstant';
import { DynamicThemeConstants } from '../../constant/ThemeConstant';
// import Api


const Content = [
    {
        id: 2,
        img: "https://images.unsplash.com/photo-1606787620819-8bdf0c44c293?ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
        title: 'Protecting',
        artist: 'AnGala Portorreal'
    },
    {
        id: 1,
        img: "https://images.unsplash.com/photo-1606787620819-8bdf0c44c293?ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
        title: 'Protecting',
        artist: 'AnGala Portorreal'
    }
]

const width = Dimensions.get("window").width;

export default function ContentOfSpeaker({ navigation, route }) {

    const { item, theme } = route.params

    useEffect(() => {
        navigation.setOptions({
            title: item.name
        })
    })

    return (
        <View style={
            {
                backgroundColor: (theme == 'DARK') ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
                flex: 1
            }
        }>
            <FlatList
                data={Content}
                renderItem={({ item }) =>
                    <TouchableOpacity>
                        <View style={Styles.card}>
                            <Image
                                source={{ uri: item.img }}
                                style={Styles.img} />
                            <Text style={
                                {
                                    ...Styles.title,
                                    color: (theme == "DARK") ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                                }
                            }>{item.title}</Text>
                            <Text style={
                                {
                                    ...Styles.name,
                                    color: (theme == "DARK") ? DynamicThemeConstants.DARK.TEXT_COLOR_SECONDARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY
                                }
                            }>{item.artist}</Text>
                        </View>

                    </TouchableOpacity>

                }
                keyExtractor={item => item.id} />

        </View>
    )
}

const Styles = StyleSheet.create({
    card: {
        // borderWidth: 1,
        marginHorizontal: 15,
        marginBottom: 10,
        marginTop: 5

    },
    img: {
        // borderWidth: 1,
        height: 200,
        width: width - 32,
        borderRadius: 10
    },
    title: {
        // borderWidth: 1,
        paddingTop: 10,
        fontWeight: 'bold'
    },
    name: {
        // borderWidth: 1,
        paddingTop: 3,
        color: "rgba(0,0,0,0.7)"

    }
})
