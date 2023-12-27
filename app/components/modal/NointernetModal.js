import React from 'react';
import { Modal, Text, View } from "react-native";
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { useSelector, useDispatch } from 'react-redux';
import CustomButton from '../CustomButton';
import { moderateScale } from 'react-native-size-matters';
import NetInfo from '@react-native-community/netinfo'
import { StatusBar } from 'native-base';

export function NoInternet() {
  const dispatch = useDispatch()
  const { brandColor, mobileTheme: theme, } = useSelector(state => state.brandingReducer.brandingData)
  const { noInternetModalVisible } = useSelector(state => state.noInternetReducer)

  return (
    <Modal
      statusBarTranslucent={true}
      visible={noInternetModalVisible}
    >
      <View style={{ flex: 1, backgroundColor: theme == 'DARK' ? '#000' : '#fff' }}>
        <StatusBar backgroundColor={brandColor} />
        <View style={{ justifyContent: "center", alignItems: 'center', marginTop: 20 }}>

          <Text style={{ color: theme == 'DARK' ? '#fff' : '#000', }}>Offline</Text>
          <View
            style={{
              marginTop: 10,
              width: '100%',
              borderBottomColor: theme == 'DARK' ? '#fff' : '#000',
              borderBottomWidth: 1,
            }}
          />
          <View style={{ justifyContent: "center", alignItems: 'center', marginTop: moderateScale(150), width: '95%' }} >
            <FontAwesome5Icon name={'bolt'} size={50} color={theme == 'DARK' ? '#fff' : '#000'} />
            <Text style={{ color: theme == 'DARK' ? '#fff' : '#000', marginTop: 20, fontSize: 25, fontWeight: 'bold' }}>No internet connection</Text>
            <Text style={{ color: theme == 'DARK' ? '#fff' : '#000', marginTop: 20, fontSize: 20, textAlign: 'center' }}>No internet connection found. Check your connection or try again.</Text>
          </View>
          <CustomButton
            inputStyle={{
              marginTop: 40,
              width: '80%',
              borderRadius: 25,
              height: '10%',
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,

            }}
            btnTextStyle={{ color: '#000', fontSize: 16 }}
            butttonText={'Try Again'}
            onPress={() => {
              NetInfo.fetch().then(state => {
                if (state.isConnected == true) {
                  dispatch({ type: SET_NOINTERNET_MODAL, payload: false })
                } else {
                  dispatch({ type: SET_NOINTERNET_MODAL, payload: true })
                }
              });

            }}
          />
        </View>
      </View>
    </Modal>
  )
}