import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react';
import Cross from 'react-native-vector-icons/Entypo'
import { moderateScale, moderateVerticalScale } from 'react-native-size-matters';

const CloseModal = ({ onPress }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.closeButtonContainer}>
                <Cross name={"cross"} color={"#000"} size={22} />
            </View>
        </TouchableOpacity>
    )
}

export default CloseModal;

const styles = StyleSheet.create({
    closeButtonContainer: {
        width: moderateScale(25),
        height: moderateVerticalScale(25),
        justifyContent: 'center',
        alignItems: 'center',
    }
})