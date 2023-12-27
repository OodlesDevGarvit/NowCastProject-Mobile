import { StyleSheet, View, Text } from 'react-native'
import React from 'react';
import RNModal from 'react-native-modal';
import { Modal } from '../Modal';
import { moderateScale, moderateVerticalScale, scale } from 'react-native-size-matters';
import { useSelector, useDispatch } from 'react-redux';
import CustomButton from '../CustomButton';
import { SET_ACCESS_MODAL_IOS } from '../../store/actions/types'
import { navigate } from '../../../App';


const AccountDeleteModal = ({ isVisible, setIsVisible, onSubmit }) => {
    const { brandColor, mobileTheme: theme } = useSelector(state => state.brandingReducer.brandingData)
    const dispatch = useDispatch();
    return (
        <RNModal isVisible={isVisible}>
            <Modal.Container additionalStyles={{
                height: moderateVerticalScale(250)
            }}>
                <View style={{ width: '100%', paddingHorizontal: moderateScale(15) }}>
                    <Text style={{ textAlign: 'center', color: theme == 'DARK' ? '#000' : '#fff', fontWeight: 'bold', fontSize: scale(18), alignSelf: 'center', marginVertical: moderateVerticalScale(15) }}>Delete Account ?</Text>
                    <Text style={{ color: theme == 'DARK' ? '#000' : '#fff', textAlign: 'center', fontWeight: '500', fontSize: scale(14), marginBottom: moderateVerticalScale(20) }}>This will initiate your account deletion process, This process may take upto 60 days.</Text>
                    <CustomButton
                        inputStyle={{ backgroundColor: 'red', marginBottom: moderateVerticalScale(5) }}
                        butttonText={'Proceed to Delete Account'}
                        onPress={onSubmit} />
                    <CustomButton
                        inputStyle={{ backgroundColor: '#d3d3d3', marginBottom: moderateVerticalScale(5) }}
                        butttonText={'Cancel'}
                        onPress={() => {
                            setIsVisible(false)
                        }} />
                </View>
            </Modal.Container>
        </RNModal >
    )
}

export default AccountDeleteModal;

const styles = StyleSheet.create({})