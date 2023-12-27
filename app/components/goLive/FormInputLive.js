import React from 'react';
import { StyleSheet, TextInput, View, Text } from 'react-native';
import ThemeConstant from '../../constant/ThemeConstant';
import { moderateScale, moderateVerticalScale, scale } from 'react-native-size-matters';

const FormInputLive = ({
    returnKeyType,
    title,
    placeholder,
    onBlur,
    onChangeText,
    ref,
    theme,
    onSubmitEditing,
    disabled,
    defaultValue,
    value,
    ...props
}) => {

    return (
        <>
            {
                title &&
                <Text style={{
                    color: '#d3d3d3',
                    marginBottom: moderateVerticalScale(4)
                }}>{title}</Text>
            }
            <View style={styles.SectionStyle}>
                <TextInput
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    onChange={onChangeText}
                    onBlur={onBlur}
                    style={{
                        ...styles.inputStyle,
                        ...props?.inputStyle,
                    }}
                    placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
                    ref={ref}
                    onSubmitEditing={onSubmitEditing}
                    blurOnSubmit={false}
                    underlineColorAndroid="#f000"
                    returnKeyType="next"
                    value={value}
                    defaultValue={defaultValue}
                    editable={!disabled}
                    {...props}
                />
            </View>
        </>

    );
};

export default FormInputLive;

const styles = StyleSheet.create({
    inputStyle: {
        flex: 1,
        paddingLeft: moderateScale(15),
        borderRadius: 10,
        // borderBottomWidth: scale(1),
        // borderBottomColor: '#dadae8',
        backgroundColor: 'rgba(26,26,29,0.5)',
        fontSize: scale(15),
        color: '#d3d3d3',
        paddingRight: moderateScale(15),
    },
    SectionStyle: {
        height: moderateScale(40),
        position: 'relative',
        justifyContent: 'center',
    },
});
