import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  StatusBar,
  BackHandler,
  ActivityIndicator,
  Platform,
} from 'react-native';
import OptionIcon from 'react-native-vector-icons/SimpleLineIcons';
import SeekIcon from 'react-native-vector-icons/Fontisto';
import RepeatIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import ShuffleIcon from 'react-native-vector-icons/Ionicons';
// import Orientation from 'react-native-orientation';
import Orientation from 'react-native-orientation-locker';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/AntDesign';
import DeleteIcon from 'react-native-vector-icons/Ionicons';
import ShareIcon from 'react-native-vector-icons/AntDesign';
import ThemeConstant from '../../constant/ThemeConstant';
import Share from 'react-native-share';
import { useSelector, useDispatch } from 'react-redux';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { moderateVerticalScale, moderateScale, scale } from 'react-native-size-matters';
import Video from 'react-native-video';
import { useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { axiosInstance1 } from '../../constant/Auth';
import * as API from '../../constant/APIs';
import { Modal as CustomModal } from '../../components/Modal';
import { SET_IOSCOMP, SET_ACCESS_MODAL_IOS, SET_SUB_PLAN_IDS } from '../../store/actions/types';
import CustomButton from '../../components/CustomButton';
import FastImage from 'react-native-fast-image';


const AudioPlayer = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { data, image: image2, imageBgColor: imageBgColor2, musicItemId } = route.params;
  const currentTimeVideo = route.params?.currentTimeVideo;
  const fromVideo = route.params?.fromVideo;
  const fromCheckout = route.params?.fromCheckout;

  const playerRef = useRef(null);

  //getting Subdomain from branding reducer ---
  const { subdomain: subDomain, mobileTheme: theme, brandColor, organizationName: orgName, website: websiteName } = useSelector((state) => state.brandingReducer.brandingData);
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const { token, isPaymentDone, isAuthenticated, user, subscription: { id } } = useSelector(state => state.authReducer)
  const { basicInfo: { firstName, lastName, email, mobileNumber } = { firstName: null, lastName: null, mobileNumber: null } } = user ?? {};
  const [repeatMode, setRepeatMode] = useState('off');
  const [modalVisible, setModalVisible] = useState(false);
  const [MultiTime, setMultiTime] = useState(1);
  const [optionVisible, setOptionVisibility] = useState(false);
  const [resetValue, setResetValue] = useState(false);
  const [shufle, setShuffle] = useState(false);

  const [songTitle, setSongTitle] = useState(null);
  const [artist, setArtist] = useState(null);
  const [musicContent, setMusicContent] = useState(null);

  const [path, setPath] = useState(null);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);

  const [paused, setpaused] = useState(fromVideo ? false : true);
  const [duration, setduration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [image, setImage] = useState(image2);
  const [imageBgColor, setImageColor] = useState(imageBgColor2);

  //called when audio is player comes in focus 
  useFocusEffect(
    React.useCallback(() => {
      if (fromVideo == true) {
        playerRef.current.seek(currentTimeVideo);
      }
      return () => {
        setpaused(true)
      }
    }, [])
  )

  useEffect(() => {
    getData();
  }, [token, musicItemId, id, fromCheckout])

  function _backHandler() {
    if (fromVideo == true) {
      navigation.navigate('MediaItem');
      return true;
    } else {
      navigation.goBack();
      return true;
    }
  }
  //on hardware button press -
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', _backHandler);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', _backHandler);
    };
  }, []);

  useEffect(() => {
    if (path !== null) setpaused(false)
  }, [path])


  //setting the orientation---
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Orientation.lockToPortrait();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  const getData = async () => {
    // console.log('code is inside getdata function auth');
    if (isAuthenticated) {
      getItemDataWithAuth();
    } else {
      getItemDataWithoutAuth();
    }
  };

  const getItemDataWithoutAuth = async () => {
    // console.log('code is inside item with auth');
    try {
      const response = await axiosInstance1.get(
        `${API.musicWithoutAuth}/${musicItemId}/?organizationId=${orgId}`
      );
      if (response.status == 200) {
        const nameList = response.data.data;
        setMusicContent(nameList);
        setSongTitle(nameList.title);
        // setVideodateText(nameList.date);
        setArtist(nameList.artist);
        setImageAndBackground(nameList);
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      console.log('error while getting data without auth', err);
    }
  };

  const getItemDataWithAuth = async () => {
    // console.log('code is inside item without auth');

    setIsLoading(true)
    let axiosConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + `${token}`,
      },
    };
    try {
      const response = await axiosInstance1.get(`${API.music}/${musicItemId}`, axiosConfig);
      if (response.status == 200) {
        const nameList = response.data.data;
        setMusicContent(nameList);
        // console.log('data with auth>>', nameList)
        setSongTitle(nameList.title);
        setArtist(nameList.artist);
        setImageAndBackground(nameList)
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      console.log('error while getting data with auth', err);
    }
  };

  const setImageAndBackground = (data) => {
    if (image2 == undefined || imageBgColor2 == undefined) {
      console.log(data.squareArtwork.document, 'data');
      let imageUrl = `${API.IMAGE_LOAD_URL}/${data?.squareArtwork?.document?.id}?height=600&width=600`;
      console.log('new image url is >>', image)
      setImage(imageUrl);
      setImageColor(data?.squareArtwork?.document?.imageColur)
    }

  }


  function secondsToTime(time) {
    let result, hr;

    hr = (duration / 3600).toString().slice(0, 1);

    var date = new Date(null);
    date.setSeconds(time); // specify value for SECONDS here
    if (hr > 0) {
      result = date.toISOString().slice(11, 19);
    } else {
      result = date.toISOString().slice(14, 19);
    }
    return result;
  }

  const multiSpeed = (count) => {
    setResetValue(true);
    return setMultiTime(count);

    // return TrackPlayer.setRate(a);
  };

  const reset = () => {
    setMultiTime(1);
    setResetValue(false);
  };

  //switching to video player------
  const _handleSwitchToVideo = () => {
    // console.log('data in handle switch to video', data);
    navigation.replace('VideoPlayer', {
      data: data,
      currentTimeAudio: currentTime,
    });
  };

  //called on press of share button---------------------------------
  const shareVideo = () => {
    //called on press of share button---------------------------------
    const shareOptions = {
      message: `${data.title}\nhttps://${subDomain}/video/${data.id}`,
    };

    try {
      const ShareResponse = Share.open(shareOptions);
      // console.log('share response is  :>> ', ShareResponse);
    } catch (error) {
      // console.log('Error =====>', error);
    }
  };

  /**
   * 
   * This section contains all the controls of the audio player
   */

  const _handleOnLoad = (meta) => {
    if (fromVideo) setIsLoading(false);
    if (meta.duration > 0) setduration(meta.duration);
  };

  const _handleOnProgress = (progress) => {
    console.log('duration >>', duration)

    setCurrentTime(Math.floor(progress.currentTime));
    if (duration > 0) {
      setProgress(Math.floor(progress.currentTime) / duration);
    }

  };

  const _handleGetAccessButton = async () => {
    await setAlertModalVisible(false);
    await setButtonPressed(false);
    setTimeout(() => {
      navigation.navigate('SubscriptionDetails', {
        fromMusicItem: true,
        subscriptionPlanIds: musicContent?.subscriptionPlanIds,
      });
    }, 400);

  };
  const _handleLogin = async () => {
    await setAlertModalVisible(false);
    await setButtonPressed(false)
    setTimeout(() => {
      navigation.navigate('Auth', {
        screen: 'LoginScreen',
        params: { fromMusicItem: true, itemId: musicItemId, },
      });
    }, 400);

  };
  const _signUpButton = async () => {
    await setAlertModalVisible(false);
    await setButtonPressed(false);
    setTimeout(() => {
      navigation.navigate('Auth', {
        screen: 'RegisterScreen',
        params: { fromMusicItem: true, itemId: musicItemId },
      });
    }, 400);

  };

  function Alertmodal() {
    return (
      <CustomModal
        style={{ flex: 1 }}
        isVisible={alertModalVisible}
        onRequestClose={() => {
          setAlertModalVisible(false);
          setButtonPressed(false)
        }}
      >
        {
          musicContent?.isOneTimePurchase == true && musicContent?.subscriptionPlanIds.length == 0 && musicContent?.musicAccessType !== 'ACCESSREQUIRED' &&
          (
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'center' }}
              activeOpacity={1}
              onPress={() => {
                setAlertModalVisible(false);
                setButtonPressed(false)
              }}
            >
              <CustomModal.Container additionalStyles={{ height: 270 }}>
                {token !== null ?

                  //one time payment modal with login on platform basis-------------------------
                  Platform.OS == 'ios' ?
                    (
                      <CustomModal.Body>
                        <View style={{ width: '100%', height: '100%' }}>
                          <Text
                            style={{
                              // ...styles.textColorWhite,
                              color:
                                theme == 'DARK'
                                  ? 'black'
                                  : 'white',
                              fontSize: scale(16),
                              fontWeight: '600',
                              textAlign: 'center',
                            }}
                          >
                            You must be a {orgName} one time paid subscriber to listen this music,pay by downloading{' '}
                            {orgName} android mobile app or visit our website{' '}

                          </Text>
                          <Text style={{
                            color: "yellow",
                            fontWeight: '600',
                            fontSize: scale(16),
                            textAlign: 'center',
                          }}>
                            {websiteName}
                          </Text>
                        </View>
                      </CustomModal.Body>
                    )
                    :
                    (
                      <CustomModal.Body>
                        <View style={{ width: '100%', height: '65%' }}>
                          <Text
                            style={{
                              ...styles.textColorWhite,
                              color:
                                theme == 'DARK'
                                  ? 'black'
                                  : 'white',
                              fontSize: scale(16),
                              textAlign: 'center',
                            }}
                          >
                            You must be a {orgName} one time paid subscriber to listen this music

                          </Text>

                        </View>
                        <CustomModal.Footer>
                          <CustomButton
                            butttonText={`Buy now $${musicContent?.price}`}
                            inputStyle={{ backgroundColor: brandColor, width: '100%', }}
                            onPress={() => {
                              setAlertModalVisible(false);
                              setTimeout(() => {
                                navigation.navigate('Checkout', {
                                  price: `${musicContent?.price}`,
                                  fromMusicItem: true,
                                  musicItemId: musicItemId
                                })
                              }, 400);

                            }}
                          />
                        </CustomModal.Footer>
                      </CustomModal.Body>
                    )
                  :
                  (
                    <CustomModal.Body>
                      <View style={{ alignItems: "center" }}>
                        <Text
                          style={{
                            ...styles.textColorWhite,
                            color: theme == 'DARK'
                              ? 'black'
                              : 'white',
                            fontSize: scale(15),
                            textAlign: 'center',
                          }}
                        >
                          You must be  {orgName} one time paid subscriber to listen this music

                        </Text>

                      </View>
                      <CustomModal.Footer>
                        <View
                          style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: moderateScale(-3),
                          }}
                        >
                          <TouchableOpacity
                            style={{
                              ...styles.btnn,
                              backgroundColor: brandColor,
                            }}
                            onPress={_handleLogin}
                          >
                            <Text
                              style={{
                                ...styles.btnTextModal,

                                color: '#ffff',
                              }}
                            >
                              Sign in
                            </Text>
                          </TouchableOpacity>

                          <View
                            style={{
                              flexDirection: 'row',
                              marginTop: moderateScale(8),
                            }}
                          >
                            <Text
                              style={{
                                ...styles.textColorWhite,
                                color: theme == 'DARK'
                                  ? 'black'
                                  : 'white',
                                fontSize: scale(15),
                              }}
                            >
                              {' '}
                              or{' '}
                            </Text>
                            <TouchableOpacity onPress={_signUpButton}>
                              <Text
                                style={{
                                  textDecorationLine: 'underline',
                                  fontWeight: 'bold',
                                  fontSize: scale(15),
                                  color: theme == 'DARK'
                                    ? 'black'
                                    : 'white',
                                }}
                              >
                                Sign up
                              </Text>
                            </TouchableOpacity>
                            <Text
                              style={{
                                color: theme == 'DARK'
                                  ? 'black'
                                  : 'white',
                                fontSize: scale(15),
                              }}
                            >
                              {' '}
                              to Subscribe
                            </Text>
                          </View>
                        </View>
                      </CustomModal.Footer>
                    </CustomModal.Body>
                  )
                }
              </CustomModal.Container>
            </TouchableOpacity>
          )

        }
        {/*  to show paid and otp modal */}
        {
          musicContent?.isOneTimePurchase == true && musicContent?.subscriptionPlanIds.length > 0 && musicContent?.musicAccessType == 'PAID' &&
          (
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'center' }}
              activeOpacity={1}
              onPress={() => {
                setAlertModalVisible(false);
              }}
            >
              <CustomModal.Container additionalStyles={{ height: 270 }}>

                {token !== null ?

                  //one time payment modal with login on platform basis-------------------------
                  Platform.OS == 'ios' ?
                    (
                      <CustomModal.Body>
                        <View style={{ width: '100%', height: '100%' }}>
                          <Text
                            style={{
                              // ...styles.textColorWhite,
                              color:
                                theme == 'DARK'
                                  ? 'black'
                                  : 'white',
                              fontSize: scale(16),
                              fontWeight: '600',
                              textAlign: 'center',
                            }}
                          >
                            You must be a {orgName} subscriber or one time paid subscriber to listen this music,pay by downloading{' '}
                            {orgName} android mobile app or visit our website{' '}

                          </Text>
                          <Text style={{
                            color: "yellow",
                            fontWeight: '600',
                            fontSize: scale(16),
                            textAlign: 'center',
                          }}>
                            {websiteName}
                          </Text>
                        </View>
                      </CustomModal.Body>
                    )
                    :
                    (
                      <CustomModal.Body>
                        <View style={{ width: '100%', height: '100%' }}>
                          <Text
                            style={{
                              ...styles.textColorWhite,
                              color:
                                theme == 'DARK'
                                  ? 'black'
                                  : 'white',
                              fontSize: scale(15),
                              textAlign: 'center',
                            }}
                          >
                            You must be a {orgName} subscriber to listen this music.Click on Get access to subscribe or You can also buy this music for lifetime for that please click on Buy now

                          </Text>

                        </View>
                        <CustomModal.Footer>
                          <View>
                            <TouchableOpacity
                              style={{
                                ...styles.btnn,
                                backgroundColor: brandColor,
                                marginBottom: moderateScale(9),

                              }}
                              styleFocused={styles.btnFocused}
                              onPress={_handleGetAccessButton}
                            >
                              <Text
                                style={{
                                  ...styles.btnTextModal,
                                  color: '#fff',
                                  fontSize: 12,
                                }}
                              >
                                Get Access Now
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{
                                ...styles.btnn,
                                backgroundColor: brandColor,
                                marginBottom: moderateScale(9),

                              }}
                              styleFocused={styles.btnFocused}
                              onPress={() => {
                                setAlertModalVisible(false);
                                setTimeout(() => {
                                  navigation.navigate('Checkout', {
                                    price: `${musicContent?.price}`,
                                    fromMusicItem: true,
                                    itemId: musicItemId
                                  })
                                }, 400);

                              }}
                            >
                              <Text
                                style={{
                                  ...styles.btnTextModal,
                                  color: '#fff',
                                  fontSize: 13,
                                  // width:'100%'
                                }}
                              >
                                Buy now  ${musicContent?.price}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </CustomModal.Footer>
                      </CustomModal.Body>


                    )
                  :
                  (
                    <CustomModal.Body>
                      <View style={{ alignItems: "center" }}>
                        <Text
                          style={{
                            ...styles.textColorWhite,
                            color: theme == 'DARK'
                              ? 'black'
                              : 'white',
                            fontSize: scale(15),
                            textAlign: 'center',
                          }}
                        >
                          You must be a {orgName} subscriber to listen this music.

                        </Text>

                      </View>
                      <CustomModal.Footer>
                        <View
                          style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: moderateScale(-3),
                          }}
                        >
                          <TouchableOpacity
                            style={{
                              ...styles.btnn,
                              backgroundColor: brandColor,
                            }}
                            onPress={_handleLogin}
                          >
                            <Text
                              style={{
                                ...styles.btnTextModal,

                                color: '#ffff',
                              }}
                            >
                              Sign in
                            </Text>
                          </TouchableOpacity>

                          <View
                            style={{
                              flexDirection: 'row',
                              marginTop: moderateScale(8),
                            }}
                          >
                            <Text
                              style={{
                                ...styles.textColorWhite,
                                color: theme == 'DARK'
                                  ? 'black'
                                  : 'white',
                                fontSize: scale(15),
                              }}
                            >
                              {' '}
                              or{' '}
                            </Text>
                            <TouchableOpacity onPress={_signUpButton}>
                              <Text
                                style={{
                                  textDecorationLine: 'underline',
                                  fontWeight: 'bold',
                                  fontSize: scale(15),
                                  color: theme == 'DARK'
                                    ? 'black'
                                    : 'white',
                                }}
                              >
                                Sign up
                              </Text>
                            </TouchableOpacity>
                            <Text
                              style={{
                                color: theme == 'DARK'
                                  ? 'black'
                                  : 'white',
                                fontSize: scale(15),
                              }}
                            >
                              {' '}
                              to Subscribe
                            </Text>
                          </View>
                        </View>
                      </CustomModal.Footer>
                    </CustomModal.Body>
                  )
                }
              </CustomModal.Container>
            </TouchableOpacity>
          )
        }
        {
          (musicContent?.musicAccessType == 'ACCESSREQUIRED' || (musicContent?.musicAccessType == 'PAID' && musicContent?.subscriptionPlanIds.length > 0)) && musicContent?.isOneTimePurchase == false &&
          (
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'center' }}
              activeOpacity={1}
              onPress={() => {
                setAlertModalVisible(false);
                setButtonPressed(false)
              }}
            >

              {isAuthenticated &&
                (musicContent?.audioDTO == null && musicContent?.subscriptionPlanIds?.includes(id) ? (
                  Platform.OS == 'ios' ? (

                    //without payment user in ios-------------------------------------------
                    <CustomModal.Container>
                      <CustomModal.Body>
                        <View style={{ width: '90%', height: '60%' }}>
                          <Text
                            style={{
                              color: theme == 'DARK'
                                ? 'black'
                                : 'white',
                              fontSize: scale(16),
                              textAlign: 'center',
                            }}
                          >
                            To watch this paid music, subscribe by downloading{' '}
                            {orgName} android mobile app or visit our website{' '}

                          </Text>
                          <Text style={{
                            color: "yellow",
                            fontWeight: '600',
                            fontSize: 16,
                            textAlign: 'center',
                          }}>
                            {websiteName}
                          </Text>
                        </View>
                      </CustomModal.Body>
                    </CustomModal.Container>
                  ) : (

                    //withlogin without paymentdone  modal for android------------------------------
                    <CustomModal.Container>
                      <CustomModal.Body>
                        <Text
                          style={{
                            ...styles.textColorWhite,
                            color:
                              theme == 'DARK'
                                ? 'black'
                                : 'white',
                          }}
                        >
                          You must be a {orgName} subscriber to listen this music
                        </Text>
                        <TouchableOpacity
                          style={{
                            ...styles.btnn,
                            backgroundColor: brandColor,
                            marginTop: moderateScale(9),
                          }}
                          styleFocused={styles.btnFocused}
                          onPress={_handleGetAccessButton}
                        >
                          <Text
                            style={{
                              ...styles.btnTextModal,
                              color: '#fff'
                            }}
                          >
                            Get Access Now
                          </Text>
                        </TouchableOpacity>
                      </CustomModal.Body>
                    </CustomModal.Container>
                  )
                ) : Platform.OS == 'ios' ? (

                  //registered or login user without required plan to watch music ios---------------------------------
                  <CustomModal.Container>
                    <CustomModal.Body>
                      <View style={{ marginTop: -10 }}>
                        <Text
                          style={{
                            color: theme == 'DARK'
                              ? 'black'
                              : 'white',
                            fontWeight: '600',
                            fontSize: scale(16),
                            textAlign: 'center',
                          }}
                        >
                          You must be a {orgName} subscriber to listen this music, subscribe by downloading{' '}
                          {orgName} android mobile app or visit our website{' '}
                        </Text>
                        <Text style={{
                          color: "yellow",
                          fontWeight: '600',
                          fontSize: scale(16),
                          textAlign: 'center',
                        }}>
                          {websiteName}
                        </Text>
                      </View>
                    </CustomModal.Body>
                  </CustomModal.Container>
                ) : (

                  //registered or logged in user without required plan to watch music android-------------------------------
                  <CustomModal.Container>
                    <CustomModal.Body>
                      <View style={{ alignItems: 'center' }}>
                        <Text
                          style={{
                            textAlign: 'center',
                            color:
                              theme == 'DARK'
                                ? 'black'
                                : 'white',
                            fontSize: scale(16)
                          }}
                        >
                          You must be a {orgName} subscriber to listen this music
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={{
                          ...styles.btnn,
                          backgroundColor: brandColor,
                          marginTop: moderateScale(9),
                        }}
                        styleFocused={styles.btnFocused}
                        onPress={_handleGetAccessButton}
                      >
                        <Text
                          style={{
                            ...styles.btnTextModal,
                            color: '#ffff',
                          }}
                        >
                          Get Access Now
                        </Text>
                      </TouchableOpacity>
                    </CustomModal.Body>
                  </CustomModal.Container>
                ))}
              {!isAuthenticated &&
                (musicContent?.musicAccessType == 'PAID' ? (
                  Platform.OS == 'ios' ? (

                    //without login user paid music ios--------------------------------------------------------
                    <CustomModal.Container>
                      <CustomModal.Header />
                      <CustomModal.Body>
                        <View style={{ alignItems: "center" }}>
                          <Text
                            style={{
                              color:
                                theme == 'DARK'
                                  ? 'black'
                                  : 'white',
                              textAlign: 'center',
                              fontSize: scale(16)
                            }}
                          >
                            You must be a {orgName} subscriber to listen this music
                          </Text>
                        </View>
                        <CustomModal.Footer>
                          <View
                            style={{
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginTop: moderateScale(-3),
                            }}
                          >
                            <TouchableOpacity
                              style={{
                                ...styles.btnn,
                                backgroundColor: brandColor,
                              }}
                              onPress={_handleLogin}
                            >
                              <Text
                                style={{
                                  ...styles.btnTextModal,
                                  color: '#ffff',
                                }}
                              >
                                Sign in
                              </Text>
                            </TouchableOpacity>

                            <View
                              style={{
                                flexDirection: 'row',
                                marginTop: moderateScale(8),
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: scale(16),
                                  color:
                                    theme == 'DARK'
                                      ? 'black'
                                      : 'white',
                                }}
                              >
                                {' '}
                                or{' '}
                              </Text>
                              <TouchableOpacity onPress={_signUpButton}>
                                <Text
                                  style={{
                                    textDecorationLine: 'underline',
                                    fontWeight: 'bold',
                                    fontSize: scale(16),
                                    color: theme == 'DARK'
                                      ? 'black'
                                      : 'white',
                                  }}
                                >
                                  Sign up
                                </Text>
                              </TouchableOpacity>
                              <Text
                                style={{
                                  ...styles.textColorWhite,
                                  fontSize: scale(16),
                                  color: theme == 'DARK'
                                    ? 'black'
                                    : 'white',
                                }}
                              >
                                {' '}
                                and Subscribe
                              </Text>
                            </View>
                          </View>
                        </CustomModal.Footer>
                      </CustomModal.Body>
                    </CustomModal.Container>
                  ) : (

                    //without login paid music android-------------------------------------------------------------
                    <CustomModal.Container>
                      <CustomModal.Header />
                      <CustomModal.Body>
                        <View style={{ alignItems: "center" }}>
                          <Text
                            style={{
                              color:
                                theme == 'DARK'
                                  ? 'black'
                                  : 'white',
                              textAlign: 'center',
                              fontSize: scale(16)
                            }}
                          >
                            You must be a {orgName} subscriber to listen this music
                          </Text>
                        </View>
                        <CustomModal.Footer>
                          <View
                            style={{
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginTop: moderateScale(-3),
                            }}
                          >
                            <TouchableOpacity
                              style={{
                                ...styles.btnn,
                                backgroundColor: brandColor,
                              }}
                              onPress={_handleLogin}
                            >
                              <Text
                                style={{
                                  ...styles.btnTextModal,
                                  color: '#ffff',
                                }}
                              >
                                Sign in
                              </Text>
                            </TouchableOpacity>

                            <View
                              style={{
                                flexDirection: 'row',
                                marginTop: moderateScale(8),
                              }}
                            >
                              <Text
                                style={{
                                  color:
                                    theme == 'DARK'
                                      ? 'black'
                                      : 'white',
                                  fontSize: scale(16),
                                }}
                              >
                                {' '}
                                or{' '}
                              </Text>
                              <TouchableOpacity onPress={_signUpButton}>
                                <Text
                                  style={{
                                    textDecorationLine: 'underline',
                                    fontWeight: 'bold',
                                    fontSize: scale(16),
                                    color:
                                      theme == 'DARK'
                                        ? 'black'
                                        : 'white',
                                  }}
                                >
                                  Sign up
                                </Text>
                              </TouchableOpacity>
                              <Text
                                style={{
                                  fontSize: scale(16),
                                  color:
                                    theme == 'DARK'
                                      ? 'black'
                                      : 'white',
                                }}
                              >
                                {' '}
                                and Subscribe
                              </Text>
                            </View>
                          </View>
                        </CustomModal.Footer>
                      </CustomModal.Body>
                    </CustomModal.Container>
                  )
                ) : Platform.OS == 'ios' ? (
                  //access required music ios
                  <CustomModal.Container>
                    <CustomModal.Body>
                      <Text style={{
                        fontSize: scale(16),
                        color: theme == 'DARK'
                          ? 'black'
                          : 'white',
                      }}>
                        You must be a {orgName} subscriber to listen this free music
                      </Text >
                      <CustomModal.Footer>
                        <View
                          style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <TouchableOpacity
                            style={{
                              ...styles.btnn,
                              backgroundColor: brandColor,
                            }}
                            onPress={_handleLogin}
                          >
                            <Text
                              style={{
                                ...styles.btnTextModal,
                                color: '#ffff',
                              }}
                            >
                              Sign in
                            </Text>
                          </TouchableOpacity>

                          <View
                            style={{
                              flexDirection: 'row',
                              marginTop: moderateScale(8),
                            }}
                          >
                            <Text style={{
                              fontSize: scale(16),
                              color: theme == 'DARK'
                                ? 'black'
                                : 'white',

                            }}> or </Text>
                            <TouchableOpacity onPress={_signUpButton}>
                              <Text
                                style={{
                                  textDecorationLine: 'underline',
                                  fontWeight: 'bold',
                                  fontSize: scale(16),
                                  color: theme == 'DARK'
                                    ? 'black'
                                    : 'white',
                                }}
                              >
                                Sign up
                              </Text>
                            </TouchableOpacity>
                            <Text style={{
                              fontSize: scale(16),
                              color: theme == 'DARK'
                                ? 'black'
                                : 'white',

                            }}> to Subscribe</Text>
                          </View>
                        </View>
                      </CustomModal.Footer>
                    </CustomModal.Body>
                  </CustomModal.Container>
                ) : (
                  //access required music android
                  <CustomModal.Container>
                    <CustomModal.Body>
                      <Text style={{
                        fontSize: scale(16),
                        color:
                          theme == 'DARK'
                            ? 'black'
                            : 'white',
                      }}>
                        You must be a {orgName} subscriber to listen this free music
                      </Text >
                      <CustomModal.Footer>
                        <View
                          style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <TouchableOpacity
                            style={{
                              ...styles.btnn,
                              backgroundColor: brandColor,
                            }}
                            onPress={_handleLogin}
                          >
                            <Text
                              style={{
                                ...styles.btnTextModal,

                                color: '#ffff',
                              }}
                            >
                              Sign in
                            </Text>
                          </TouchableOpacity>

                          <View
                            style={{
                              flexDirection: 'row',
                              marginTop: moderateScale(8),
                            }}
                          >
                            <Text style={{
                              fontSize: scale(16),
                              color:
                                theme == 'DARK'
                                  ? 'black'
                                  : 'white',

                            }}> or </Text>
                            <TouchableOpacity onPress={_signUpButton}>
                              <Text
                                style={{
                                  textDecorationLine: 'underline',
                                  fontWeight: 'bold',
                                  fontSize: scale(16),
                                  color:
                                    theme == 'DARK'
                                      ? 'black'
                                      : 'white',
                                }}
                              >
                                Sign up
                              </Text>
                            </TouchableOpacity>
                            <Text style={{
                              fontSize: scale(16),
                              color:
                                theme == 'DARK'
                                  ? 'black'
                                  : 'white',

                            }}> to Subscribe</Text>
                          </View>
                        </View>
                      </CustomModal.Footer>
                    </CustomModal.Body>
                  </CustomModal.Container>
                ))}
            </TouchableOpacity>
          )
        }
      </CustomModal>
    );
  }

  const _handleMusicPlayButton = () => {
    if (musicContent?.musicAccessType == 'FREE' || (musicContent?.musicAccessType == 'ACCESSREQUIRED' && isAuthenticated)) {
      setButtonPressed(true);
      setPath(musicContent?.audioDTO?.path);
    }
    else {
      if (Platform.OS == 'android') {
        if (musicContent?.musicAccessType == 'ACCESSREQUIRED') {
          if (!isAuthenticated) {
            setAlertModalVisible(true);
          } else {
            setButtonPressed(true);
            setPath(musicContent?.audioDTO?.path);
          }
        }
        else if (musicContent?.musicAccessType == 'PAID') {
          if (musicContent?.audioDTO !== null && musicContent?.subscriptionPlanIds?.includes(id) && isPaymentDone) {
            setButtonPressed(true);
            setPath(musicContent?.audioDTO?.path);

          } else if (musicContent?.isOneTimePurchasePaymentDone == true) {
            setButtonPressed(true);
            setPath(musicContent?.audioDTO?.path);

          } else if (musicContent?.isOneTimePurchase == true && musicContent?.subscriptionPlanIds.length === 0) {
            if (Platform.OS == 'android') {
              if (isAuthenticated) {
                navigation.navigate('Checkout', {
                  price: `${musicContent?.price}`,
                  fromMusicItem: true,
                  itemId: musicItemId
                })
              } else {
                navigation.navigate('Auth', {
                  screen: 'RegisterScreen',
                  params: {
                    type: 'MUSIC',
                    fromMusicOTP: true,
                    price: `${musicContent?.price}`,
                    itemId: musicItemId,
                  },
                })
              }
            }
          }
          else {
            setAlertModalVisible(true);
          }
        } else if (musicContent?.musicAccessType == 'PAID' && musicContent?.subscriptionPlanIds?.includes(id) && musicContent?.audioDTO == null) {
          setAlertModalVisible(true)
        }
      } else {
        if (musicContent?.musicAccessType !== 'FREE' && !isAuthenticated) {
          return dispatch({ type: SET_ACCESS_MODAL_IOS, payload: true });
        }
        else if (musicContent?.musicAccessType == 'FREE' ||
          (musicContent?.musicAccessType == 'ACCESSREQUIRED' && isAuthenticated) ||
          (musicContent?.musicAccessType == 'PAID' && musicContent?.isOneTimePurchasePaymentDone == true) ||
          (musicContent?.musicAccessType == 'PAID' && musicContent?.subscriptionPlanIds?.includes(id)) && isPaymentDone) {
          setButtonPressed(true);
          setPath(musicContent?.audioDTO?.path);
          return;
        } else {
          console.log('   ');
          dispatch({ type: SET_SUB_PLAN_IDS, payload: musicContent?.subscriptionPlanIds })
          return dispatch({ type: SET_IOSCOMP, payload: true })
        }
      }
    }
  };

  const _togglePlayPause = () => {
    setpaused(!paused);
  };

  const _handleOnEnd = () => {
    setpaused(!paused);
    setCurrentTime(0);
    playerRef.current.seek(0);
    setProgress(0);
  };

  function _seekBack() {
    if (currentTime >= 15) {
      setCurrentTime(currentTime - 15);
      playerRef.current.seek(Math.floor(progress * duration) - 15);
      setProgress(Math.floor(currentTime - 15) / duration);
    } else {
      setCurrentTime(0);
      playerRef.current.seek(0);
      setProgress(0);
    }
  }

  function _seekForward() {
    if (currentTime <= duration - 15) {
      setCurrentTime(currentTime + 15);
      playerRef.current.seek(Math.floor(progress * duration) + 15);
      setProgress(Math.floor(currentTime + 15) / duration);
    } else {
      setCurrentTime(0);
      playerRef.current.seek(0);
      setProgress(0);
      setpaused(true)
    }
  }

  async function _seekBackIOS() {
    if (currentTime >= 15) {
      setCurrentTime(currentTime - 15);
      setProgress(Math.floor(currentTime - 15) / duration);
      await playerRef.current.seek(Math.floor(progress * duration) - 15);
    } else {
      setCurrentTime(0);
      setProgress(0);
      await playerRef.current.seek(0);
    }
  }

  async function _seekForwardIOS() {
    if (currentTime <= duration - 15) {
      setCurrentTime(currentTime + 15);
      setProgress(Math.floor(currentTime + 15) / duration);
      await playerRef.current.seek(Math.floor(progress * duration) + 15);
    } else {
      setCurrentTime(0);
      setProgress(0);
      setpaused(true)
      await playerRef.current.seek(0);
    }
    // console.log('before seek --', Math.floor(progress * duration) + 15)
  }

  const _togglePlayPauseIOS = async () => {
    setpaused(!paused);
  };

  const _handleOnEndIOS = async () => {
    await setpaused(!paused);
    await setCurrentTime(0);
    await playerRef.current.seek(0);
    setProgress(0);
  };


  const repeatIcon = () => {
    if (repeatMode == 'off') {
      return 'repeat-off';
    }
    if (repeatMode == 'track') {
      return 'repeat-once';
    }
    if (repeatMode == 'repeat') {
      return 'repeat';
    }
  };

  const changeRepeatMode = () => {
    // if (repeatMode == 'off') {
    //   TrackPlayer.setRepeatMode(RepeatMode.Track);
    //   setRepeatMode('track');
    // }
    // if (repeatMode == 'track') {
    //   TrackPlayer.setRepeatMode(RepeatMode.Queue);

    //   setRepeatMode('repeat');
    // }
    // if (repeatMode == 'repeat') {
    //   TrackPlayer.setRepeatMode(RepeatMode.Off);

    //   setRepeatMode('off');
    // }
  };


  const shuffleArray = (array) => {
    let currentIndex = array.length,
      temporaryValue,
      randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  };

  const shuffle = async () => {
    // const queue = await TrackPlayer.getQueue();
    // const shuffledQueue = shuffleArray(queue);
    // await TrackPlayer.destroy();
    // await TrackPlayer.setupPlayer();
    // await TrackPlayer.add(shuffledQueue);
    // await TrackPlayer.play();
    // setShuffle(!shufle);
  };

  const textRepeat = () => {
    if (repeatMode == 'off') {
      return 'Repeat';
    }
    if (repeatMode == 'track') {
      return 'Repeat one';
    }
    if (repeatMode == 'repeat') {
      return 'Repeat All';
    }
  };

  /**
   * This section contains all the components--
   *
   */

  /**
   * this controls the UI of the MODAL that controls playback speed of the video
   * @returns UI for the playback speed modal
   */
  const PlaybackModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <TouchableOpacity
          activeOpacity={0}
          onPress={() => {
            setModalVisible(!modalVisible);
          }}
          style={{ flex: 1 }}
        ></TouchableOpacity>
        <View>
          <View style={styles.modalView}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: moderateScale(15),
              }}
            >
              <Text style={{ ...styles.modalText }}>Playback Speed</Text>
              <Text
                style={{ fontSize: 15, fontWeight: 'bold' }}
                onPress={() => {
                  reset();
                }}
              >
                {resetValue ? 'RESET' : null}
              </Text>
            </View>
            <Text
              style={{
                textAlign: 'center',
                marginRight: moderateScale(12)
              }}
            >
              {MultiTime.toFixed(1)}
            </Text>
            <View>
              <Slider
                step={0.1}
                minimumValue={0.1}
                maximumValue={2}
                minimumTrackTintColor="#000"
                thumbTintColor="#010433"
                onValueChange={(ChangedValue) => {
                  // console.log('changed value>>', ChangedValue);
                  multiSpeed(ChangedValue);
                }}
                onSlidingStart={(value) => {
                  multiSpeed(value);
                }}
                onSlidingComplete={(value) => {
                  multiSpeed(value);
                }}
                tapToSeek={true}
                value={MultiTime}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: moderateVerticalScale(5),
                paddingHorizontal: moderateScale(15),
              }}
            >
              <Text>0.5x</Text>
              <Text>2x</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  /**
   * this is the modal for the options
   * @returns  UI to switch to audio and to share the video
   */
  const optionsModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={optionVisible}
        onRequestClose={() => {
          setOptionVisibility(!optionVisible);
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1 }}
          onPress={() => {
            setOptionVisibility(false);
          }}
        >
          <View style={{ ...styles.options, height: 120 }}>
            {fromVideo ? (
              <>
                <TouchableOpacity
                  style={{ height: '50%', justifyContent: 'center' }}
                  onPress={() => {
                    _handleSwitchToVideo();
                    setOptionVisibility(false);
                  }}
                >
                  <View style={styles.optionItem}>
                    <DeleteIcon name="play-circle-outline" size={25} />
                    <Text style={styles.optionText}>Switch to Video</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ height: '50%', justifyContent: 'center' }}
                  onPress={() => {
                    // setOptionVisibility(false);
                    shareVideo();
                  }}
                >
                  <View style={styles.optionItem}>
                    <ShareIcon name="sharealt" size={25} />
                    <Text style={styles.optionText}>Share</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={{ height: '50%', justifyContent: 'center' }}
                  onPress={() => {
                    shuffle();
                  }}
                >
                  <View style={styles.optionItem}>
                    <ShuffleIcon
                      name="shuffle"
                      color={shufle ? '#000' : '#D3D3D3'}
                      size={25}
                    />
                    <Text style={styles.optionText}> Shuffel</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ height: '50%', justifyContent: 'center' }}
                  onPress={() => {
                    changeRepeatMode();
                  }}
                >
                  <View style={styles.optionItem}>
                    <RepeatIcon name={repeatIcon()} size={25} />
                    <Text style={styles.optionText}>{textRepeat()}</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  //component for the Back button in the top left--
  const HeaderButton = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (fromVideo == true) {
            navigation.navigate('MediaItem');
          } else {
            navigation.goBack();
          }
        }}
        style={{
          width: 50,
          marginLeft: ThemeConstant.MARGIN_NORMAL,
          marginTop: Platform.OS == 'ios' ? moderateVerticalScale(40) : moderateVerticalScale(40)
        }}
      >
        <EvilIcons
          name={'chevron-down'}
          size={ThemeConstant.ICON_SIZE_EXTRA_LARGE}
          color={'#fff'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        position: 'relative',
        backgroundColor: theme == 'DARK' ? '#000' : '#fff',
      }}
    >
      {/* STATUS BAR */}
      <StatusBar
        backgroundColor={
          imageBgColor != null
            ? imageBgColor
            : ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR}
      />


      {/* VIDEO  COMPONENT TO PLAY AUDIO */}
      <Video
        ref={playerRef}
        paused={paused == true ? true : false}
        source={{
          uri:
            fromVideo ?
              data.audioDTO ? data.audioDTO?.path : data.audioUrl
              :
              path
        }}
        onLoad={_handleOnLoad}
        preventsDisplaySleepDuringVideoPlayback={true}
        resizeMode={'contain'}
        onEnd={Platform.OS == 'android' ? _handleOnEnd : _handleOnEndIOS}
        onProgress={_handleOnProgress}
        rate={MultiTime}
        repeat={false}
        playInBackground={true}
        onBuffer={({ isBuffering }) => {
          if (isBuffering) {
            setIsLoading(true);
          } else {
            setIsLoading(false);
          }
        }}
        style={{
          width: '100%',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      />

      {/* BACKGROUND BLUR IMAGE AND DARK */}
      <View style={styles.backgroundContainer}>
        <Image
          source={{ uri: image }}
          style={{
            flex: 1,
            backgroundColor:
              imageBgColor != null
                ? imageBgColor
                : ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR

          }}
          blurRadius={3}
        />
      </View>

      {/* BACKGROUND OVERLAY */}
      <View style={styles.backgroundOverlay} />

      {/* HEADER BACK BUTTON */}
      <HeaderButton />

      {/* CONTAINS IMAGE TITLE AND OTHER INFO */}
      <View style={styles.mainContainer}>
        <View style={styles.imageContainer}>
          <FastImage
            source={{ uri: image }}
            style={styles.img}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
        <View style={styles.detailsContainer}>
          <Text numberOfLines={1} style={styles.title}>
            {fromVideo == true ? data.title : songTitle}
          </Text>
          <Text style={styles.artist}>{(artist) ? data?.artist : data?.speaker}</Text>
        </View>
      </View>

      {/* CONTROLS */}
      <View style={styles.controlsContainer}>
        <View style={styles.topControlsContainer}>
          <View style={styles.controlIcon}>
            <Text style={[styles.icon]}>
              {secondsToTime(currentTime)}
            </Text>
          </View>
          <View style={styles.sliderContainer}>
            <Slider
              value={progress}
              minimumValue={0}
              tapToSeek={true}
              maximumValue={1}
              onSlidingStart={async (progress) => {
                setControlsVisible(true);
              }}
              onSlidingComplete={async (progress) => {
                setProgress(progress);
                await playerRef.current.seek(
                  Math.floor(progress * duration)
                );
              }}
              onValueChange={async (progress) => {
                setCurrentTime(progress * duration);
                setProgress(progress);
                await playerRef.current.seek(
                  Math.floor(progress * duration)
                );
              }}
              style={styles.slider}
              thumbTintColor="#fff"
              minimumTrackTintColor="#fff"
              maximumTrackTintColor="#fff"
            />
          </View>
          <View style={styles.controlIcon}>
            <Text style={[styles.icon]}>
              -{secondsToTime(duration - currentTime)}
            </Text>
          </View>
        </View>

        <View style={styles.controlBottom}>
          <TouchableOpacity
            TouchableOpacity
            onPress={() => {
              setModalVisible(true);
            }}
            style={styles.controlIcon}
          >
            <Text style={{ color: '#FFF', fontSize: 16 }}>
              {MultiTime.toFixed(1)}X
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlIcon} onPress={Platform.OS == 'android' ? _seekBack : _seekBackIOS}>
            <SeekIcon
              name="spinner-rotate-forward"
              size={30}
              style={{ transform: [{ rotateY: '180deg' }], ...styles.seekIcon }}
            />
            <Text style={styles.seekText}>15</Text>
          </TouchableOpacity>
          <TouchableOpacity
            // onPress={Platform.OS == 'android' ? _togglePlayPause : _togglePlayPauseIOS}
            onPress={() => {
              if (!fromVideo && !buttonPressed) {
                _handleMusicPlayButton();
              } else {
                Platform.OS == 'android' ? _togglePlayPause() : _togglePlayPauseIOS()
              }
            }}
            style={styles.controlIcon}
          >
            {isLoading ? (
              <View>
                <ActivityIndicator
                  size={'large'}
                  color={'gray'}
                  animating={true}
                />
              </View>
            ) : (
              <Icon
                name={!paused ? 'pause' : 'caretright'}
                size={38}
                style={styles.icon}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlIcon} onPress={Platform.OS == 'android' ? _seekForward : _seekForwardIOS}>
            <SeekIcon
              name="spinner-rotate-forward"
              size={30}
              style={styles.seekIcon}
            />
            <Text style={styles.seekText}>15</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlIcon}
            onPress={() => {
              if (fromVideo) {
                setOptionVisibility(!optionVisible);
              }
            }}
          >
            {
              fromVideo && <OptionIcon name="options" size={20} style={styles.icon} />
            }
          </TouchableOpacity>
        </View>
      </View>
      {Alertmodal()}
      {optionsModal()}
      {PlaybackModal()}
    </View>
  );
};
export default AudioPlayer;

const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: 30,
    height: '80%',
    justifyContent: 'center',
  },
  imageContainer: {
    elevation: 10,
    width: '100%',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  img: {
    aspectRatio: 1 / 1,
    borderRadius: 10,
    width: '100%',
  },
  title: {
    fontSize: 16,
    alignSelf: 'center',
    color: '#fff',
  },
  artist: {
    fontSize: 14,
    alignSelf: 'center',
    justifyContent: 'center',
    color: '#c0c0c0',
    marginTop: 5,
  },

  //styles of the controls components-----------------------
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 10,
    height: '20 %',
  },
  topControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sliderContainer: {
    flexGrow: 1,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 20,
    alignSelf: 'center',
  },
  controlBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlIcon: {
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  ////////////////
  modalView: {
    backgroundColor: 'white',
    borderRadius: 1,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    height: 175,
    position: 'absolute',
    bottom: 0,
  },
  button: {
    borderRadius: 20,
    padding: 30,
    width: 500,
    height: 100,
    elevation: 2,
  },
  buttonShare: {
    borderRadius: 20,
    width: 600,
    height: 125,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {},
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  activityIndicator: {
    alignItems: 'center',
    height: 100,
    marginTop: -81,
  },
  start: {
    flexDirection: 'row',
    maxWidth: '90%',
    width: '70 %',
  },

  image: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    marginLeft: 20,
  },
  textContainer: {
    marginLeft: 30,
    alignSelf: 'center',
  },
  options: {
    backgroundColor: '#fff',
    height: 120,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: ThemeConstant.PADDING_EXTRA_LARGE,
    justifyContent: 'space-around',
  },
  model: {
    flex: 1,
  },
  icon: {
    color: '#FFF',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: ThemeConstant.MARGIN_EXTRA_LARGE,
  },
  seekText: {
    color: '#FFF',
    position: 'absolute',
    width: '100%',
    fontSize: 12,
    textAlign: 'center',
  },
  seekIcon: {
    color: '#FFF',
    width: '100%',
    textAlign: 'center',
  },

  //STYLE FOR BACKGROUD_
  backgroundContainer: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  // PLAYBACK MODAL
  modalView: {
    backgroundColor: '#fff',
    width: '100%',
    paddingVertical: moderateScale(30),
    paddingHorizontal: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
  },

  //alert modal style
  modal2View: {
    margin: 20,
    marginBottom: 5,
    width: '95%',
    // height: 200,
    backgroundColor: '#d3d3d3',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
  },

  // //latest modal styles
  textColorWhite: {
    fontSize: scale(16)
  },
  btnn: {
    borderRadius: 6,
    height: "52%",
    paddingHorizontal: 15,
    minWidth: '43%',
    justifyContent: "center",
    alignItems: "center",
    borderWidth: .8,
    borderColor: "#ffff"
  },
  btnTextModal: {
    fontWeight: "bold"
  },
  info: {
    fontSize: scale(14),
    fontFamily: ThemeConstant.FONT_FAMILY,
    fontWeight: 'bold',
  },
  loaderContainer: {
    height: moderateVerticalScale(50),
    position: 'absolute',
    top: 0,
    height: '85%',
    zIndex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    // marginBottom: moderateVerticalScale(10),
  }
});
