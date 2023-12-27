import { StyleSheet, View, Text } from 'react-native'
import React from 'react';
import RNModal from 'react-native-modal';
import { Modal } from '../Modal';
import { moderateScale, moderateVerticalScale, scale } from 'react-native-size-matters';
import { useSelector, useDispatch } from 'react-redux';
import CustomButton from '../CustomButton';
import { SET_ACCESS_MODAL_IOS } from '../../store/actions/types'
import { navigate } from '../../../App';


const IOSAccessRequiredModalComp = ({ isVisible = false, setIsVisible }) => {
    const { isVisibleAccess } = useSelector(state => state.iosCompReducer);
    const { brandColor, mobileTheme: theme } = useSelector(state => state.brandingReducer.brandingData)
    const dispatch = useDispatch();
    return (
        <RNModal isVisible={isVisible ? isVisible : isVisibleAccess}
            animationIn={'fadeIn'}
            animationOut={'fadeOutUp'}
            animationOutTiming={600}>
            <Modal.Container>
                <View style={{ width: '100%', paddingHorizontal: moderateScale(15) }}>
                    <Text style={{ textAlign: 'center', color: theme == 'DARK' ? '#000' : '#fff', fontWeight: 'bold', fontSize: scale(18), alignSelf: 'center', marginVertical: moderateVerticalScale(15) }}>Login required</Text>
                    <Text style={{ color: theme == 'DARK' ? '#000' : '#fff', textAlign: 'center', fontWeight: '500', fontSize: scale(14), marginBottom: moderateVerticalScale(20) }}>You need to login in order to access this item.</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                        <CustomButton
                            inputStyle={{ backgroundColor: brandColor, width: moderateScale(100) }}
                            butttonText={'Login'}
                            onPress={() => {
                                navigate('Auth', {
                                    screen: 'LoginScreen',
                                    params: { fromIOSItem: true },
                                });
                                if (setIsVisible) {
                                    setIsVisible(false);
                                    return;
                                }
                                dispatch({ type: SET_ACCESS_MODAL_IOS, payload: false })
                            }} />
                        <CustomButton
                            inputStyle={{ backgroundColor: brandColor, width: moderateScale(100) }}
                            butttonText={'Cancel'}
                            onPress={() => {
                                if (setIsVisible) {
                                    setIsVisible(false);
                                    return;
                                }
                                dispatch({ type: SET_ACCESS_MODAL_IOS, payload: false })
                            }} />

                    </View>

                </View>
            </Modal.Container>
        </RNModal >
    )
}

export default IOSAccessRequiredModalComp;

const styles = StyleSheet.create({})