import { StyleSheet, Text, TouchableHighlight, TouchableWithoutFeedback, View } from 'react-native';
import React from 'react';
import { moderateScale, scale } from 'react-native-size-matters';
import { useSelector } from 'react-redux';



const AddItemButton = ({ onPress }) => {
    const { mobileTheme: theme, brandColor } = useSelector(state => state.brandingReducer.brandingData)
    return (
        <View style={[styles.container, { backgroundColor: theme == 'DARK' ? brandColor : '#fff' }]} >
            <TouchableWithoutFeedback onPress={onPress}>
                <Text style={[styles.txt, { color: theme == 'DARK' ? '#fff' : '#000' }]}>Add Livestream</Text>
            </TouchableWithoutFeedback>
        </View>
    )
}

export default AddItemButton

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: '#696969',
        justifyContent: 'center',
        alignItems: 'center',
        padding: moderateScale(6),
        borderRadius: scale(4),
        backgroundColor: '#fff'
    },
    txt: {
        fontSize: scale(12),
        color: '#000',
    }
})