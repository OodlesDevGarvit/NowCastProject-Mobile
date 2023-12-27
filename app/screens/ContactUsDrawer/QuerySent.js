import React, { useState, createRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';
import * as API from '../../constant/APIs';
import ThemeConstant, {
  DynamicThemeConstants,
} from '../../constant/ThemeConstant';
import CustomButton from '../../components/CustomButton';
import { heightPixel, Percentage, pixelSizeHorizontal, pixelSizeVertical } from '../../constant/Theme';
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  verticalScale,
} from 'react-native-size-matters';
import { useSelector } from 'react-redux';
import { CachedImg } from '../../components';



const QuerySent = (props) => {

  const brandingData = useSelector((state) => state.brandingReducer);
  const {
    shortAppTitle: appName,
    mobileTheme: theme,
    logoId,
    brandColor,
  } = brandingData.brandingData;


  return (
    <View style={{ ...styles.regContainer, backgroundColor: brandColor, alignItems: "center" }}>
      <CachedImg imgStyle={styles.logoStyle} uri={`${API.IMAGE_LOAD_URL}/${logoId}`} />
      <Text style={styles.successTextStyle}>Message Sent Successfully</Text>
      <View>
        <CustomButton
          onPress={() =>
            props.navigation.goBack()

          }
          butttonText={'Go Back'}
          inputStyle={{
            marginTop: moderateVerticalScale(24),
            backgroundColor: "gray",
            width: moderateScale(110),
            height: 40,
            marginHorizontal: moderateScale(50)
          }}
        />
      </View>

    </View>
  );
}
export default QuerySent;

const styles = StyleSheet.create({
  container: { flex: 1 },
  regContainer: {
    flex: 1,
    backgroundColor: ThemeConstant.PRIMARY_COLOR,
    justifyContent: 'center',
  },
  sectionStyle: {
    borderRadius: pixelSizeHorizontal(5),
    margin: pixelSizeHorizontal(10),
    backgroundColor: ThemeConstant.BACKGROUND_COLOR,
    paddingHorizontal: moderateScale(24),

  },
  regLogo: {
    height: heightPixel(150),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  logoStyle: {
    width: '80%',
    height: heightPixel(130),
    resizeMode: 'contain',
    margin: pixelSizeHorizontal(10),
  },
  mainContainer: { alignItems: 'center' },
  imageStyle: {
    width: '100%',
    height: heightPixel(150),
    resizeMode: 'contain',
    margin: pixelSizeHorizontal(10),
  },
  wrongInput: {
    borderColor: ThemeConstant.ERROR_COLOR,
  },
  errorTextStyle: {
    color: ThemeConstant.ERROR_COLOR,
    textAlign: 'center',
    fontSize: Percentage(14),
  },

  successTextStyle: {
    color: ThemeConstant.TEXT_COLOR_WHITE,
    textAlign: 'center',
    fontSize: Percentage(18),
    padding: pixelSizeHorizontal(30),
  },
  registerTextStyle: {
    color: ThemeConstant.TEXT_COLOR_LIGHT,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: Percentage(14),
    alignSelf: 'center',
    padding: pixelSizeHorizontal(10),
  },
  backArrow: {
    position: 'absolute',
    top: 10,
    left: 0,
    width: 40,
    height: 30,
  },
});

