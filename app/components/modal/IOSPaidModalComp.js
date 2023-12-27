import { StyleSheet, View, Text } from 'react-native'
import React from 'react';
import RNModal from 'react-native-modal';
import { Modal } from '../Modal';
import { moderateScale, moderateVerticalScale, scale } from 'react-native-size-matters';
import { useSelector, useDispatch } from 'react-redux';
import CustomButton from '../CustomButton';
import { SET_IOSCOMP, SET_SUB_PLAN_IDS } from '../../store/actions/types'

const POP_UP = {
    message: "To gain access to this item, you are kindly requested to purchase a subscription plan.",
    title: "Subscribe"
}

const IOSPaidModalComp = ({ isVisible = false, setIsVisible = null, navigate, rssContent = null, linkContent = null }) => {
    const { isVisiblePaid } = useSelector(state => state.iosCompReducer);
    const { brandColor, mobileTheme: theme, } = useSelector(state => state.brandingReducer.brandingData)
    const dispatch = useDispatch();
    return (
        <RNModal
            isVisible={isVisible ? isVisible : isVisiblePaid}
            animationIn={'fadeIn'}
            animationOut={'fadeOutUp'}
            animationOutTiming={600}>
            <Modal.Container>
                <View style={{ width: '100%', paddingHorizontal: moderateScale(15) }}>
                    <Text style={{ color: theme == 'DARK' ? '#000' : '#fff', fontWeight: 'bold', fontSize: scale(18), alignSelf: 'center', marginVertical: moderateVerticalScale(15) }}>{POP_UP.title}</Text>
                    <Text style={{ color: theme == 'DARK' ? '#000' : '#fff', textAlign: 'center', fontWeight: '500', fontSize: scale(14), marginBottom: moderateVerticalScale(20) }}>{POP_UP.message}</Text>

                    <View style={styles.btnsContainer}>
                        <CustomButton
                            inputStyle={{ backgroundColor: brandColor, flex: 1, marginRight: moderateScale(10) }}
                            butttonText={'Subscribe Now'}
                            onPress={() => {
                                if (setIsVisible) {
                                    setIsVisible(false);
                                    if (rssContent) {
                                        dispatch({ type: SET_SUB_PLAN_IDS, payload: rssContent?.subscriptionPlanIds })
                                    }
                                    if (linkContent) {
                                        dispatch({ type: SET_SUB_PLAN_IDS, payload: linkContent?.subscriptionPlanIds })
                                    }
                                    navigate.replace('SubscriptionDetails', { fromItem: true })
                                    return;
                                }
                                dispatch({ type: SET_IOSCOMP, payload: false })
                                navigate('SubscriptionDetails', { fromItem: true })
                            }} />
                        <CustomButton
                            inputStyle={{ backgroundColor: 'gray', flex: 1 }}
                            butttonText={'Cancel'}
                            onPress={() => {
                                if (setIsVisible) {
                                    setIsVisible(false);
                                    return;
                                }
                                dispatch({ type: SET_IOSCOMP, payload: false })
                            }} />

                    </View>

                </View>
            </Modal.Container>
        </RNModal >
    )
}

export default IOSPaidModalComp

const styles = StyleSheet.create({
    btnsContainer: {
        flexDirection: 'row',
        paddingHorizontal: moderateScale(10),
    }
})