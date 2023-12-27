import { View, Text, Keyboard } from 'react-native'
import React, { useState } from 'react';
import RNModal from 'react-native-modal';
import { Modal } from '../Modal';
import { moderateScale, moderateVerticalScale, scale } from 'react-native-size-matters';
import { useSelector, useDispatch } from 'react-redux';
import CustomButton from '../CustomButton';
import { CHANGE_ENV, CHANGE_ORG } from '../../store/actions/types'
import FormInput from '../FormInput';
import { useNavigation } from '@react-navigation/native';
import { Select, CheckIcon } from "native-base";
import ThemeConstant from '../../constant/ThemeConstant';

const ENVS = [
    {
        id: 1,
        value: "DEV"
    },
    // {
    //     id: 2,
    //     value: "PROD"
    // }
]

const ChangeOrgModal = ({ isVisible = false, setIsVisible }) => {
    const { brandColor, mobileTheme: theme } = useSelector(state => state.brandingReducer.brandingData)
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { env, orgId } = useSelector(state => state.activeOrgReducer);

    // console.log('isVisible>>>', isVisible)
    const [newOrgId, setNewOrgId] = useState(orgId);
    const [newNnv, setNewEnv] = useState(env);
    return (
        <RNModal isVisible={isVisible}>
            <Modal.Container additionalStyles={{
                height: moderateVerticalScale(350),
            }}>
                <View style={{ width: '100%', paddingHorizontal: moderateScale(15) }}>
                    <Text style={{ textAlign: 'center', color: theme == 'DARK' ? '#000' : '#fff', fontWeight: 'bold', fontSize: scale(18), alignSelf: 'center', marginVertical: moderateVerticalScale(15) }}>Change organization</Text>
                    <Text style={{ color: theme == 'DARK' ? '#000' : '#fff', textAlign: 'center', fontWeight: '500', fontSize: scale(14), marginBottom: moderateVerticalScale(20) }}>This modal is just for changing organization of the app which will be only used by our testers and developer in some cases so do not raise any UI or functionlity bug here, please restart the app each time you change org </Text>
                    <FormInput value={newOrgId} onChangeText={text => setNewOrgId(text)} placeholder={"Enter new org ID"} keyboardType="default"
                        onSubmitEditing={Keyboard.dismiss} />
                    <Select style={{
                        height: moderateVerticalScale(40)
                    }} selectedValue={newNnv} minWidth="200" accessibilityLabel="Select Service" placeholder={"Select Environment"}
                        _important={{ fontSize: ThemeConstant.TEXT_SIZE_MEDIUM, paddingLeft: ThemeConstant.PADDING_TINNY, color: '#fff' }}
                        _selectedItem={{
                            bg: '#d3d3d3',
                        }}
                        mt={1} onValueChange={itemValue => setNewEnv(itemValue)}>
                        {
                            ENVS.map((item, index) => {
                                return (
                                    < Select.Item key={index} label={item.value} value={item.value} />
                                )
                            })
                        }

                    </Select>
                    <CustomButton
                        inputStyle={{ backgroundColor: '#ff0000', marginBottom: moderateVerticalScale(5), marginTop: moderateVerticalScale(10) }}
                        butttonText={'Change'}
                        onPress={() => {
                            setIsVisible(false)
                            console.log('new orgis', newOrgId)
                            dispatch({ type: CHANGE_ORG, payload: newOrgId });
                            dispatch({ type: CHANGE_ENV, payload: newNnv })
                            navigation.replace('DrawerNavigator')
                        }} />
                </View>
            </Modal.Container>
        </RNModal >
    )
}

export default ChangeOrgModal;
