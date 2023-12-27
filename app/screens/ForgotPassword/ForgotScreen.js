import React, { useState, createRef, useEffect, useLayoutEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Keyboard,
  BackHandler,
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import StringConstant from '../../constant/StringConstant';
import FormInput from '../../components/FormInput';
import Loader from '../../components/Loader';
import { forgotPassword } from '../../constant/APIs';
import { axiosInstance1 } from '../../constant/Auth';
import ThemeConstant from '../../constant/ThemeConstant';
import * as API from '../../constant/APIs';
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  verticalScale,
} from 'react-native-size-matters';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import { CachedImg } from '../../components';
import { getTextAccordingToBrandColor } from '../../utils/getIntensityOfBrandColor';
import { SET_ALERT } from '../../store/actions/types';
const ForgotScreen = ({ navigation }) => {
  const dispatch=useDispatch()
  const brandingData = useSelector((state) => state.brandingReducer);
  const {
    logoId,
    brandColor,
  } = brandingData.brandingData;
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errortext, setErrortext] = useState('');
  const [successText, setSuccessText] = useState('');
  const [dynamicTextColor, setDynamicTextColor] = React.useState('');
  const emailInputRef = createRef();
 

  useLayoutEffect(() => {
    let textColor = getTextAccordingToBrandColor(brandColor);
    setDynamicTextColor(textColor);
  }, []);

  function _backHandler() {
    navigation.goBack();
    return true;
  }
  //on hardware button press -
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', _backHandler);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', _backHandler);
    };
  }, []);

  const handleSubmitPress = () => {
    if (!userEmail) {
      dispatch({type:SET_ALERT,payload:{
        setShowAlert:true,
        data:{
       message:'Please enter your email',userEmail,
       showCancelButton:true,
       onCancelPressed:()=>{
        dispatch({type:SET_ALERT,payload:{ setShowAlert:false}})
       },
      }
      }
      })
      return false;
    } else {
      setLoading(true);
      const data = {
        username: userEmail,
      };
      axiosInstance1
        .post(`${forgotPassword}`, data)
        .then((response) => {
          setLoading(false);
          setErrortext('')
          setSuccessText('We have e-mailed your password reset link!');
          setTimeout(() => {
            navigation.goBack();
          }, 1500);
        })
        .catch((error) => {
          setErrortext('Please check your email!');
          setLoading(false);
        });
    }
  };
  return (
    <View
      style={{
        ...styles.mainBody,
        backgroundColor: brandColor,
      }}
    >
      <Loader loading={loading} />

      <KeyboardAwareScrollView>
        <View style={{ alignItems: 'center' }}>
          <CachedImg uri={`${API.IMAGE_LOAD_URL}/${logoId}`} imgStyle={styles.imageStyle} />
        </View>
        <View style={styles.bottomContainer}>
          <FormInput
            theme={'DARK'}
            name={StringConstant.EMAILADDRESS}
            onChangeText={(value) => setUserEmail(value)}
            placeholder="example@email.com"
            keyboardType="default"
            inputRef={emailInputRef}
            onSubmitEditing={Keyboard.dismiss}
            blurOnSubmit={false}
            underlineColorAndroid="#f000"
            returnKeyType="next"
            topTextstyle={{color:dynamicTextColor}}
          />
          {errortext != '' ? (
            <Text style={{...styles.errorTextStyle,color: dynamicTextColor }}> {errortext} </Text>
          ) : successText != ' ' ? (
            <Text style={{ ...styles.errorTextStyle, color: dynamicTextColor }}>
              {successText}
            </Text>
          ) : null}
          <CustomButton
            inputStyle={{ backgroundColor: brandColor,borderColor:'#fff',borderWidth:1 }}
            butttonText={StringConstant.REQUEST}
            onPress={handleSubmitPress}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};
export default ForgotScreen;

const styles = StyleSheet.create({
  mainBody: {
    flex: 1,
  },
  scrollStyle: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
  },
  imageStyle: {
    width: '90%',
    height: verticalScale(220),
    marginBottom:20,
    resizeMode: 'contain',
    marginTop: moderateVerticalScale(50),
  },
  errorTextStyle: {
    color: ThemeConstant.ERROR_COLOR,
    textAlign: 'center',
    fontSize: scale(14),
    marginVertical: moderateVerticalScale(10),
  },
  bottomContainer: {
    marginHorizontal: moderateScale(10),
    paddingHorizontal: moderateScale(24),
  },
});
