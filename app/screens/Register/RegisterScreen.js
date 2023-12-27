import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Keyboard,
  BackHandler,
  Alert,
  StatusBar,
  Text
} from 'react-native';
import * as API_CONSTANT from '../../constant/ApiConstant';
import * as API from '../../constant/APIs';
import * as authAction from '../../store/actions/authAction';
import { signup } from '../../constant/APIs';
import Loader from '../../components/Loader';
import { axiosInstance1, NOWCAST_URL } from '../../constant/Auth';
import ThemeConstant from '../../constant/ThemeConstant';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomButton from '../../components/CustomButton';
import FormInput from '../../components/FormInput';
import StringConstant from '../../constant/StringConstant';
import { heightPixel, Percentage, pixelSizeHorizontal, pixelSizeVertical } from '../../constant/Theme';
import {
  moderateScale,
  moderateVerticalScale,
} from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { CachedImg } from '../../components';
import { getTextAccordingToBrandColor } from '../../utils/getIntensityOfBrandColor';
import { SET_ALERT } from '../../store/actions/types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import { OpenUrl } from '../../services/TabDesignsService';

const RegisterScreen = ({ navigation, route }) => {
  const dispatch = useDispatch()


  const fromItem = route.params?.fromItem;
  const fromIOSItem = route?.params?.fromIOSItem;
  const fromEbookItem = route.params?.fromEbookItem;
  const fromMusicItem = route.params?.fromMusicItem;
  const fromAlbum = route.params?.fromAlbum;
  const fromLink = route.params?.fromLink;
  const linkAccessRequired = route.params?.linkAccessRequired;
  const linkPaid = route.params?.linkPaid;
  const rssAccessRequired = route.params?.rssAccessRequired
  const rssPaid = route.params?.rssPaid
  const fromLinkOTP = route.params?.fromLinkOTP;
  const fromRssOTP = route.params?.fromRssOTP
  const fromEbookOTP = route.params?.fromEbookOTP;
  const fromAlbumOTP = route.params?.fromAlbumOTP;
  const fromMediaOTP = route.params?.fromMediaOTP;
  const fromMusicOTP = route.params?.fromMusicOTP;

  const { itemId, price, type } = route.params
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const { isAuthenticated, userId, token } = useSelector(state => state.authReducer);
  const brandingData = useSelector((state) => state.brandingReducer);
  const { logoId, brandColor } = brandingData.brandingData;
  const [fullName, setFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errortext, setErrortext] = useState('');
  const [phone, setPhone] = useState('');
  const [isRegistraionSuccess, setIsRegistraionSuccess] = useState(false);
  const [dynamicTextColor, setDynamicTextColor] = React.useState('');
  const [checkboxName, setCheckboxnName] = useState('checkbox-blank-outline')
  const [checkboxColor,setCheckboxColor] = useState(dynamicTextColor)
  const nameInputRef = useRef();
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const confirmPasswordInputRef = useRef();
  const phoneNumberRef = useRef();

  useLayoutEffect(() => {
    let textColor = getTextAccordingToBrandColor(brandColor);
    setDynamicTextColor(textColor);
  }, []);

  //on hardware button press -
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', _backHandler);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', _backHandler);
    };
  }, []);

  function _backHandler() {
    navigation.goBack();
    return true;
  }

  useEffect(async () => {
    if (Platform.OS == 'android' && isAuthenticated) {
      if (fromItem) {
        await navigation.navigate('MediaItem');
      } else if (fromEbookItem) {
        await navigation.navigate('EbookItem');
      } else if (fromMusicItem) {
        await navigation.navigate('AudioPlayer');
      } else if (fromAlbum) {
        await navigation.navigate('AlbumDetail')
      }
      else if (fromEbookOTP || fromAlbumOTP || fromMediaOTP || fromMusicOTP || fromLinkOTP || fromRssOTP) {
        console.log('login success else if');
        getOtpStatus();
      }
      else if (linkAccessRequired || linkPaid) {
        navigation.replace('LinkItem', {
          itemId: itemId ? itemId : null,
          // fromLogin: true 
        })
      }
      else if (rssAccessRequired || rssPaid) {
        navigation.replace('RssFeedItem', {
          itemId: itemId ? itemId : null
        })
      }
      else {
        await navigation.replace('DrawerNavigator');
      }
    } else if (Platform.OS == 'ios' && isAuthenticated) {
      if (fromIOSItem == true) {
        navigation.goBack()
      } else {
        navigation.replace('DrawerNavigator');
      }
    }
  }, [isAuthenticated])

  //added to check if the both passwords match--------------
  useEffect(() => {
    if (userPassword == confirmPassword) {
      setErrortext('');
    }
  }, [userPassword, confirmPassword]);

  //CALLED ON SUBMIT BUTTON PRESS-
  const handleSubmitButton = () => {
    setErrortext('');
    if (!fullName) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter your name',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
      return;
    }
    if (!userEmail) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter your email',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
      return;
    }
    if (
      !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        userEmail
      )
    ) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter a valid email',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
      return;
    }
    if (!userPassword) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter password',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
      return;
    }
    if (userPassword.length < 6) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Password cannot be less than 6 characters',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
      return;
    }
    if (userPassword !== confirmPassword) {
      setErrortext('Passwords do not match');
      return;
    }
    if (!phone) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter Phone',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
      return;
    }
    if (!/(^\d{5,15}$)|(^\d{5}-\d{4}$)/.test(phone)) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter a valid Phone',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
      return;
    }
    if (checkboxName == 'checkbox-blank-outline') {
      setCheckboxColor('red')
      return;
    }else{
      setLoading(true);
      submitData();
    }
    //called to post the data to api---
 
  };

  //CALLED WHEN ALL INPUTS AND ALL VALIDATIONS ARE VERUFIED----
  const submitData = async () => {
    let [firstName, ...lastName] = fullName.split(' ');
    lastName = lastName.join(' ');
    const data = JSON.stringify({
      basicInfo: {
        email: userEmail,
        firstName: firstName,
        lastName: lastName == '' ? '' : lastName,
        mobileNumber: phone,
        organizationId: orgId,
        role: ['user'],
        sourceType: 'MOBILE'
      },
      sourceType:'MOBILE',
      password: userPassword,
      isTermAndCondition: checkboxName == 'checkbox-marked' ? true : false

    });
    console.log('this is data>>>>', data)
    try {
      const res = await axiosInstance1.post(`${API.userRegister}?organizationId=${orgId}`, data)
      console.log('resposne ', res);
      setLoading(false)
      await dispatch(authAction.loginUser(userEmail, userPassword));
      // await navigation.replace('DrawerNavigator');
    } catch (error) {
      console.log('error is', error);
      if (error.message == 'Request failed with status code 409') {
        showConfirmDialog();
        setErrortext('Email has already been used, please login');
      }
      setLoading(false)
    }


    //     .then((response) => {
    //     alert('hi')
    //     console.log(response, 'user signup new api');
    //     setLoading(false);
    //     setIsRegistraionSuccess(true);
    //   })
    // .catch((error) => {
    //   if (error.message == 'Request failed with status code 409') {
    //     showConfirmDialog();
    //     // setErrortext('Email has already been used, please login');
    //   }
    //   setLoading(false);
    // });
  };

  const getOtpStatus = () => {
    let axiosConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + `${token}`,
      },
    };
    axiosInstance1.get(`${API.otpStatus}?contentType=${type}&itemId=${itemId}&userId=${userId}`, axiosConfig)
      .then((res) => {
        console.log('response for otp ', res);
        let data = res.data.data.paymentStatus
        if (data == false) {
          console.log('code yha be ');
          if (fromLinkOTP || fromRssOTP) {
            navigation.replace('Checkout', {
              price: price ? price : null,
              fromLinkOTP: fromLinkOTP ? true : false,
              fromRssOTP: fromRssOTP ? true : false,
              itemId: itemId
            })
          } else {
            navigation.navigate('Checkout', {
              price: price ? price : null,
              fromEbookOTP: fromEbookOTP ? true : false,
              fromAlbumOTP: fromAlbumOTP ? true : false,
              fromMediaOTP: fromMediaOTP ? true : false,
              fromMusicOTP: fromMusicOTP ? true : false,
              itemId: itemId
            })
          }
        } else {
          console.log('na isme h be');
          if (fromEbookOTP) {
            navigation.navigate('EbookItem');
          } else if (fromAlbumOTP) {
            navigation.navigate('AlbumDetail');
          } else if (fromMediaOTP) {
            navigation.navigate('MediaItem');
          } else if (fromMusicOTP) {
            navigation.navigate('AudioPlayer');
          }
          else if (fromLinkOTP) {
            navigation.replace('LinkItem', {
              itemId: itemId ? itemId : null,
            })
          } else if (fromRssOTP) {
            navigation.replace('RssFeedItem', {
              itemId: itemId ? itemId : null,
            })
          }
        }

      }).catch((error) => {
        console.log('error for otp', error);
      })
  }

  //ALERT TO SHOW WHEN EMAIL IS ALREADY REGISTERED
  const showConfirmDialog = () => {
    return Alert.alert('Alert', 'This email has already been used. ', [
      {
        text: 'login',
        onPress: () => {
          navigation.navigate('LoginScreen', {
            fromItem: fromItem ? true : false,
            fromEbookItem: fromEbookItem ? true : false,
            fromMusicItem: fromMusicItem ? true : false,
            fromAlbum: fromAlbum ? true : false,
            fromLink: fromLink ? true : false,
            // fromRss: fromRss ? true : false,
            fromLinkOTP: fromLinkOTP ? true : false,
            fromEbookOTP: fromEbookOTP ? true : false,
            fromAlbumOTP: fromAlbumOTP ? true : false,
            fromMediaOTP: fromMediaOTP ? true : false,
            fromMusicOTP: fromMusicOTP ? true : false,
            linkAccessRequired: linkAccessRequired ? true : false,
            linkPaid: linkPaid ? true : false,
            rssAccessRequired: rssAccessRequired ? true : false,
            rssPaid: rssPaid ? true : false,
            itemId: itemId ? itemId : null,
            type: type ? type : null,
            price: price ? price : null

          })
        },
      },
      {
        text: 'Cancel'
      }
    ]);
  };


  return (
    <View style={{ ...styles.container, backgroundColor: brandColor }}>
      <Loader loading={loading} />
      <StatusBar
        backgroundColor={brandColor}
        hidden={false}
        translucent={false}
      />
      <KeyboardAwareScrollView enableOnAndroid={true}>
        <View style={{ alignItems: 'center', backgroundColor: brandColor }}>
          <CachedImg uri={`${API.IMAGE_LOAD_URL}/${logoId}`} imgStyle={styles.logoStyle} />
        </View>
        {errortext != '' ? (
          <View style={{ ...styles.bottomView, marginBottom: 2, marginTop: 5, height: 40, justifyContent: "center", }}>
            <Text style={{ ...styles.errorTextStyle, }}> {errortext} </Text>
          </View>
        ) : null}
        <View style={styles.sectionStyle} >
          <FormInput
            name={'Full Name'}
            // required={true}
            onChangeText={(fullName) => setFullName(fullName)}
            underlineColorAndroid={ThemeConstant.LIGHT_BLACK}
            placeholder=""
            inputRef={nameInputRef}
            placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
            autoCapitalize="sentences"
            returnKeyType="next"
            topTextstyle={{ color: dynamicTextColor }}
            maxLength={25}
            onSubmitEditing={() =>
              emailInputRef.current && emailInputRef.current.focus()
            }
            blurOnSubmit={false}
          />
          <FormInput
            name={'Email'}
            onChangeText={(UserEmail) => setUserEmail(UserEmail)}
            underlineColorAndroid={ThemeConstant.LIGHT_BLACK}
            placeholder=""
            placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
            keyboardType="email-address"
            autoCapitalize="none"
            inputRef={emailInputRef}
            returnKeyType="next"
            topTextstyle={{ color: dynamicTextColor }}
            onSubmitEditing={() =>
              passwordInputRef.current && passwordInputRef.current.focus()
            }
            blurOnSubmit={false}
          />
          <FormInput
            name={StringConstant.PASSWORD}
            onChangeText={(UserPassword) => setUserPassword(UserPassword)}
            placeholder=""
            placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
            keyboardType="default"
            inputRef={passwordInputRef}
            maxLength={18}
            onSubmitEditing={Keyboard.dismiss}
            blurOnSubmit={false}
            secureTextEntry={true}
            underlineColorAndroid={ThemeConstant.LIGHT_BLACK}
            returnKeyType="next"
            type="password"
            topTextstyle={{ color: dynamicTextColor }}
          />
          <FormInput
            theme={'DARK'}
            name={'Confirm Password'}
            onChangeText={(confirmPassword) =>
              setConfirmPassword(confirmPassword)
            }
            underlineColorAndroid={ThemeConstant.LIGHT_BLACK}
            placeholder=""
            placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
            autoCapitalize="sentences"
            inputRef={confirmPasswordInputRef}
            maxLength={18}
            secureTextEntry={true}
            returnKeyType="next"
            onSubmitEditing={Keyboard.dismiss}
            blurOnSubmit={false}
            type="password"
            topTextstyle={{ color: dynamicTextColor }}
          />
          <FormInput
            name={'Phone'}
            onChangeText={(phoneNo) => setPhone(phoneNo)}
            underlineColorAndroid={ThemeConstant.LIGHT_BLACK}
            placeholder=""
            placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
            autoCapitalize="sentences"
            maxLength={15}
            inputRef={phoneNumberRef}
            secureTextEntry={false}
            returnKeyType="next"
            onSubmitEditing={Keyboard.dismiss}
            blurOnSubmit={false}
            keyboardType="phone-pad"
            topTextstyle={{ color: dynamicTextColor }}
          />
          <View style={{ ...styles.checkboxMain }}>
            <Pressable onPress={() => {
              if (checkboxName == 'checkbox-blank-outline') {
                setCheckboxnName('checkbox-marked')
              } else {
                setCheckboxnName('checkbox-blank-outline')
              }
              setCheckboxColor(dynamicTextColor)
            }}>
              <MaterialCommunityIcons
                name={checkboxName} size={24} color={checkboxColor} />
            </Pressable>
            <Text style={{ ...styles.termsText, color: dynamicTextColor }}>By clicking, you agree to our 
              <Text onPress={() => { OpenUrl(NOWCAST_URL.TermsCondition) }} style={{ ...styles.linkText, color: dynamicTextColor }} >Terms of Service</Text>
              <Text style={{ ...styles.termsText, color: dynamicTextColor }}> and </Text>
              <Text onPress={() => { OpenUrl(NOWCAST_URL.Privacy) }} style={{ ...styles.linkText, color: dynamicTextColor }}>Privacy Policy</Text>
            </Text>

          </View>



          {/* {errortext != '' ? (
            <Text style={styles.errorTextStyle}> {errortext} </Text>
          ) : null} */}
          <CustomButton
            onPress={handleSubmitButton}
            butttonText={StringConstant.REGISTER}
            inputStyle={{
              borderWidth: 1,
              borderColor: '#fff',
              marginTop: moderateVerticalScale(18), backgroundColor: brandColor,
              marginBottom: moderateVerticalScale(20)
            }}
          />
          <View style={{ flexDirection: "row", justifyContent: "center", padding: 10 }}>
            <Text
              style={{
                ...styles.registerTextStyle,
                color: dynamicTextColor,
                // color:"blue"

              }}
            > Already have an Account ?
            </Text>
            <Text
              style={{
                ...styles.registerTextStyle,
                color: "blue",
                left: 8

              }}
              onPress={() => navigation.navigate('LoginScreen', {
                fromItem: fromItem ? true : false,
                fromEbookItem: fromEbookItem ? true : false,
                fromMusicItem: fromMusicItem ? true : false,
                fromAlbum: fromAlbum ? true : false,
                fromLink: fromLink ? true : false,
                // fromRss: fromRss ? true : false,
                fromLinkOTP: fromLinkOTP ? true : false,
                fromEbookOTP: fromEbookOTP ? true : false,
                fromAlbumOTP: fromAlbumOTP ? true : false,
                fromMediaOTP: fromMediaOTP ? true : false,
                fromMusicOTP: fromMusicOTP ? true : false,
                itemId: itemId ? itemId : null,
                type: type ? type : null,
                price: price ? price : null,
                linkAccessRequired: linkAccessRequired ? true : false,
                linkPaid: linkPaid ? true : false,
                rssAccessRequired: rssAccessRequired ? true : false,
                rssPaid: rssPaid ? true : false
              }
              )}
            >
              Login
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};
export default RegisterScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  regContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: "center"
  },
  sectionStyle: {
    paddingHorizontal: moderateScale(24),


  },
  regLogo: {
    height: heightPixel(150),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  logoStyle: {
    width: '90%',
    height: heightPixel(240),
    resizeMode: 'contain',
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
    fontSize: ThemeConstant.TEXT_SIZE_MEDIUM,
  },

  successTextStyle: {
    color: ThemeConstant.TEXT_COLOR_WHITE,
    textAlign: 'center',
    fontSize: Percentage(18),
    padding: pixelSizeHorizontal(30),
  },
  registerTextStyle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: Percentage(14),
    alignSelf: 'center',
  },
  bottomView: {
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: ThemeConstant.BACKGROUND_COLOR,
    paddingHorizontal: moderateScale(24),
  },
  checkboxMain: {
    marginTop: 15,
    paddingRight: moderateScale(20),
    flexDirection: 'row'
  },
  termsText: {
    fontSize: 17,
    marginLeft: 5

  },
  linkText: {
    fontSize: 17, marginLeft: 5,
    textDecorationLine: 'underline'
  }
});
