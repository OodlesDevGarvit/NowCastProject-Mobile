/**
 * TO use this component as Custom Alert instead of the default OS alert ;
 * dispatch an action SET_ALERT  and in payload pass
 * {
 * setShowAlert:true/false,
 * data:{
 *      cancelText,
 *      ...etc
 *      you can see the props used in the component
 *  }
 * }
 */


import { useWindowDimensions, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AwesomeAlert from 'react-native-awesome-alerts';
import { useSelector } from 'react-redux';
import { moderateScale, scale } from 'react-native-size-matters';

const CustomAlert = () => {
    const { height, width } = useWindowDimensions();
    const { showAlert, data } = useSelector(state => state.alertReducer);
    const { brandColor, mobileTheme: theme } = useSelector(state => state.brandingReducer.brandingData);
    return (
        <AwesomeAlert
            {...data}
            show={showAlert}
            showProgress={false}
            title={data?.title || ''}
            message={data?.message || "No message"}
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            cancelText={data?.cancelText || "Close"}
            confirmText={data?.confirmText || "Confirm"}
            confirmButtonColor={brandColor}
            cancelButtonColor={data?.confirmText == null ? brandColor :  'grey'}
            // message:'Please enter your first name',
            // showCancelButton:true,
            //showConfirmButton:true
            // onCancelPressed={data?.onCancel}
            // onConfirmPressed={data?.onConfirm}
            contentContainerStyle={{ ...styles.container, width: width }}
            confirmButtonStyle={styles.btnStyle}
            cancelButtonStyle={styles.btnStyle}
            cancelButtonTextStyle={styles.btnText}
            confirmButtonTextStyle={styles.btnText}
            titleStyle={styles.titleStyle}
            messageStyle={styles.messageStyle}
        />
    )
}

export default CustomAlert

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius:15,
    },
    btnStylee: {
        width: moderateScale(90),
        height: moderateScale(40),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'pink'
    },
    btnStyle: {
        width: moderateScale(90),
        height: moderateScale(40),
        justifyContent: 'center',
        alignItems: 'center'
    },
    titleStyle: {
        fontSize: scale(20),
        // marginBottom:-5
    },
    messageStyle: {
        fontSize: scale(16),
        textAlign:'center',
        marginTop:-12
    },
    btnText: {
        fontSize: scale(13),
        fontWeight: '600'
    }
})