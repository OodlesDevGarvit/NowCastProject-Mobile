import React from 'react';
import { StyleSheet, TextInput, View, Text } from 'react-native';
import ThemeConstant,{DynamicThemeConstants} from '../constant/ThemeConstant';
import {
  moderateScale,
  moderateVerticalScale,
  scale,
} from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Feather';
import { TouchableOpacity } from 'react-native-gesture-handler';
const FormInput = ({
  returnKeyType,
  keyboardType,
  name,
  placeholder,
  errorValue,
  onBlur,
  onChangeText,
  inputRef,
  theme,
  secureTextEntry,
  onSubmitEditing,
  value,
  error,
  editable = true,
  required = false,
  ...props
}) => {
  const [passwordVisible, togglePasswordVisible] = React.useState(false);

  const toggleVisibility = () => {
    togglePasswordVisible(!passwordVisible);
  };

  return (
    <>
      {
        name &&
        (
          <View style={{ ...styles.inputTopTextView, ...props.textViewstyle }}>
        <Text
          style={{
            ...styles.inputTopText,...props.topTextstyle,
            // color: ThemeConstant.TEXT_COLOR,
          }}
        >
          {name}
        </Text>
        {required == true && <Text style={{ color: 'red' }}>{' '}*</Text>}
      </View>
        )
      }
      <View style={styles.SectionStyle}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          onChange={onChangeText}
          onBlur={onBlur}
          style={{
            ...styles.inputStyle,
            backgroundColor: editable==false
            ? DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_BODY
            : '#ffff',
            borderColor: error ? "red" :
              editable == false
            ? DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_BODY
            : '#dadae8',
            ...props?.inputStyle,
            color: editable
              ? ThemeConstant.TEXT_COLOR
              : ThemeConstant.TEXT_COLOR_SUBTEXTS,
            paddingRight:
              props.type == 'password' ? moderateScale(35) : moderateScale(15),
          }}
          placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={false}
          secureTextEntry={passwordVisible ? false : secureTextEntry}
          underlineColorAndroid="#f000"
          returnKeyType="next"
          editable={editable}
          {...props}
        />
        {props.type == 'password' ? (
          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={toggleVisibility}>
              <Icon
                name={passwordVisible ? 'eye' : 'eye-off'}
                color={'#000'}
                size={22}
              />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
      {
        error && <Text style={styles.errorText}>{error}</Text>
      }

    </>
  );
};

export default FormInput;

const styles = StyleSheet.create({
  inputStyle: {
    flex: 1,
    color: '#000',
    paddingLeft: moderateScale(15),
    borderWidth: scale(1),
    borderRadius: scale(5),
    borderWidth: scale(1)
  },
  SectionStyle: {
    height: moderateScale(40),
    position: 'relative',
    justifyContent: 'center',
  },
  inputTopText: {
    color: '#656565',
    color: ThemeConstant.TEXT_COLOR,
  },
  inputTopTextView: {
    marginTop: moderateVerticalScale(20),
    marginBottom: moderateVerticalScale(5),
    flexDirection: 'row',
  },
  iconContainer: {
    position: 'absolute',
    right: moderateScale(10),
    zIndex: 2,
  },
  errorText: {
    color: 'red',
    fontSize: scale(10)
  }
});
