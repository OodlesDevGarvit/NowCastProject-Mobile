import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import ThemeConstant from '../constant/ThemeConstant';
import { heightPixel, Percentage, pixelSizeHorizontal, pixelSizeVertical } from '../constant/Theme';
import { moderateVerticalScale } from 'react-native-size-matters';

const CustomButton = ({
  butttonText,
  onPress,
  inputStyle,
  btnTextStyle,
  ...props
}) => (
  <>
    <TouchableOpacity
      style={{
        ...styles.buttonStyle,
        ...inputStyle,
      }}
      activeOpacity={0.5}
      onPress={onPress}
      {...props}
    >
      <Text style={{ ...styles.buttonTextStyle, ...btnTextStyle }}>
        {butttonText}
      </Text>
    </TouchableOpacity>
  </>
);

export default CustomButton;

const styles = StyleSheet.create({
  buttonStyle: {
    backgroundColor: ThemeConstant.THEME_MAIN_COLOR,
    borderWidth: Percentage(0),
    color: ThemeConstant.ICON_COLOR,
    borderColor: ThemeConstant.BORDER_COLOR_BUTTON,
    height: moderateVerticalScale(40),
    alignItems: 'center',
    borderRadius: Percentage(5),
    justifyContent: 'center',
    marginBottom: pixelSizeVertical(25),
  },
  buttonTextStyle: {
    color: ThemeConstant.ICON_COLOR,
    lineHeight: Percentage(18),
    letterSpacing: 1.25,
    fontSize: Percentage(16),
  },
});
