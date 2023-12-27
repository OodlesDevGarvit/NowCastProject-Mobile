import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
  Platform,
  Image,
  useWindowDimensions,
  FlatList,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { moderateScale, scale } from 'react-native-size-matters';
import { axiosInstance1 } from '../../constant/Auth';
import { Modal } from '../../components/Modal';
import { useIsFocused } from '@react-navigation/native';
import { moderateVerticalScale } from 'react-native-size-matters';
import { SET_ALERT, SET_SUB_PLAN_IDS } from '../../store/actions/types';
import { SET_IOSCOMP, SET_ACCESS_MODAL_IOS } from '../../store/actions/types';
import { shadeColor } from '../../utils/shadeColor';
import ThemeConstant, { DynamicThemeConstants } from '../../constant/ThemeConstant';
import Loader from '../../components/Loader';
import styles from './Styles';
import CustomButton from '../../components/CustomButton';
import AntDesign from 'react-native-vector-icons/AntDesign';
import BlurredHeader from '../../components/common/BlurredHeader';
import LinearGradient from 'react-native-linear-gradient';
import * as API from '../../constant/APIs';
import * as API_CONSTANT from '../../constant/ApiConstant';
import FastImage from 'react-native-fast-image';
import { filterContentForIOS } from '../../utils/FilterContentForIos';


const AlbumDetail = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();
  //routes data--------------
  const { mobileTheme: theme, subdomain: subDomain, brandColor, website: websiteName, organizationName: orgName } = useSelector((state) => state.brandingReducer.brandingData);
  const { token, isAuthenticated, userId, user, subscription: { id }, isPaymentDone } = useSelector(state => state.authReducer);
  const { basicInfo: { firstName, lastName, email, mobileNumber } = { firstName: null, lastName: null, mobileNumber: null } } = user ?? {};
  const { color, seriesId, type, title: routeTitle } = route.params;
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const fromCheckout = route.params?.fromCheckout;
  const { noInternetModalVisible } = useSelector(state => state.noInternetReducer)

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [MediaBanner, setMediaBanner] = useState(null);
  const [imageBgColor, setImageBgColor] = useState(color);
  const [modalVisible, setModalVisible] = useState(false);
  const [albumContent, setAlbumContent] = useState(null);
  const [title, setTitle] = useState(routeTitle);
  const [albumSubtitle, setAlbumSubtitle] = useState(null);
  const [musicList, setMusicList] = useState([]);


  useEffect(() => {
    console.log('lbumc>>', albumContent)
  }, [albumContent])

  useEffect(() => {
    getAlbumData();
  }, [token, seriesId, id, fromCheckout]);


  const handleNavigate = (item) => {
    navigation.navigate('AudioPlayer', {
      image: item?.squareArtwork?.document?.newImage,
      imageBgColor: item?.squareArtwork?.document?.imageColur,
      color: item?.bannerArtwork?.document?.imageColur,
      data: item,
      musicItemId: item.id
    })
  };

  //called when pull down refresh is called------
  const onRefresh = async () => {
    setRefreshing(true);
    await getAlbumData();
  };

  //GETTING ALBUM DATA--
  const getAlbumData = async () => {
    if (!isAuthenticated) {
      getAlbumDataWithoutAuth()
    }
    else {
      getAlbumDataWithAuth()
    }
  }

  const getAlbumDataWithoutAuth = async () => {
    try {
      const response = await axiosInstance1.get(
        `${API.albumId}/${seriesId}/${orgId}`
      )
      processAlbumData(response);

      setRefreshing(false);
      setLoading(false);
    }
    catch (err) {
      if (noInternetModalVisible == false) {
        dispatch({
          type: SET_ALERT, payload: {
            setShowAlert: true,
            data: {
              message: 'unable to get album data without auth',
              showCancelButton: true,
              onCancelPressed: () => {
                dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
              },
            }
          }
        }
        )
      }

      setRefreshing(false);
      setLoading(false);
    }
  };

  const getAlbumDataWithAuth = async () => {
    setLoading(true);
    let axiosConfig = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + `${token}`,
      },
    };

    try {
      const response = await axiosInstance1.get(
        `${API.album}/${seriesId}`,
        axiosConfig
      )
      processAlbumData(response);

      setRefreshing(false);
      setLoading(false);
    }
    catch (err) {
      if (noInternetModalVisible == false) {
        dispatch({
          type: SET_ALERT, payload: {
            setShowAlert: true,
            data: {
              message: 'unable to get album data with auth',
              showCancelButton: true,
              onCancelPressed: () => {
                dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
              },
            }
          }
        }
        )
      }

      setRefreshing(false);
      setLoading(false);
    }
  };

  //TO PROCESS ALBUM DATA __
  const processAlbumData = async (response) => {
    const nameList = response.data.data;
    const newList = [];
    if (nameList?.musicList !== null) {
      nameList?.musicList.map((item, index) => {
        if (item.squareArtwork != null) {
          item.squareArtwork.document['newImage'] = `${API.IMAGE_LOAD_URL}/${item.squareArtwork.document.id}?${API_CONSTANT.GRID_SQUARE}`;
        }
        if (item.status == 'PUBLISHED') {
          newList.push(item);
        }
      });
    }
    setAlbumContent(nameList)

    console.log('ALBUM DATA !!!!', newList)
    setMusicList(filterContentForIOS(newList));
    setTitle(nameList?.title)
    setAlbumSubtitle(nameList?.subtitle)
    setMediaBanner(nameList?.squareArtwork.document.path);
    setImageBgColor(nameList?.squareArtwork.document.imageColur);
    setLoading(false);
  }

  const _handleGetAccessButton = async () => {
    await setModalVisible(false);
    setTimeout(() => {
      navigation.navigate('SubscriptionDetails', {
        fromAlbum: true,
        subscriptionPlanIds: albumContent?.subscriptionPlanIds,
      });
    }, 400);
  };

  const _handleLogin = async () => {
    await setModalVisible(false);
    setTimeout(() => {
      navigation.navigate('Auth', {
        screen: 'LoginScreen',
        params: { fromAlbum: true, seriesId: seriesId },
      });
    }, 400);

  };

  const _signUpButton = async () => {
    await setModalVisible(false);
    setTimeout(() => {
      navigation.navigate('Auth', {
        screen: 'RegisterScreen',
        params: { fromAlbum: true, seriesId: seriesId },
      });
    }, 400);

  };

  //modal component
  function Alertmodal() {
    return (
      <Modal
        style={{ flex: 1 }}
        isVisible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        {
          albumContent?.isOneTimePurchase == true && albumContent?.subscriptionPlanIds.length == 0 && albumContent?.albumAccessType !== 'ACCESSREQUIRED' &&
          (
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'center' }}
              activeOpacity={1}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Modal.Container>
                {token !== null ?

                  //one time payment modal with login on platform basis-------------------------
                  Platform.OS == 'ios' ?
                    (
                      <Modal.Body>
                        <View style={{ width: '100%', height: '100%' }}>
                          <Text
                            style={{
                              color:
                                theme == 'DARK'
                                  ? 'black'
                                  : 'white',
                              fontSize: 16,
                              textAlign: 'center',
                            }}
                          >
                            You must be a {orgName} one time paid subscriber to stream this album,pay by downloading{' '}
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
                      </Modal.Body>
                    )
                    :
                    (
                      <Modal.Body>
                        <View style={{ width: '100%', height: '72%' }}>
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
                            You must be a {orgName} one time paid subscriber to stream this album

                          </Text>

                        </View>
                        <Modal.Footer>
                          <CustomButton butttonText={'Buy now'} inputStyle={{ backgroundColor: brandColor, width: '100%', }}
                            onPress={() => {
                              setModalVisible(false);
                              setTimeout(() => {
                                navigation.navigate('Checkout', {
                                  price: `${albumContent?.price}`,
                                  fromAlbum: true,
                                  itemId: seriesId
                                })

                              }, 400);


                            }}
                          />
                        </Modal.Footer>
                      </Modal.Body>
                    )
                  :
                  (
                    <Modal.Body>
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
                          You must be a {orgName} one time paid subscriber to stream this album

                        </Text>

                      </View>
                      <Modal.Footer>
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
                      </Modal.Footer>
                    </Modal.Body>
                  )
                }
              </Modal.Container>
            </TouchableOpacity>
          )

        }
        {
          (albumContent?.albumAccessType == 'ACCESSREQUIRED' || (albumContent?.albumAccessType == 'PAID' && albumContent?.subscriptionPlanIds.length > 0)) &&
          (
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'center' }}
              activeOpacity={1}
              onPress={() => {
                setModalVisible(false);
              }}
            >

              {isAuthenticated &&
                (albumContent?.subscriptionPlanIds.includes(id) ? (
                  Platform.OS == 'ios' ? (

                    //without payment user in ios-------------------------------------------
                    <Modal.Container>
                      <Modal.Body>
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
                            To watch this paid album, subscribe by downloading{' '}
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
                      </Modal.Body>
                    </Modal.Container>
                  ) : (

                    //withlogin without paymentdone  modal for android------------------------------
                    <Modal.Container>
                      <Modal.Body>
                        <Text
                          style={{
                            ...styles.textColorWhite,
                            color:
                              theme == 'DARK'
                                ? 'black'
                                : 'white',
                            textAlign: 'center',
                          }}
                        >
                          You must be a {orgName} subscriber to stream this album
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
                              color:
                                theme == 'DARK'
                                  ? 'black'
                                  : 'white',
                            }}
                          >
                            Get Access Now
                          </Text>
                        </TouchableOpacity>
                      </Modal.Body>
                    </Modal.Container>
                  )
                ) : Platform.OS == 'ios' ? (

                  //registered or login user without required plan to watch album ios---------------------------------
                  <Modal.Container>
                    <Modal.Body>
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
                          You must be a {orgName} subscriber to stream this album, subscribe by downloading{' '}
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
                    </Modal.Body>
                  </Modal.Container>
                ) : (

                  //registered or logged in user without required plan to watch album android-------------------------------
                  <Modal.Container>
                    <Modal.Body>
                      <View style={{ alignItems: 'center' }}>
                        <Text
                          style={{
                            textAlign: 'center',
                            color:
                              theme == 'DARK'
                                ? 'black'
                                : 'white',
                            fontSize: scale(16),
                            textAlign: 'center',
                          }}
                        >
                          You must be a {orgName} subscriber to stream this album
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
                    </Modal.Body>
                  </Modal.Container>
                ))}
              {!isAuthenticated &&
                (albumContent?.albumAccessType == 'PAID' ? (
                  Platform.OS == 'ios' ? (

                    //without login user paid album ios--------------------------------------------------------
                    <Modal.Container>
                      <Modal.Header />
                      <Modal.Body>
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
                            You must be a {orgName} subscriber to stream this album
                          </Text>
                        </View>
                        <Modal.Footer>
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
                        </Modal.Footer>
                      </Modal.Body>
                    </Modal.Container>
                  ) : (

                    //without login paid album android-------------------------------------------------------------
                    <Modal.Container>
                      <Modal.Header />
                      <Modal.Body>
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
                            You must be a {orgName} subscriber to stream this album
                          </Text>
                        </View>
                        <Modal.Footer>
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
                        </Modal.Footer>
                      </Modal.Body>
                    </Modal.Container>
                  )
                ) : Platform.OS == 'ios' ? (
                  //access required album ios
                  <Modal.Container>
                    <Modal.Body>
                      <Text style={{
                        fontSize: scale(16),
                        color: theme == 'DARK'
                          ? 'black'
                          : 'white',
                        textAlign: 'center',
                      }}>
                        You must be a {orgName} subscriber to stream this free album
                      </Text >
                      <Modal.Footer>
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
                      </Modal.Footer>
                    </Modal.Body>
                  </Modal.Container>
                ) : (
                  //access required album android
                  <Modal.Container>
                    <Modal.Body>
                      <Text style={{
                        fontSize: scale(16),
                        color:
                          theme == 'DARK'
                            ? 'black'
                            : 'white',
                        textAlign: 'center',
                      }}>
                        You must be a {orgName} subscriber to stream this free album
                      </Text >
                      <Modal.Footer>
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
                      </Modal.Footer>
                    </Modal.Body>
                  </Modal.Container>
                ))}
            </TouchableOpacity>
          )
        }
      </Modal>
    );
  }

  //this is called when we press the  play button
  const _handlePlayButton = (item) => {
    if (albumContent?.albumAccessType == 'FREE' || (albumContent?.albumAccessType == "ACCESSREQUIRED" && isAuthenticated)) {
      handleNavigate(item)
    }
    else {
      if (Platform.OS == 'android') {
        if (albumContent?.albumAccessType == "ACCESSREQUIRED") {
          if (!isAuthenticated) {
            setModalVisible(true);
          } else {
            handleNavigate(item);
          }
        } else if (albumContent?.albumAccessType == 'PAID') {
          if ((albumContent?.subscriptionPlanIds?.includes(id) && isPaymentDone) || albumContent?.isOneTimePurchasePaymentDone == true) {
            handleNavigate(item);
          } else {
            setModalVisible(true);
          }
        } else {
          setModalVisible(true)
        }
      } else {
        if (albumContent?.albumAccessType !== 'FREE' && !isAuthenticated) {
          return dispatch({ type: SET_ACCESS_MODAL_IOS, payload: true });
        }
        else if (albumContent?.albumAccessType == 'FREE' ||
          (albumContent?.albumAccessType == 'ACCESSREQUIRED' && isAuthenticated) ||
          (albumContent?.albumAccessType == 'PAID' && albumContent?.isOneTimePurchasePaymentDone == true) ||
          (albumContent?.albumAccessType == 'PAID' && albumContent?.subscriptionPlanIds?.includes(id)) && isPaymentDone) {
          handleNavigate(item);
          return;
        } else {
          console.log('   ');
          dispatch({ type: SET_SUB_PLAN_IDS, payload: albumContent?.subscriptionPlanIds })
          return dispatch({ type: SET_IOSCOMP, payload: true })
        }
      }
    }

  };


  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          theme == 'DARK'
            ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
            : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
      }}
    >
      {
        Platform.OS == 'android' ?
          isFocused &&
          <LinearGradient
            style={{ height: StatusBar.currentHeight }}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            colors={[shadeColor(imageBgColor, -80), shadeColor(imageBgColor, -55)]}
          >
            <StatusBar translucent backgroundColor={'transparent'} />
          </LinearGradient >
          :
          isFocused && <StatusBar translucent backgroundColor={imageBgColor} />
      }

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: '100%' }}
        refreshControl={
          <RefreshControl
            tintColor={'gray'}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View
          style={{
            flex: 1,
            position: 'relative',
            backgroundColor:
              theme == 'DARK'
                ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
                : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
          }}
        >
          <Loader loading={loading} />

          {/* HEADER COMPONENT BLURRED START */}
          <BlurredHeader color={color} bannerImg={MediaBanner} type={"WIDE"} screen={'mediaItem'} />
          {/* Header component BLURRED END */}


          {/* BACK ARROW ON THE TOP */}
          <SafeAreaView
            edges={['top']}
            style={{
              position: 'absolute',
              zIndex: 2,
              flexDirection: 'row',
              width: width,
              justifyContent: 'space-between',
              paddingHorizontal: moderateScale(15),
              alignItems: 'center',
              height: moderateVerticalScale(70)
            }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
            >
              <AntDesign name={'arrowleft'} size={22} color={'#fff'} />
            </TouchableOpacity>

            <View style={{
              marginRight: 15
            }}>
              {/* <TouchableOpacity onPress={() => { _handlePlayButton() }}>
                <Text

                  style={{
                    color: '#fff',
                    fontFamily: ThemeConstant.FONT_FAMILY,
                    fontSize: 17,
                    fontWeight: 'bold'
                  }}>
                  {albumContent ?
                    Platform.OS == 'android' ?
                      albumContent?.isOneTimePurchase && !albumContent?.isOneTimePurchasePaymentDone && albumContent?.subscriptionPlanIds.length == 0 ? '' : 'PLAY'
                      : 'PLAY'
                    : ''
                  }
                </Text>
              </TouchableOpacity> */}
            </View>

          </SafeAreaView>

          {/* HEADER WIDE IMAGE START */}
          <View style={{
            width: '100%',
            marginTop: moderateVerticalScale(-190),
            marginBottom: moderateVerticalScale(10),
            position: 'relative',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Image
              source={{ uri: MediaBanner }}
              style={{
                backgroundColor: color,
                width: '60%',
                aspectRatio: 1 / 1,
                alignSelf: 'center',
                borderRadius: scale(10)
              }}
            />
            {/* <TouchableOpacity activeOpacity={0.8} onPress={_handlePlayButton} style={styles.iconView}> */}
            {/* <PlayIcon
                name="headset-sharp"
                size={34}
                color="#fff"
                style={styles.iconStyle}
              />
            </TouchableOpacity> */}
          </View>
          {/* HEADER WIDE IMAGE STOP */}

          {/* TEXT COMPONENT */}
          <View style={styles.detailsContainer}>
            <View style={styles.titleTextContainer}>
              <Text
                style={{
                  ...styles.titleText,
                  color:
                    theme == 'DARK'
                      ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                      : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                }}
              >
                {title}
                {/* Complete Salvation Part 3 */}
              </Text>
            </View>

            {albumSubtitle ? (
              <View style={styles.subtitleContainer}>
                <Text
                  style={{
                    ...styles.subtitleText,
                    color:
                      theme == 'DARK'
                        ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                        : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                  }}
                >
                  {albumSubtitle}
                  {/* with Rochelle L. Avalos */}
                </Text>
              </View>
            ) : null}
          </View>

          {/* TEXT COMPONENT END */}

          {/* THIS IS ONE TIME PURCHASE BUTTON */}
          {
            Platform.OS == 'android' && albumContent && albumContent?.isOneTimePurchase && !albumContent?.isOneTimePurchasePaymentDone && !albumContent.subscriptionPlanIds.includes(id) &&
            <CustomButton
              onPress={() => {
                if (Platform.OS == 'android') {
                  if (isAuthenticated) {
                    navigation.navigate('Checkout', {
                      price: `${albumContent?.price}`,
                      fromAlbum: true,
                      itemId: seriesId
                    })
                  } else {
                    navigation.navigate('Auth', {
                      screen: 'RegisterScreen',
                      params: {
                        type: 'ALBUM',
                        fromAlbumOTP: true,
                        price: `${albumContent?.price}`,
                        itemId: seriesId,
                      },
                    })
                  }
                } else {
                  setModalVisible(true)
                }
              }
              }
              butttonText={`Buy item $${albumContent?.price}`}
              inputStyle={{
                marginHorizontal: ThemeConstant.MARGIN_EXTRA_LARGE,
                marginBottom: 0,
                marginTop: ThemeConstant.MARGIN_EXTRA_LARGE,
                backgroundColor: brandColor,
              }} />
          }
          <FlatList
            data={musicList}
            contentContainerStyle={{ marginTop: ThemeConstant.MARGIN_EXTRA_LARGE }}
            keyExtractor={item => `${item?.createdDate}_${item.id}`}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  onPress={() => {
                    _handlePlayButton(item);
                  }
                  }
                >
                  <View
                    style={{
                      ...STYLES.card,
                      backgroundColor:
                        theme == "DARK"
                          ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
                          : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
                      flex: 1,
                      flexDirection: "row",
                      borderBottomWidth: theme == "DARK" ? 0.7 : 1.4,
                      borderBottomColor:
                        theme == "DARK" ? ThemeConstant.BORDER_COLOR_BETA : "#f7f8fa",
                    }}
                  >

                    {/* NUMBERS COMPONENT IF TYPE IS ALBUM */}
                    {/* {type == "ALBUM" ? (
                      <Text
                        style={{
                          ...STYLES.counter,
                          width: moderateScale(30),
                          color:
                            theme == "DARK"
                              ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                              : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                        }}
                      >
                        {index + 1}
                      </Text>
                    ) : null} */}

                    {/* IMAGE COMPOENNT ON THE CARD */}
                    <View
                      style={{
                        backgroundColor: item?.squareArtwork?.document?.imageColur,
                        ...STYLES.itemImageContainer, overflow: 'hidden'
                      }}
                    >
                      <FastImage
                        style={STYLES.itemImage}
                        source={{ uri: item.squareArtwork?.document?.newImage }}
                        resizeMode={FastImage.resizeMode.contain}
                      />
                      {item.liveStatus == 'LIVE' &&
                        <CustomButton
                          butttonText={'Live'}
                          btnTextStyle={{ fontSize: 13 }}
                          inputStyle={{ position: 'absolute', borderRadius: 5, top: 8, right: 8, backgroundColor: 'red', height: moderateScale(18), width: moderateScale(30) }}

                        />
                      }
                    </View>

                    {/* TEXT COMPONENT ON THE CARD */}
                    <View style={STYLES.textContaier}>
                      <Text
                        numberOfLines={1}
                        style={{
                          color:
                            theme == "DARK"
                              ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                              : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                          ...STYLES.title,
                        }}
                      >
                        {item.title}
                      </Text>
                      {
                        item?.artist
                        && <Text numberOfLines={1} style={STYLES.subtitle}>
                          {item.artist}
                        </Text>
                      }

                    </View>
                  </View>
                </TouchableOpacity>

              )

            }}
          />
        </View>
      </ScrollView>

      {Alertmodal()}

    </View>
  );
};

const STYLES = StyleSheet.create({
  fullStrech: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  headerContainer: {
    width: "100%",
    aspectRatio: 1920 / 692,
  },
  headerImage: {
    width: "100%",
    aspectRatio: 1920 / 692,
  },
  itemImageContainer: {
    borderRadius: 10,
    height: 80,
  },
  itemImage: {
    aspectRatio: 1 / 1,
    height: "100%",
  },
  counter: {
    fontSize: 25,
    marginLeft: 5,
    marginRight: 15,
    justifyContent: "center",
    opacity: 0.5,
    fontFamily: ThemeConstant.FONT_FAMILY,
  },
  card: {
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: ThemeConstant.PADDING_NORMAL,
  },
  textContaier: {
    marginLeft: ThemeConstant.MARGIN_NORMAL,
    flex: 1,
    flexWrap: "wrap",
    // borderWidth: 1
  },
  title: {
    fontWeight: "bold",
    fontSize: ThemeConstant.TEXT_SIZE_LARGE,
    width: "100%",
  },
  subtitle: {
    fontSize: ThemeConstant.TEXT_SIZE_MEDIUM,
    letterSpacing: 1,
    marginRight: ThemeConstant.MARGIN_TINNY,
    color: ThemeConstant.TEXT_COLOR_SUBTEXTS,
    width: "100%",
  },
})

export default AlbumDetail;
