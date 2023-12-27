import { StyleSheet, Text, View, TouchableWithoutFeedback, Image } from 'react-native'
import React from 'react'
import ThemeConstant from '../../constant/ThemeConstant'
import format from 'date-fns/format';
import { parseISO } from 'date-fns/esm';
import { useSelector } from 'react-redux';
import FastImage from 'react-native-fast-image';
import * as API from '../../constant/APIs';

const ListItem = ({ onPress, item }) => {
    const { mobileTheme: theme, brandColor } = useSelector(state => state.brandingReducer.brandingData)
    return (
        <TouchableWithoutFeedback
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.card}>
                <View style={{
                    borderRadius: 10,
                    overflow: 'hidden',
                    backgroundColor: item.squareArtwork?.document?.imageColur ? item.squareArtwork?.document?.imageColur : ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR
                }}
                >
                    <FastImage
                        style={{
                            ...styles.image,
                            aspectRatio: 1 / 1,
                        }}
                        source={{
                            uri: `${API.IMAGE_LOAD_URL}/${item.squareArtwork?.document?.id}`
                        }}
                    />
                </View>

                <View style={{ ...styles.details }}>
                    <Text numberOfLines={1} style={[styles.title, { color: theme == 'DARK' ? '#fff' : 'rgba(0,0,0,0.75)' }]}>
                        {item.title}
                    </Text>
                    <Text numberOfLines={1} style={[styles.description, { color: theme == 'DARK' ? '#fff' : 'rgba(0,0,0,0.5)' }]}>
                        {item?.mediaSeriesTitle}{item?.mediaSeriesTitle ? " • " : ""}{format(parseISO(item?.createdDate), `MMM${' '}dd${' '}yyyy`)}
                    </Text>
                </View>
            </View>
        </TouchableWithoutFeedback >
    )
}

export default ListItem

const styles = StyleSheet.create({
    card: {
        height: 90,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        paddingVertical: 5,
        borderBottomWidth: 1.4,
        borderBottomColor: '#f7f8fa',
    },
    image: {
        height: '100%',
        alignItems: 'center',
        alignSelf: 'center',
    },
    createDate: {
        fontSize: 15,
        fontFamily: ThemeConstant.FONT_FAMILY,
        color: 'black',
        fontWeight: 'bold',
        width: '100%',
        textAlign: 'center',
        paddingRight: 5,
    },
    title: {
        fontWeight: 'bold',
        fontSize: ThemeConstant.TEXT_SIZE_LARGE,
        color: 'rgba(0,0,0,0.75)',
        fontFamily: ThemeConstant.FONT_FAMILY,
        textTransform: 'capitalize',
    },
    description: {
        color: 'rgba(0,0,0,0.5)',
        fontSize: 14,
        fontFamily: ThemeConstant.FONT_FAMILY,
        textTransform: 'capitalize',
        marginTop: 3,
    },
    details: {
        flex: 1,
        marginLeft: 15,
    }
})