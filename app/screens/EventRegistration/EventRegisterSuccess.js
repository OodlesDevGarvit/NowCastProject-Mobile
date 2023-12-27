import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  BackHandler,
  SafeAreaView,
} from "react-native";
import CircleIcon from "react-native-vector-icons/FontAwesome";
import {
  moderateVerticalScale,
} from 'react-native-size-matters';
import CustomButton from '../../components/CustomButton';
import ThemeConstant from '../../constant/ThemeConstant';
import { getTextAccordingToBrandColor } from '../../utils/getIntensityOfBrandColor';
import { useSelector } from "react-redux";
import { useLayoutEffect } from 'react';
import {
  Percentage,
} from '../../constant/Theme';

export default function RegisterSuccess({ navigation, route }) {
  const { brandColor, mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
  const { firstName, eventTitle } = route.params;
  const [dynamicTextColor, setDynamicTextColor] = useState('');
  useLayoutEffect(() => {
    let textColor = getTextAccordingToBrandColor(brandColor);
    setDynamicTextColor(textColor);
  }, []);
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={Styles.innerContainer}>
      <StatusBar
        animated={true}
        backgroundColor={brandColor} />
      <View style={{ ...Styles.regContainer, backgroundColor: brandColor }}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <CircleIcon
            name="check-circle"
            size={70}
            color={'green'}
            style={{ marginTop: 0 }}
          />
        </View>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 50,
          }}
        >
          <Text style={{ ...Styles.successTextStyle, color: dynamicTextColor }}>Thank you {firstName}!</Text>
          <Text style={{ color: dynamicTextColor, marginTop: 10, fontSize: 16 }}>
            You are successfully registered for:
          </Text>
          <Text style={{ color: dynamicTextColor, fontSize: 16, marginTop: 5, fontWeight: "700" }} >
            {eventTitle}
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <CustomButton
            onPress={() => {
              navigation.goBack();
            }}
            butttonText={'Go Back'}
            inputStyle={{
              marginTop: moderateVerticalScale(30),
              backgroundColor: 'gray',
              marginTop: 150,
              width: 100,
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}


const Styles = StyleSheet.create({

  innerContainer: {
    backgroundColor: '#fff',
    flex: 1,
  },
  regContainer: {
    flex: 1,
  },
  successTextStyle: {
    color: ThemeConstant.TEXT_COLOR_WHITE,
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: Percentage(20),
  },


})

