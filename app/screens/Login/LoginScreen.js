import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Keyboard,
  StatusBar,
  BackHandler,
  Platform
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import FormInput from '../../components/FormInput';
import Loader from '../../components/Loader';
import StringConstant from '../../constant/StringConstant';
import ThemeConstant from '../../constant/ThemeConstant';
import * as API from '../../constant/APIs';
import { CachedImg } from '../../components'
import { useSelector, useDispatch } from 'react-redux';
import * as authAction from '../../store/actions/authAction';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  verticalScale,
  moderateScale,
  moderateVerticalScale,
} from 'react-native-size-matters';
import { Percentage, pixelSizeHorizontal } from '../../constant/Theme';
import { CHANGE_ORG, SET_ALERT, UPDATE_ERROR_TEXT } from '../../store/actions/types';
import { useFocusEffect } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import { axiosInstance1 } from '../../constant/Auth';
import { getTextAccordingToBrandColor } from '../../utils/getIntensityOfBrandColor';
import ChangeOrgModal from '../../components/modal/ChangeOrg';

const DATA = {
  NAME: "change@gmail.com",
  PASS: "123456"
}

const LoginScreen = ({ route, navigation }) => {
  const isFocused = useIsFocused();
  const fromItem = route?.params?.fromItem;
  const fromIOSItem = route?.params?.fromIOSItem;
  const fromEbookItem = route?.params?.fromEbookItem;
  const fromMusicItem = route?.params?.fromMusicItem;
  const fromLink = route.params?.fromLink;
  const fromRss = route.params?.fromRss
  const fromLinkOTP = route.params?.fromLinkOTP;
  const fromRssOTP = route.params?.fromRssOTP
  const fromAlbum = route?.params?.fromAlbum;
  const fromEbookOTP = route?.params?.fromEbookOTP;
  const fromAlbumOTP = route.params?.fromAlbumOTP;
  const fromMediaOTP = route.params?.fromMediaOTP;
  const fromMusicOTP = route.params?.fromMusicOTP;
  const price = route.params?.price;
  const itemId = route.params?.itemId;
  const type = route.params?.type;
  const subscriptionPlanIds = route.params?.subscriptionPlanIds;
  const linkAccessRequired = route.params?.linkAccessRequired;
  const linkPaid = route.params?.linkPaid;
  const rssAccessRequired = route.params?.rssAccessRequired
  const rssPaid = route.params?.rssPaid

  const { errorText: errortext, isAuthenticated, userId, token } = useSelector(state => state.authReducer);

  const { logoId, brandColor } = useSelector((state) => state.brandingReducer.brandingData);

  const passwordInputRef = useRef();
  const emailRef = useRef();
  const dispatch = useDispatch();

  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dynamicTextColor, setDynamicTextColor] = React.useState('');
  const [modalVisible, setModalVisible] = useState(false);

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
  //TO SET ERROR TEXT TO NULL IF SCREEN IS BLUR
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        dispatch({ type: UPDATE_ERROR_TEXT })
      }
    }, [])
  )
  //TO NAVIGATE AFTER LOGIN IS SUCCESSFULL
  useEffect( () => {
    if (Platform.OS == 'android' && isAuthenticated == true) {
      if (fromItem) {
         navigation.navigate('MediaItem');
      } else if (fromEbookItem) {
         navigation.navigate('EbookItem');
      } else if (fromMusicItem) {
         navigation.navigate('AudioPlayer');
      } else if (fromAlbum) {
         navigation.navigate('AlbumDetail')
      }
      else if (fromEbookOTP || fromAlbumOTP || fromMediaOTP || fromMusicOTP || fromLinkOTP || fromRssOTP) {

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
         navigation.replace('DrawerNavigator');
      }
    } else if (Platform.OS == 'ios' && isAuthenticated == true) {
      if (fromIOSItem == true) {
        navigation.goBack()
      } else {
        navigation.replace('DrawerNavigator');
      }
    }
  }, [isAuthenticated])

  //handling login button click event-------------------------------
  const handleSubmitPress = async () => {
    setLoading(true);
    dispatch({ type: UPDATE_ERROR_TEXT })
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
      setLoading(false);
      return;
    }

    if (!userPassword) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter your password',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
      setLoading(false);
      return;
    }
    if (isAuthenticated) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'You are already logged in with this Id',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
      setLoading(false);
      return
    }
    await submitData();
  };

  const submitData = async () => {
    if (userEmail == DATA.NAME && userPassword == DATA.PASS) {
      setModalVisible(true)
      setLoading(false)
      return;
    }
    await dispatch(authAction.loginUser(userEmail, userPassword));
    setLoading(false)

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


  return (
    <View
      style={{
        ...styles.mainBody,
        justifyContent: "center",
        backgroundColor: brandColor,
      }}
    >
      <Loader loading={loading} />
      <StatusBar
        backgroundColor={brandColor}
        hidden={false}
        translucent={false}
      />
      <KeyboardAwareScrollView enableOnAndroid={true}>
        <View style={{ alignItems: "center" }}>
          <CachedImg imgStyle={styles.imageStyle} uri={`${API.IMAGE_LOAD_URL}/${logoId}`} />
        </View>


        {errortext && (
          <View style={{ ...styles.bottomView2, height: moderateScale(40), justifyContent: "center", }}>
            <Text style={{ ...styles.errorTextStyle, }}>{errortext}</Text>
          </View>
        )}


        <View style={styles.bottomView}>
          <FormInput
            inputRef={emailRef}
            name={StringConstant.EMAILADDRESS}
            onChangeText={(UserEmail) => setUserEmail(UserEmail)}
            value={userEmail}
            placeholder="" //dummy@abc.com
            placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() =>
              passwordInputRef.current && passwordInputRef.current.focus()
            }
            underlineColorAndroid={ThemeConstant.LIGHT_BLACK}
            blurOnSubmit={false}
            topTextstyle={{ color: dynamicTextColor }}
          />
          <FormInput
            inputRef={passwordInputRef}
            name={StringConstant.PASSWORD}
            onChangeText={(UserPassword) => setUserPassword(UserPassword)}
            value={userPassword}
            placeholder="" //12345
            placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
            keyboardType="default"
            onSubmitEditing={Keyboard.dismiss}
            blurOnSubmit={false}
            secureTextEntry={true}
            underlineColorAndroid={ThemeConstant.LIGHT_BLACK}
            returnKeyType="next"
            type="password"
            topTextstyle={{ color: dynamicTextColor }}
          />
          {/* {errortext != '' ? (
            <Text style={styles.errorTextStyle}> {errortext} </Text>
          ) : null} */}
          <Text
            onPress={() => {
              navigation.navigate('ForgotScreen')
              setUserEmail('')
              setUserPassword('')
            }
          }
            style={styles.forgot}
          >
            {StringConstant.FORGOT_YOUR_PASSWORD}
          </Text>
          <CustomButton
            inputStyle={{
              backgroundColor: brandColor,
              borderColor: '#fff',
              borderWidth: 1
            }}
            onPress={handleSubmitPress}
            butttonText={StringConstant.LOGIN}
          />
          {
            true &&
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text style={{
                ...styles.registerTextStyle,
                // color: ThemeConstant.TEXT_COLOR_SUBTEXTS,
                color: dynamicTextColor,
                marginRight: -15
              }}>New here ?</Text>
              <Text
                style={{
                  ...styles.registerTextStyle,
                  color: 'blue',
                }}
                onPress={() => {
                  setUserEmail(''); setUserPassword(''); navigation.navigate('RegisterScreen', {
                    fromItem: fromItem ? true : false,
                    fromMusicItem: fromMusicItem ? true : false,
                    fromEbookItem: fromEbookItem ? true : false,
                    fromAlbum: fromAlbum ? true : false,
                    fromLink: fromLink ? true : false,
                    fromRss: fromRss ? true : false,
                    fromEbookOTP: fromEbookOTP ? true : false,
                    fromAlbumOTP: fromAlbumOTP ? true : false,
                    fromMediaOTP: fromMediaOTP ? true : false,
                    fromMusicOTP: fromMusicOTP ? true : false,
                    fromLinkOTP: fromLinkOTP ? true : false,
                    fromRssOTP: fromRssOTP ? true : false,
                    linkAccessRequired: linkAccessRequired ? true : false,
                    linkPaid: linkPaid ? true : false,
                    rssAccessRequired: rssAccessRequired ? true : false,
                    rssPaid: rssPaid ? true : false,
                    itemId: itemId ? itemId : null,
                    type: type ? type : null,
                    price: price ? price : null


                  })
                }}
              >Register
              </Text>
            </View>
          }
        </View>
      </KeyboardAwareScrollView>
      <ChangeOrgModal isVisible={modalVisible} setIsVisible={setModalVisible} />

    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({

  mainBody: {
    flex: 1,
    // marginVertical: moderateScale(15)
  },
  imageStyle: {
    width: '90%',
    height: verticalScale(220),
    alignSelf: 'center'
  },
  bottomView2: {
    position: 'relative',
    marginHorizontal: moderateScale(24),
    borderRadius: moderateScale(5),
    backgroundColor: ThemeConstant.BACKGROUND_COLOR,
    paddingHorizontal: moderateScale(24),
    marginBottom: moderateScale(20)
  },

  bottomView: {
    paddingHorizontal: moderateScale(24),
    marginTop: moderateScale(-20),
  },
  SectionStyle: {
    flexDirection: 'row',
  },
  registerTextStyle: {
    color: ThemeConstant.DRAWER_TEXT_COLOR,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: Percentage(14),
    alignSelf: 'center',
    padding: pixelSizeHorizontal(10),
  },
  errorTextStyle: {
    color: 'red',
    textAlign: 'left',
    fontSize: ThemeConstant.TEXT_SIZE_MEDIUM,
  },
  forgot: {
    color: '#FFC210',
    fontSize: ThemeConstant.TEXT_SIZE_MEDIUM,
    alignSelf: 'flex-end',
    marginTop: moderateVerticalScale(18),
    marginBottom: moderateVerticalScale(10),
  },
});
