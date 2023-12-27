import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableWithoutFeedback,
    Linking
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const { width, height } = Dimensions.get('window');

const DATA = [
    {

        id: 1,
        logoName: "facebook",
        url: 'https://www.facebook.com/'
    },
    {
        id: 2,
        logoName: 'instagram',
        url: 'https://www.instagram.com/'
    },
    {
        id: 3,
        logoName: 'twitter',
        url: 'https://www.twitter.com/'
    },
    {
        id: 4,
        logoName: 'youtube',
        url: 'https://www.youtube.com/'
    },


]


export default function FollowUsTab() {

    const [data, setData] = useState(DATA)
    return (
        <View style={{ backgroundColor: '#fff', flex: 1, paddingTop: width * 0.05 }}>
            <FlatList
                data={data}
                keyExtractor={item => item.id}
                renderItem={({ item }) =>
                    <FollowUSComponent item={item} />
                }
            />
        </View>
    )
}

const FollowUSComponent = ({ item }) => {
    return (
        <TouchableWithoutFeedback onPress={() => {
            // alert(`${item.url}`)
            Linking.openURL(`${item.url}`)
        }} >
            <View style={Styles.card}>
                <Icon style={Styles.icons} name={item.logoName} size={120} color={'#fff'} />
            </View>
        </TouchableWithoutFeedback>
    )
}

const Styles = StyleSheet.create({
    card: {
        marginHorizontal: width * 0.05,
        marginBottom: width * 0.05,
        paddingVertical: height / 18,
        backgroundColor: '#5C5859'

    },
    icons: {
        textAlign: 'center'
    }
})
