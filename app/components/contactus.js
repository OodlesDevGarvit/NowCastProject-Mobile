import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    TouchableWithoutFeedback,
    StyleSheet,
    Dimensions,
    FlatList,
    Image,
    Linking
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { WebView } from 'react-native-webview';
const { width, height } = Dimensions.get('window');

const ContactUsComponent = ({ item }) => {
    return (
        <TouchableWithoutFeedback onPress={() => {
            Linking.openURL(`${item.value}`)

        }}>
            <View style={Styles.card}>
                <Image style={Styles.image} source={{uri:item.img}} />
            </View>
        </TouchableWithoutFeedback>
    )
}

const Styles = StyleSheet.create({
    card: {
        // borderWidth: 1,
        marginHorizontal: width * 0.05,
        marginBottom: width * 0.05,
    },
    image: {
        // backgroundColor: 'red',
        width: '100%',
        height: 200,
        borderRadius: 4

    }

})
export default  ContactUsComponent;