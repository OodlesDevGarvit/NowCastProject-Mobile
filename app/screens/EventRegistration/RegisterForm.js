import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Keyboard,
  ImageBackground,
  Alert,
} from 'react-native';
import * as API from '../../constant/APIs';
import Loader from '../../components/Loader';
import { axiosInstance1, NOWCAST_URL } from '../../constant/Auth';
import ThemeConstant from '../../constant/ThemeConstant';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomButton from '../../components/CustomButton';
import FormInput from '../../components/FormInput';
import StringConstant from '../../constant/StringConstant';
import {
  heightPixel,
  Percentage,
  pixelSizeHorizontal,
} from '../../constant/Theme';
import {
  moderateScale,
  moderateVerticalScale,
} from 'react-native-size-matters';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useLayoutEffect } from 'react';
import { getTextAccordingToBrandColor } from '../../utils/getIntensityOfBrandColor';
import { SET_ALERT } from '../../store/actions/types';

const RegisterForm = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const brandingData = useSelector((state) => state.brandingReducer);
  const {
    brandColor, timeZone
  } = brandingData.brandingData;

  const { userId, token, isAuthenticated, user } = useSelector(state => state.authReducer);
  const { basicInfo } = user ?? {};

  const { eventId, eventData } = route.params;
  const { color } = route.params
  const [firstName, setFirstName] = useState(basicInfo?.firstName);
  const [lastName, setLastName] = useState(basicInfo?.lastName);
  const [userEmail, setUserEmail] = useState(basicInfo?.email);
  const [phone, setPhone] = useState(basicInfo?.mobileNumber);
  const [loading, setLoading] = useState(false);
  const [errortext, setErrortext] = useState('');
  const [dynamicTextColor, setDynamicTextColor] = useState('');

  useLayoutEffect(() => {
    let textColor = getTextAccordingToBrandColor(brandColor);
    setDynamicTextColor(textColor);
  }, []);
  const dateToString = (momentInUTC, format) => {
    return moment.utc(momentInUTC).tz(timeZone).format(format);
  };

  const dateMonth = () => {
    let startedDate = eventData.startedDate + ' ' + eventData.startTime;
    let endedDate = eventData.endedDate + ' ' + eventData.endTime;

    if (
      eventData.startedDate == eventData.endedDate &&
      eventData.startTime == eventData.endTime
    ) {
      return dateToString(startedDate, 'MMMM DD, h:mm A');
    } else if (eventData.startTime != eventData.endTime) {
      return (
        dateToString(startedDate, 'MMMM DD, h:mm A') +
        ' - ' +
        dateToString(endedDate, 'h:mm A')
      );
    } else {
      // console.log("doo");
      return (
        dateToString(startedDate, 'MMMM DD, h:mm A') +
        ' - ' +
        dateToString(endedDate, 'MMMM DD, h:mm A')
      );
    }
  };

  const handleSubmitButton = () => {
    setErrortext('');
    if (!firstName) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter your first name.',
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
    if (!phone) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter phone',
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
            message: 'Please enter a valid phone',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
      return;
    }
    //Show Loader
    setLoading(true);

    //called to post the data to api---
    submitData();
  };

  // is called in handlesubmit function above----
  const submitData = async () => {
    setLoading(true);
    try {
      if (token !== null) {
        sendDataWithLogin(token);
      } else {
        sendDataWithoutLogin();
      }
    } catch (err) {
      console.log('error while getting token', err);
    }
  };

  const showConfirmDialog = () => {
    dispatch({
      type: SET_ALERT, payload: {
        setShowAlert: true,
        data: {
          message: 'This Email is already registered',
          showCancelButton: true,
          onCancelPressed: () => {
            dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
          },
        }
      }
    })
  };

  const sendDataWithLogin = async () => {
    // console.log('this is token',token);
    try {
      let axiosConfig = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + `${token}`,
        },
      };
      const data = {
        email: userEmail,
        firstName: firstName,
        lastName: lastName,
        mobile: phone,
        eventId: eventId,

        registrationTitle: 'title1',
        userId: userId,
      };
      // console.log('this is the data i am posting with login>>>',data)
      const res = await axiosInstance1.post(
        `${API.eventRegisteration}/${eventId}/registration`,
        data,
        axiosConfig
      );
      console.log('data sent for event regiter with login >>', res);
      setLoading(false);
      navigation.navigate('RegisterSuccess', {
        eventTitle: eventData.title,
        firstName: firstName,
      })
    } catch (err) {
      console.log('error while saving event registration data with login', err);
      if (err.message == 'Request failed with status code 400') {
        showConfirmDialog();
      }
      setLoading(false);
    }
  };

  const sendDataWithoutLogin = async () => {
    try {
      const data = {
        eventId: eventId,
        email: userEmail,
        registrationTitle: 'Title',
        id: 0,
        firstName: firstName,
        lastName: lastName,
        mobile: phone,
        userId: userId,
      };
      console.log('this data of event register withoutlogin', data);
      const res = await axiosInstance1.post(
        `${API.eventRegisteration}/${eventId}/registration`,
        data
      );
      console.log('data sent without login >>', res);
      setLoading(false);
      navigation.navigate('RegisterSuccess', {
        eventTitle: eventData.title,
        firstName: firstName,
      })
      setFirstName('')
      setLastName('')
      setUserEmail('')
      setPhone('')
    } catch (err) {
      console.log(
        'error while saving event registration data without login',
        err
      );
      if (err.message == 'Request failed with status code 400') {
        showConfirmDialog();
      }
      setLoading(false);
    }
  };


  return (
    <View style={{ ...Styles.container, backgroundColor: brandColor }}>
      <Loader loading={loading} />
      <KeyboardAwareScrollView enableOnAndroid={true}>
        <View style={{ backgroundColor: brandColor }}>
          <ImageBackground
            style={{
              ...Styles.image,
              backgroundColor: color,
            }}
            source={
              eventData.wideArtwork != null
                ? { uri: eventData.wideArtwork.document.newImage }
                : null
            }
          />
        </View>
        <View
          style={{
            backgroundColor: brandColor,
            marginBottom: moderateVerticalScale(50),
          }}
        >
          <>
            <View
              style={{
                width: '95%',
                alignSelf: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  ...Styles.descriptionTitle,
                  color: dynamicTextColor,
                }}
              >
                {eventData.title}
              </Text>
              <Text
                style={{
                  ...Styles.descriptionSubTitle,
                  color: dynamicTextColor,
                }}
              >
                {eventData.subTitle}
              </Text>
              <Text
                style={{
                  color: dynamicTextColor,
                  opacity: 0.7,
                }}
              >
                {dateMonth()}
              </Text>
            </View>
          </>
        </View>

        <View style={Styles.sectionStyle}>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              marginTop: 20,
              marginBottom: -10,
            }}
          >
            Fill form to register
          </Text>

          <View>
            <FormInput
              name={'First Name'}
              required={true}
              editable={isAuthenticated ? false : true}
              onChangeText={(firstName) => setFirstName(firstName)}
              value={firstName}
              underlineColorAndroid={ThemeConstant.LIGHT_BLACK}
              placeholder=""
              placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
              autoCapitalize="sentences"
              returnKeyType="next"
              blurOnSubmit={false}
            />

            <FormInput
              name={'Last Name'}
              editable={isAuthenticated ? false : true}
              onChangeText={(lastName) => setLastName(lastName)}
              value={lastName}
              underlineColorAndroid={ThemeConstant.LIGHT_BLACK}
              placeholder=""
              placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
              returnKeyType="next"
              blurOnSubmit={false}
            />

            <FormInput
              name={'Email'}
              required={true}
              editable={isAuthenticated ? false : true}
              onChangeText={(userEmail) => setUserEmail(userEmail)}
              value={userEmail}
              underlineColorAndroid={ThemeConstant.LIGHT_BLACK}
              placeholder=""
              placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
              keyboardType="email-address"
              returnKeyType="next"
              blurOnSubmit={false}
            />

            <FormInput
              name={'Phone'}
              required={true}
              editable={isAuthenticated ? false : true}
              onChangeText={(phoneNo) => setPhone(phoneNo)}
              value={phone}
              underlineColorAndroid={ThemeConstant.LIGHT_BLACK}
              placeholder=""
              placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
              autoCapitalize="sentences"
              maxLength={15}
              secureTextEntry={false}
              returnKeyType="next"
              onSubmitEditing={Keyboard.dismiss}
              blurOnSubmit={false}
              keyboardType="phone-pad"
            />
          </View>

          {errortext != '' ? (
            <Text style={Styles.errorTextStyle}> {errortext} </Text>
          ) : null}
          <CustomButton
            onPress={handleSubmitButton}
            butttonText={StringConstant.REGISTER}
            inputStyle={{
              marginTop: moderateVerticalScale(24),
              backgroundColor: brandColor,
            }}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};
export default RegisterForm;

const Styles = StyleSheet.create({
  container: { flex: 1 },
  regContainer: {
    flex: 1,
  },
  sectionStyle: {
    borderRadius: pixelSizeHorizontal(5),
    margin: pixelSizeHorizontal(10),
    backgroundColor: ThemeConstant.BACKGROUND_COLOR,
    paddingHorizontal: moderateScale(24),
    marginTop: -38,
  },
  regLogo: {
    height: heightPixel(150),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  logoStyle: {
    width: '40%',
    height: heightPixel(130),
    resizeMode: 'contain',
    margin: pixelSizeHorizontal(10),
  },
  mainContainer: { alignItems: 'center' },
  imageStyle: {
    width: '40%',
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
    // textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: Percentage(20),
    // padding: pixelSizeHorizontal(30),
  },
  textShownOnThankyou: {
    marginLeft: 15,
    fontSize: Percentage(15),
  },
  registerTextStyle: {
    color: ThemeConstant.TEXT_COLOR_LIGHT,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: Percentage(14),
    alignSelf: 'center',
    padding: pixelSizeHorizontal(10),
  },

  card: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    height: 90,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    backgroundColor: '#fff',
  },
  imageBackground: {
    height: undefined,
    width: '100%',
  },
  image: {
    // marginHorizontal: 10,

    marginTop: 2,
    width: '100%',
    aspectRatio: 1920 / 1080,
  },
  titleView: {
    width: 50,
    height: 50,
    borderRadius: 5,
    alignSelf: 'flex-end',
    backgroundColor: '#000',
    opacity: 0.7,
    justifyContent: 'space-evenly',
    position: 'absolute', //Here is the trick
    bottom: 0,
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 12,
    color: ThemeConstant.TEXT_COLOR_WHITE,
    fontFamily: ThemeConstant.FONT_FAMILY,
  },
  title2: {
    fontWeight: '700',
    fontSize: 25,
    color: ThemeConstant.TEXT_COLOR_WHITE,
    fontFamily: ThemeConstant.FONT_FAMILY,
  },

  descriptionTitle: {
    fontSize: 20,
    fontFamily: ThemeConstant.FONT_FAMILY,
    fontWeight: 'bold',
    paddingTop: moderateVerticalScale(10),
  },
  descriptionSubTitle: {
    fontSize: 16,
    fontFamily: ThemeConstant.FONT_FAMILY,
    opacity: 0.7
  },
  calender: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    alignContent: 'space-between',
  },
  iconStyle: {
    alignSelf: 'flex-end',
    opacity: 0.8,
    // justifyContent: 'flex-end',
    // alignItems: 'flex-end',
  },
  dateTitle: {
    fontSize: 17,
    fontFamily: ThemeConstant.FONT_FAMILY,
    opacity: 0.5,
    // borderWidth: 1,
    // borderColor: 'red',
    //left: 10,
    // lineHeight: 20,
  },
  cardTitle: {
    width: moderateScale(100),
    marginRight: moderateScale(4),
  },
  cardView: {
    backgroundColor: ThemeConstant.TEXT_COLOR_WHITE,
    minHeight: moderateVerticalScale(40),
    justifyContent: 'center',
    // alignItems:'center',
    alignSelf: 'center',
    borderRadius: 6,
    elevation: 10,
    width: '95%',
    position: 'relative',
    shadowColor: '#696969',
    marginTop: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateVerticalScale(20),
  },
  IconContainer: {
    borderWidth: 0,
    width: 120,
    height: 120,
    borderRadius: 70,
    backgroundColor: '#fff',
    alignItems: 'center',
  },

  profileHeaderLine: {
    height: 1,
    marginHorizontal: 10,
    backgroundColor: 'gray',
    marginTop: 15,
  }
});
