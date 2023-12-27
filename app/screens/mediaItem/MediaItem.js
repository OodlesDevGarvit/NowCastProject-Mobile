import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, RefreshControl, Platform, PermissionsAndroid, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useIsFocused } from '@react-navigation/native';
import { moderateVerticalScale } from 'react-native-size-matters';
import { useSelector, useDispatch } from 'react-redux';
import { moderateScale, scale } from 'react-native-size-matters';
import { useFocusEffect } from '@react-navigation/native';
import { axiosInstance1 } from '../../constant/Auth';
import { OpenUrl } from '../../services/TabDesignsService';
import { Modal } from '../../components/Modal';
import { STORE_DOWNLOADS, SET_ACCESS_MODAL_IOS, SET_IOSCOMP, UPDATE_CAST_URL, SET_ALERT, LOGIN_FAILED, SET_SUB_PLAN_IDS } from '../../store/actions/types';
import { castController } from '../../services/ChromeCast';
import { cacheDoc } from '../../utils/caching';
import { insertConversationService } from '../../../operations';
import { shadeColor } from '../../utils/shadeColor';
import { store } from '../../store/store';
import LinearGradient from 'react-native-linear-gradient';
import BlurredHeader from '../../components/common/BlurredHeader';
import FastImage from 'react-native-fast-image';
import PlayIcon from 'react-native-vector-icons/FontAwesome';
import Icons from 'react-native-vector-icons/Ionicons';
// import Orientation from 'react-native-orientation';
import Orientation from 'react-native-orientation-locker';

import Share from 'react-native-share';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FileViewer from "react-native-file-viewer";
import ThemeConstant, { DynamicThemeConstants } from '../../constant/ThemeConstant';
import Loader from '../../components/Loader';
import GetIcon from '../../services/IconBasedOnId';
import styles from './Styles';
import CustomButton from '../../components/CustomButton';
import RNFetchBlob from 'rn-fetch-blob';
import RNEncryptionModule from "@dhairyasharma/react-native-encryption";
import * as API_CONSTANT from '../../constant/ApiConstant';
import * as API from '../../constant/APIs';


const LIVE_STATUS = {
  ENDED: "finished",
  CREATED: "created",
  BROADCASTING: "broadcasting"
}

const MediaItem = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const downloads = store.getState().brandingReducer.downloads
  const fromCheckout = route.params?.fromCheckout
  //routes data--------------
  const { mobileTheme: theme, subdomain: subDomain, brandColor, website: websiteName, organizationName: orgName } = useSelector((state) => state.brandingReducer.brandingData);
  const { token, isPaymentDone, isAuthenticated, userId, user, subscription: { id }, userCards } = useSelector(state => state.authReducer);
  const { basicInfo: { firstName, lastName, email, mobileNumber } = { firstName: null, lastName: null, mobileNumber: null } } = user ?? {};
  const { mediaItemId, color } = route?.params;
  const { client } = useSelector(state => state.castReducer);
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const [videoContent, setVideoContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [MediaBanner, setMediaBanner] = useState(null);
  const [imageBgColor, setImageBgColor] = useState(color);
  const [modalVisible, setModalVisible] = useState(false);
  const [dowanloadText, setDownloadText] = useState('Download');
  const [showShare, setShowShare] = useState(false);
  const [videoTitle, setVideoTitle] = useState(null);
  const [videoSubtitle, setVideoSubtitle] = useState(null);
  const [videoDateText, setVideodateText] = useState(null);
  const [videoDescription, setVideoDescription] = useState(null);
  const [speaker, setSpeaker] = useState(null);
  const [webUrl, setWebUrl] = useState(null);
  const [webBtntext, setWebBtnText] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('Document');
  const [documentDetail, setDocumentDetail] = useState();
  const [numberOfLine, setNumberOflines] = useState(3);
  const [showReadMore, setShowReadMore] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [modalVisibleNoStream, setModalVisisbleNoStream] = useState(false)
  const [showDownloads, setShowDownloads] = useState(true)
  const [videoDownloaded, setVideoDownloaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [indeterminate, setInterminate] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  // DOING SOME STUFF WHEN SCREEN IS FOCUS
  useFocusEffect(
    React.useCallback(async () => {
      Orientation.lockToPortrait();
    })
  )

  useFocusEffect(
    React.useCallback(() => {
      getData()
    }, [isAuthenticated])
  )

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: imageBgColor,
        shadowColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: imageBgColor,
      },
    });
  }, [imageBgColor]);


  useEffect(() => {
    if (videoContent?.id !== null) {
      downloadCheck(videoContent?.id)
    }
  }, [videoContent])


  useEffect(() => {
    getData();
  }, [token, mediaItemId, id, fromCheckout]);

  useEffect(() => {
    showDownloadsButton()
  }, [videoContent, token, mediaItemId, id, fromCheckout])

  useEffect(() => {
    if (isAuthenticated) {
      setCardData(userCards[0])
      console.log('card data is', cardData);
    }
  }, [])


  //TO HANDLE PDF IN RELEVENT APPS-
  const _handleOpenPdf = async () => {
    await setLoading(true);
    const path = await cacheDoc(documentDetail?.path, 'pdf');
    await FileViewer.open(path);
    await setLoading(false);
  }


  const checkPermission = async (url) => {
    if (Platform.OS === 'ios') {
      setLoading(true);
      downloadFile(url);
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Permission Required',
            message: 'Please allow access to gallery',
            buttonPositive: "OK"
          }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log(url)
          downloadFile(url);
        }
        else {
          Alert.alert("Permissions required", "Please allow permissions to access your files and media", [
            {
              text: "Open Settings",
              style: { fontSize: 12 },
              onPress: async () => {
                {
                  openSettings().catch(() => console.warn('cannot open settings'));
                }
              }
            },
            {
              text: CANCEL,
              style: { fontSize: 12 },
              onPress: () => {
                console.log("daring on press")
              }
            }
          ],
            {
              cancelable: true
            }
          )
        }
      } catch (error) {
        console.warn(error);
      }
    }


  }

  const downloadFile = async (urlNeed) => {
    setLoading(true)
    setIsDownloading(true)
    // let ext = /[.]/.exec(urlNeed) ? /[^.]+$/.exec(urlNeed) : undefined;
    // ext = '.' + ext[0];
    console.log('rnfetch blob', RNFetchBlob.fs);
    let date = new Date();
    const id = Math.floor(date.getTime() + date.getSeconds())
    const fileName = videoTitle
    console.log('file name is video title and ext', fileName);

    const fPath = RNFetchBlob.fs.dirs.DownloadDir + `/` + fileName;

    RNFetchBlob.config({
      fileCache: false,
      overwrite: true,
      trusty: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: false,
        path: fPath,
        mediaScannable: true
      }
    })
      .fetch('GET', urlNeed)
      // .progress((received, total) => {
      //   console.log("progress----");
      // })
      .then(res => {
        console.log(res, "singlas")
        RNEncryptionModule.encryptFile(
          res.data,
          RNFetchBlob.fs.dirs.DownloadDir + `/.NowCastDownloads/` + fileName,
          "password"
        ).then((res) => {
          console.log("Encryption Success Response", res)
          if (res.status == "success") {
            insertConversationService(id, fileName, date, 'Video', res.iv, res.salt, videoContent?.squareArtwork?.document.path, userId, videoContent?.id)
            setVideoDownloaded(true)
            dispatch({
              type: STORE_DOWNLOADS, payload: [
                {
                  id: id,
                  fileName: fileName,
                  createdAt: date,
                  type: 'Video',
                  iv: res.iv,
                  baseId: res.salt,
                  imagePath: videoContent?.squareArtwork?.document.path,
                  userid: userId,
                  mediaItemId: videoContent?.id,
                }
              ]
            })
            setLoading(false);
            setIsDownloading(false)
            dispatch({
              type: SET_ALERT, payload: {
                setShowAlert: true,
                data: {
                  message: 'Download successful. Go to side menu > Downloads to play the downloaded video.',
                  showCancelButton: true,
                  cancelText: 'OK',
                  onCancelPressed: () => {
                    dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                  },
                }
              }
            })
            RNFetchBlob.fs.unlink(fPath)
              .then(() => {
                console.log("Deleted ")
                // RNFetchBlob.fs.ls(RNFetchBlob.fs.dirs.DownloadDir + `/Encrypted/`)
                //   // files will an array contains filenames
                //   .then((files) => {
                //     console.log(files)
                //     setVedioAvailable(files)
                //   })
              })
              .catch((err) => { console.log("Encrptiion Errroe", err) })
          } else {
            console.log("error", res);
          }
        }).catch((err) => {
          setLoading(false)
          setIsDownloading(false)
          dispatch({
            type: SET_ALERT, payload: {
              setShowAlert: true,
              data: {
                message: 'Error! Try making some space in device memory or Please try again after sometime',
                showCancelButton: true,
                cancelText: 'OK',
                onCancelPressed: () => {
                  dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                },
              }
            }
          })
          RNFetchBlob.fs.unlink(fPath)
            .then(() => {
              console.log("Deleted Encrypted File")
            })
            .catch((err) => { console.log(err) })
          RNFetchBlob.fs.unlink(RNFetchBlob.fs.dirs.DownloadDir + `/Encrypted${fileName}`)
            .then(() => {
              console.log("Deleted Encrypted File")
            })
            .catch((err) => { console.log(err) })
          console.log(err);
        });
      })
      .catch((errorMessage, statusCode) => {
      });
  }



  //TO GET BROADCASTING STATUS FROM ANT MEDIA
  const getBroadcastingStatus = async () => {
    try {
      const res = await axiosInstance1.get(`${API.getBroadcastStatus}/${mediaItemId}`);
      console.log('res while getting broadcasting status>>', res?.data?.data);
      if (res.data.data?.status == LIVE_STATUS.BROADCASTING) {
        return LIVE_STATUS.BROADCASTING;
      } else if (res.data.data?.status == LIVE_STATUS.ENDED) {
        return LIVE_STATUS.ENDED;
      } else if (res.data.data?.status == LIVE_STATUS.CREATED) {
        return LIVE_STATUS.CREATED;
      }
    }
    catch (err) {
      console.log('error while getting braoadcasting status', err.response);
    }
  };



  //called on press of share button---------------------------------
  const myShare = () => {
    const shareOptions = {
      message: `${videoTitle}\nhttps://${subDomain}/video/${mediaItemId}`,
    };
    try {
      const ShareResponse = Share.open(shareOptions);
    } catch (error) {
      console.log("Error while sharing =====>", error);
    }
  };

  //format date string-----
  const formatDate = (date) => {
    let formatedDate = format(new Date(date), 'MMMM dd, yyyy');
    return formatedDate;
  };

  //called when pull down refresh is called------
  const onRefresh = async () => {
    setRefreshing(true);
    await getData();
  };

  ///////////////////////////////////////

  //to get the video data from the api
  const getData = async () => {
    if (isAuthenticated) {
      getItemDataWithAuth();
    } else {
      getItemDataWithoutAuth();
    }
  };

  const showDownloadsButton = () => {
    if (videoContent?.downloads == true) {
      if (videoContent?.isVideoAvailable == true) {
        if (videoContent?.mediaAccessType == 'FREE' || (videoContent?.mediaAccessType == 'ACCESSREQUIRED' && isAuthenticated)) {
          setShowDownloads(true)
        }
        else {
          if (videoContent?.mediaAccessType == 'ACCESSREQUIRED') {
            if (!isAuthenticated) {
              setShowDownloads(false)
            } else {
              setShowDownloads(true)
            }
          } else {
            if (videoContent?.subscriptionPlanIds.includes(id) || videoContent?.isOneTimePurchasePaymentDone == true) {

              if (videoContent?.videoDTO !== null || videoContent?.videoUrl !== null) {
                setShowDownloads(true)
              } else {
                setShowDownloads(false)
              }
            } else {
              setShowDownloads(false)
            }
          }
        }

      } else {
        setShowDownloads(false)
      }
    } else {
      setShowDownloads(false)
    }

  }

  const getItemDataWithoutAuth = async () => {
    try {
      const response = await axiosInstance1.get(
        `/mediaItem/mediaItemId/${mediaItemId}?organizationId=${orgId}`
      );
      if (response.status == 200) {
        const nameList = response.data.data;
        console.log('data without auth>>', nameList)
        setVideoTitle(nameList?.title);
        setVideoSubtitle(nameList?.subTitle);
        setVideodateText(nameList?.date);
        setVideoDescription(nameList?.description);
        setWebUrl(nameList?.webLinkDTO?.link);
        setWebBtnText(nameList?.webLinkDTO?.title);
        setSpeaker(nameList?.speaker);
        setDocumentTitle(
          nameList.documentTitle ? nameList.documentTitle : 'Document'
        );
        setDocumentDetail(nameList?.document);

        if (nameList.wideArtwork != null) {
          nameList.wideArtwork.document[
            'banner'
          ] = `${API.IMAGE_LOAD_URL}/${nameList.wideArtwork.document.id}?${API_CONSTANT.WIDE_IMAGE_HEIGHT_WIDTH}`;
          setMediaBanner(nameList.wideArtwork.document.banner);
          setImageBgColor(nameList.wideArtwork.document.imageColur);
        }
        if (nameList.squareArtwork != null) {
          nameList.squareArtwork.document[
            'square'
          ] = `${API.IMAGE_LOAD_URL}/${nameList.squareArtwork.document.id}?${API_CONSTANT.SQUARE_IMAGE_HEIGHT_WIDTH}`;
        }
        setShowShare(true)
        setVideoContent(nameList);
        setLoading(false);
        setRefreshing(false)
      }
    } catch (err) {
      console.log('error while getting data without auth', err);
      setLoading(false);
      setRefreshing(false)
    }
  };

  const getItemDataWithAuth = async () => {
    let axiosConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + `${token}`,
      },
    };
    try {
      const response = await axiosInstance1.get(
        `/mediaItem/${mediaItemId}`,
        axiosConfig
      );
      if (response.status == 200) {
        const nameList = response.data.data;
        console.log('data with auth>>', nameList)
        setVideoTitle(nameList?.title);
        setVideoSubtitle(nameList?.subTitle);
        setVideodateText(nameList?.date);
        setVideoDescription(nameList?.description);
        setWebUrl(nameList?.webLinkDTO?.link);
        setWebBtnText(nameList?.webLinkDTO?.title);
        setSpeaker(nameList?.speaker);
        setDocumentTitle(
          nameList?.documentTitle ? nameList?.documentTitle : 'Document'
        );
        setDocumentDetail(nameList?.document);

        if (nameList.wideArtwork != null) {
          nameList.wideArtwork.document[
            'banner'
          ] = `${API.IMAGE_LOAD_URL}/${nameList.wideArtwork?.document.id}?${API_CONSTANT.WIDE_IMAGE_HEIGHT_WIDTH}`;
          setMediaBanner(nameList.wideArtwork?.document.banner);
          setImageBgColor(nameList.bannerArtwork?.document.imageColur);
        }
        if (nameList.squareArtwork != null) {
          nameList.squareArtwork.document[
            'square'
          ] = `${API.IMAGE_LOAD_URL}/${nameList.squareArtwork?.document.id}?${API_CONSTANT.SQUARE_IMAGE_HEIGHT_WIDTH}`;
        }

        // console.log("video content is withlogin---------------:", nameList);
        setShowShare(true)
        setVideoContent(nameList);
        setLoading(false);
        setRefreshing(false)
      }
    } catch (err) {
      setLoading(false);
      setRefreshing(false)
      console.log('error while getting data with auth', err);
    }
  };

  const downloadCheck = () => {
    setVideoDownloaded(false)
    downloads.forEach((item) => {
      let videoId = parseInt(item.mediaItemId, 10)
      if (isAuthenticated) {
        if (videoId == videoContent?.id && item.userid == userId) {
          console.log(videoId, videoContent?.id);
          setVideoDownloaded(true)
        }
      } else {
        if (videoId == videoContent?.id) {
          setVideoDownloaded(true)
        }
      }
    });
  }



  const onTextLayout = useCallback((e) => {
    setShowReadMore(e.nativeEvent.lines.length >= 3);
  }, []);

  const _handleGetAccessButton = async () => {
    await setModalVisible(false);
    setTimeout(() => {
      navigation.navigate('SubscriptionDetails', {
        fromItem: true,
        subscriptionPlanIds: videoContent?.subscriptionPlanIds,
      });
    }, 400);

  };

  const _handleLogin = async () => {
    await setModalVisible(false);
    setTimeout(() => {
      navigation.navigate('Auth', {
        screen: 'LoginScreen',
        params: { fromItem: true, mediaItemId: mediaItemId },
      });
    }, 400);

  };

  const _signUpButton = async () => {
    await setModalVisible(false);
    setTimeout(() => {
      navigation.navigate('Auth', {
        screen: 'RegisterScreen',
        params: { fromItem: true, mediaItemId: mediaItemId },
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
          videoContent?.isOneTimePurchase == true && videoContent?.subscriptionPlanIds.length == 0 && videoContent?.mediaAccessType !== 'ACCESSREQUIRED' &&
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
                        <View style={{ width: '90%', height: '80%' }}>
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
                            You must be a {orgName} one time paid subscriber to stream this video,pay by downloading{' '}
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
                            You must be a {orgName} one time paid subscriber to stream this video

                          </Text>

                        </View>
                        <Modal.Footer>
                          <CustomButton butttonText={'Buy now'} inputStyle={{ backgroundColor: brandColor, width: '100%', }}
                            onPress={() => {
                              setModalVisible(false);
                              setTimeout(() => {
                                navigation.navigate('Checkout', {
                                  price: videoContent?.price,
                                  fromItem: true,
                                  itemId: mediaItemId
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
                          You must be a {orgName} one time paid subscriber to stream this video

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
          (videoContent?.mediaAccessType == 'ACCESSREQUIRED' || (videoContent?.mediaAccessType == 'PAID' && videoContent?.subscriptionPlanIds.length > 0)) &&
          (
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'center' }}
              activeOpacity={1}
              onPress={() => {
                setModalVisible(false);
              }}
            >

              {isAuthenticated &&
                (videoContent?.videoDTO == null && videoContent?.subscriptionPlanIds.includes(id) ? (
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
                            To watch this paid video, subscribe by downloading{' '}
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
                          You must be a {orgName} subscriber to stream this video
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

                  //registered or login user without required plan to watch video ios---------------------------------
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
                          You must be a {orgName} subscriber to stream this video, subscribe by downloading{' '}
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

                  //registered or logged in user without required plan to watch video android-------------------------------
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
                          You must be a {orgName} subscriber to stream this video
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
                (videoContent?.mediaAccessType == 'PAID' ? (
                  Platform.OS == 'ios' ? (

                    //without login user paid video ios--------------------------------------------------------
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
                            You must be a {orgName} subscriber to stream this video
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

                    //without login paid video android-------------------------------------------------------------
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
                            You must be a {orgName} subscriber to stream this video
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
                  //access required video ios
                  <Modal.Container>
                    <Modal.Body>
                      <Text style={{
                        fontSize: scale(16),
                        color: theme == 'DARK'
                          ? 'black'
                          : 'white',
                        textAlign: 'center',
                      }}>
                        You must be a {orgName} subscriber to stream this free video
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
                  //access required video android
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
                        You must be a {orgName} subscriber to stream this free video
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
  const _handleVideoPlayButton = async () => {

    const videoUrl = videoContent?.videoDTO !== null
      ? videoContent?.videoDTO?.path?.trim()
      : videoContent?.videoUrl?.trim();
    if (videoContent?.liveStreamDataDTO !== null) {
      const live = await getBroadcastingStatus();
      console.log('live', live)
      const liveType = videoContent?.liveStreamDataDTO?.videoLiveType;
      if (live == LIVE_STATUS.CREATED) {
        setModalVisisbleNoStream(true)
        return;
      } else if (live == LIVE_STATUS.ENDED) {
        navigation.navigate('VideoPlayer', {
          data: videoContent,
          title: videoContent?.title,
          image: MediaBanner,
        });
        return;
      }
      navigation.navigate('VideoPlayer', {
        data: videoContent,
        title: videoContent?.title,
        image: MediaBanner,
        live: true,
        liveType,
        fromLive: true
      });
    }
    else if (videoContent?.isVideoAvailable == true) {
      if (videoContent?.mediaAccessType == 'FREE' || (videoContent?.mediaAccessType == 'ACCESSREQUIRED' && isAuthenticated)) {
        dispatch({ type: UPDATE_CAST_URL, payload: videoUrl })
        castController(client, videoUrl);
        navigation.navigate('VideoPlayer', {
          data: videoContent,
          title: videoContent?.title,
          image: MediaBanner,
        });
      }
      else if (Platform.OS == 'android') {
        if (videoContent?.mediaAccessType == 'ACCESSREQUIRED') {
          if (!isAuthenticated) {
            setModalVisible(true);
          } else {
            dispatch({ type: UPDATE_CAST_URL, payload: videoUrl })
            castController(client, videoUrl);
            navigation.navigate('VideoPlayer', {
              data: videoContent,
              title: videoContent?.title,
              image: MediaBanner,
            });
          }
        } else {
          if ((videoContent?.subscriptionPlanIds.includes(id) && isPaymentDone) || videoContent?.isOneTimePurchasePaymentDone == true) {
            if (videoContent?.videoDTO !== null || videoContent?.videoUrl !== null) {
              dispatch({ type: UPDATE_CAST_URL, payload: videoUrl })
              castController(client, videoUrl);
              navigation.navigate('VideoPlayer', {
                data: videoContent,
                title: videoContent?.title,
                image: MediaBanner,
              });
            } else {
              // alert('payment is pending')
              setModalVisible(true);
            }
          } else {
            setModalVisible(true);
          }
        }
      }
      else {
        if (videoContent?.mediaAccessType !== 'FREE' && !isAuthenticated) {
          return dispatch({ type: SET_ACCESS_MODAL_IOS, payload: true });
        }
        else if (videoContent?.mediaAccessType == 'FREE' ||
          (videoContent?.mediaAccessType == 'ACCESSREQUIRED' && isAuthenticated) ||
          (videoContent?.mediaAccessType == 'PAID' && videoContent?.isOneTimePurchasePaymentDone == true) ||
          (videoContent?.mediaAccessType == 'PAID' && videoContent?.subscriptionPlanIds?.includes(id) && isPaymentDone)) {
          navigation.navigate('VideoPlayer', {
            data: videoContent,
            title: videoContent?.title,
            image: MediaBanner,
          });
          return;
        } else {
          console.log('   ');
          dispatch({ type: SET_SUB_PLAN_IDS, payload: videoContent?.subscriptionPlanIds })
          return dispatch({ type: SET_IOSCOMP, payload: true })
        }
      }

    } else {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Video is not available for this item',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
    }
  };

  const TextComponent = () => {
    return (
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
            {videoTitle}
            {/* Complete Salvation Part 3 */}
          </Text>
        </View>

        {videoSubtitle ? (
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
              {videoSubtitle}
              {/* with Rochelle L. Avalos */}
            </Text>
          </View>
        ) : null}

        <View style={styles.dateTextContainer}>
          {videoDateText && <Text style={styles.dateText}>{formatDate(videoDateText)}</Text>}

          {speaker ? (
            <>
              {videoDateText && <Text style={styles.dateText}>{'.'}</Text>}
              <Text style={styles.dateText}>{speaker}</Text>
            </>
          ) : null}
        </View>

      </View>
    );
  };

  //every single button that is in the center as (Downloads , Take a note , Share)
  const CenterButton = ({
    iconName,
    name,
    onPress,
    styleContainer,
    styleItem,
  }) => {
    return (
      <View style={styleContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styleItem}
          onPress={onPress}
        >
          <Icons
            name={iconName}
            size={ThemeConstant.ICON_SIZE_TINNY}
            color={ThemeConstant.ICONS_COLOR_DARK}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: ThemeConstant.FONT_FAMILY,
            color:
              theme == 'DARK'
                ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
          }}
        >
          {name}
        </Text>
      </View>
    );
  };

  const ButtonsContainer = () => {
    return (
      <View style={styles.buttonsContainer}>

        {/* THIS IS DOWNLOAD BUTTON */}
        {showDownloads && (
          videoDownloaded == true ?
            <CenterButton
              styleContainer={styles.individualButtonOuterContainer}
              styleItem={styles.individualButtonInnerContainer}
              iconName="checkbox-sharp"
              name='Downloaded'
            />
            :
            <CenterButton
              styleContainer={styles.individualButtonOuterContainer}
              styleItem={styles.individualButtonInnerContainer}
              iconName="arrow-down-outline"
              name={dowanloadText}
              onPress={() => {

                checkPermission(`http://52.71.217.35:8082/image-service/api/v1/upload/loadVideo/${videoContent.videoDTO?.id}`)
                // checkPermission(`http://52.71.217.35:8082/image-service/api/v1/upload/loadVideo/2644`)
                // checkPermission('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')
              }}
            />

        )}

        {/* THIS IS SHARE BUTTON */}
        {showShare == true && subDomain !== null && (
          <CenterButton
            styleContainer={styles.individualButtonOuterContainer}
            styleItem={{
              ...styles.individualButtonInnerContainer,
              paddingRight: 5,
            }}
            iconName="share-social"
            name="Share"
            onPress={myShare}
          />
        )}

        {/* THIS IS NOTES BUTTON */}
        {videoContent?.notes == true && (
          <CenterButton
            styleContainer={styles.individualButtonOuterContainer}
            styleItem={{
              ...styles.individualButtonInnerContainer,
              paddingLeft: 4,
            }}
            iconName="document-text"
            name="Take a note"
            onPress={() => {
              navigation.navigate('NoteStackScreen', {
                screen: 'AddNote',
                params: { MediaBanner, videoTitle, mediaItemId },
              });
            }}
          />

        )}

        {/* THIS IS GIVING ICON */}
        {videoContent?.isGivingEnabled == true && (
          <View style={styles.individualButtonOuterContainer}>
            <TouchableOpacity
              style={styles.individualButtonInnerContainer}
              onPress={() => {
                navigation.navigate('GivingStackScreen', {
                  screen: 'GivingCollectData',
                  params: { fromItem: true, mediaItemId: mediaItemId },
                });
              }}
            >
              <GetIcon
                id={91}
                width={22}
                height={22}
                fill={ThemeConstant.ICONS_COLOR_DARK}
              />
            </TouchableOpacity>
            <Text
              style={{
                fontFamily: ThemeConstant.FONT_FAMILY,
                color:
                  theme == 'DARK'
                    ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                    : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
              }}
            >
              Giving
            </Text>
          </View>
        )}
      </View>
    );
  };

  //Video description component---
  const DescriptionTextComponent = () => {
    return videoDescription ? (
      <View
        style={{
          ...styles.descriptionTextContainer,
        }}
      >
        <Text
          onTextLayout={onTextLayout}
          numberOfLines={numberOfLine}
          style={styles.dateText}
        >
          {videoDescription}
        </Text>
        {/* <ReadMoreText text={videoDescription} styles={styles} theme={theme} /> */}
      </View>
    ) : null;
  };

  //the last button to redirecct to webLink----
  const ButtonComponent = ({ text, onPress }) => {
    return (
      <View style={styles.btnContainer}>
        <TouchableOpacity style={styles.btn} onPress={onPress}>
          <Text style={{ fontFamily: ThemeConstant.FONT_FAMILY }}>{text}</Text>
        </TouchableOpacity>
      </View>
    );
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
            colors={[shadeColor(imageBgColor, -75), shadeColor(imageBgColor, -58)]}
          >
            <StatusBar translucent backgroundColor={'transparent'} />
          </LinearGradient >
          :
          isFocused && <StatusBar translucent backgroundColor={'transparent'} />
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
          <SafeAreaView edges={['top']} style={{
            position: 'absolute',
            top: 0,
            zIndex: 1,
            width: '100%',
            paddingHorizontal: moderateScale(15),
            height: Platform.OS == 'android' ? moderateVerticalScale(50) : moderateVerticalScale(70),
            justifyContent: 'center'
          }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
            >
              <AntDesign name={'arrowleft'} size={22} color={'#fff'} />
            </TouchableOpacity>
          </SafeAreaView>

          {/* HEADER WIDE IMAGE START */}
          <View style={{
            width: '100%',
            marginTop: moderateVerticalScale(-180),
            marginBottom: moderateVerticalScale(10),
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* Here goes Image */}
            <HeaderImageWide MediaBanner={MediaBanner} color={imageBgColor} />
            {videoContent ?
              Platform.OS == 'android' && videoContent?.isOneTimePurchase == true && !videoContent?.isOneTimePurchasePaymentDone && videoContent?.subscriptionPlanIds.length == 0
                ?
                <>
                </>
                :
                <TouchableOpacity activeOpacity={0.8} onPress={_handleVideoPlayButton} style={styles.iconView}>
                  <PlayIcon
                    name="play"
                    size={30}
                    color="#fff"
                    style={styles.iconStyle}
                  />
                </TouchableOpacity>
              :
              <>
              </>
            }
          </View>
          {/* HEADER WIDE IMAGE STOP */}
          <TextComponent />
          <DescriptionTextComponent />
          {videoDescription !== null && (
            <TouchableOpacity
              style={{
                paddingHorizontal: ThemeConstant.PADDING_EXTRA_LARGE,
                paddingTop: ThemeConstant.PADDING_NORMAL
              }}
              onPress={() => {
                if (numberOfLine === 3) {
                  setNumberOflines(1000);
                } else {
                  setNumberOflines(3);
                }
              }}
            >
              <Text
                style={{
                  color: theme == 'DARK' ? '#fff' : '#000',
                  fontWeight: 'bold',
                }}
              >
                {showReadMore ? numberOfLine === 3 ? 'Read More' : 'Show less' : ''}
              </Text>
            </TouchableOpacity>
          )}
          {/* {isDownloading &&
            <Progress.Circle
              style={{ justifyContent: 'center', alignItems: "center" }}
              progress={1}
              indeterminate={true}
              animated={true}
              showsText={true}
            />
          } */}

          {/* THIS IS ONE TIME PURCHASE BUTTON */}
          {
            Platform.OS == 'android' && videoContent && videoContent?.isOneTimePurchase && !videoContent?.isOneTimePurchasePaymentDone && !videoContent.subscriptionPlanIds.includes(id) && <CustomButton
              onPress={() => {
                if (Platform.OS == 'android') {
                  if (isAuthenticated) {
                    navigation.navigate('Checkout', {
                      price: videoContent?.price,
                      fromItem: true,
                      itemId: mediaItemId
                    })
                  } else {
                    navigation.navigate('Auth', {
                      screen: 'RegisterScreen',
                      params: {
                        type: 'MEDIA_ITEM',
                        fromMediaOTP: true,
                        price: videoContent?.price,
                        itemId: mediaItemId,
                      },
                    })
                  }
                } else {
                  setModalVisible(true)
                }
              }
              }
              butttonText={`Buy item $${videoContent?.price}`}
              inputStyle={{
                marginHorizontal: ThemeConstant.MARGIN_EXTRA_LARGE,
                marginVertical: ThemeConstant.MARGIN_EXTRA_LARGE,
                backgroundColor: brandColor
              }} />
          }
          <ButtonsContainer />

          {documentDetail ? (
            <ButtonComponent
              text={documentTitle}
              onPress={_handleOpenPdf}
            />
          ) : null}
          <View style={{ marginBottom: 15 }}>
            {webUrl ? (
              <ButtonComponent
                text={webBtntext}
                onPress={() => {
                  OpenUrl(webUrl);
                }}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>

      <ModalStreamNotStartedYet modalVisible={modalVisibleNoStream} setModalVisible={setModalVisisbleNoStream} />

      {/* MODALS  */}
      {Alertmodal()}
    </View>
  );
};


const ModalStreamNotStartedYet = ({
  modalVisible,
  setModalVisible,
}) => {

  const isFocused = useIsFocused();
  const { mobileTheme: theme, brandColor } = useSelector((state) => state.brandingReducer.brandingData);



  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <Modal.Container>
        <Modal.Body>
          <Text
            style={{
              color:
                theme == 'DARK'
                  ? 'black'
                  : 'white',
              fontSize: scale(16),
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            {"The live event is not started yet, You will be able to watch once someone goes live."}

          </Text>
        </Modal.Body>
        <Modal.Footer>
          <CustomButton inputStyle={{ paddingHorizontal: moderateScale(100), backgroundColor: brandColor }} butttonText={'Close'} onPress={() => setModalVisible(false)} />
        </Modal.Footer>
      </Modal.Container>
    </Modal>
  );
}


const HeaderImageWide = ({ MediaBanner, color }) => {
  const [imgLoaded, setImageLoaded] = useState(false);
  return (
    <View style={{ backgroundColor: !imgLoaded ? color : 'transparent', borderRadius: scale(12), marginTop: Platform.OS == 'ios' ? moderateScale(20) : 0, overflow: 'hidden', marginHorizontal: moderateScale(2) }}>
      <Image
        source={{ uri: MediaBanner }}
        style={{
          width: '87%',
          aspectRatio: 1920 / 1080,
          backgroundColor: !imgLoaded ? color : 'transparent'
        }}
        onLoadEnd={() => {
          console.log('This is called')
          // setTimeout(() => {
          // setImageLoaded(true)
          // }, 10000)
        }}
        resizeMode={FastImage.resizeMode.contain}
      />
    </View>

  )
}


export default MediaItem;
