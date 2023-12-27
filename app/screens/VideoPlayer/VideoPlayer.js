import React, { useState, useRef, useEffect } from 'react';

import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Modal,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated
} from 'react-native';

import { Immersive } from 'react-native-immersive'

import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import MainIcon from 'react-native-vector-icons/AntDesign';
import OptionIcon from 'react-native-vector-icons/SimpleLineIcons';
import PIPIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import SeekIcon from 'react-native-vector-icons/Fontisto';
import ShareIcon from 'react-native-vector-icons/AntDesign';
import DeleteIcon from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/AntDesign';
import ThemeConstant from '../../constant/ThemeConstant';
// import Orientation from 'react-native-orientation';
import Orientation from 'react-native-orientation-locker';

import Slider from '@react-native-community/slider';
import PipHandler from 'react-native-pip-android';
import Share from 'react-native-share';
import {
  moderateScale,
  moderateVerticalScale,
  scale,
} from 'react-native-size-matters';
import { useSelector } from 'react-redux';
import { axiosInstance1 } from '../../constant/Auth';
import * as API from '../../constant/APIs';
import { useFocusEffect } from '@react-navigation/native';
import YtIcons from 'react-native-vector-icons/FontAwesome5';
import RNFetchBlob from 'rn-fetch-blob';
import { VASTParser, VASTTracker } from 'react-native-vast-client';


export default function VideoPlayer({ route, navigation }) {
  const playerRef = useRef();
  const { subdomain: subDomain, adExchangeUrl } = useSelector((state) => state.brandingReducer.brandingData);
  const { token, isAuthenticated } = useSelector(state => state.authReducer);
  const { data } = route.params || {};
  const downloadedVideoPath = route.params?.downloadedVideoPath;
  const fromDownloads = route.params?.fromDownloads;
  const videoName = route.params?.videoName
  const textOpacity = useRef(new Animated.Value(0)).current;

  //to handle live video
  const isLive = route?.params?.live;
  const liveType = route?.params?.liveType;
  const fromLive = route?.params?.fromLive;


  // to handle video from home header
  const fromHeader = route?.params?.fromHeader;
  const videoUrlHeader = route?.params?.videoUrlHeader;
  const videoIdHeader = route?.params?.videoId;

  const currentTimeAudio = route?.params?.currentTimeAudio;
  const currentTimeHeader = route?.params?.currentTimeHeader;
  const [inPipMode, setInPipState] = useState(false);
  const [paused, setpaused] = useState(false);
  const [duration, setduration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [MultiTime, setMultiTime] = useState(1.0);
  const [modalVisible, setModalVisible] = useState(false);
  const [resetValue, setResetValue] = useState(false);
  const [optionVisible, setOptionVisibility] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [IsLandscape, setIsLandscape] = useState(false);
  const [animating, setAnimating] = useState(true);
  const [audio, setAudio] = useState(true);
  const [controlIconsColor, setControlIconsColor] = useState('gray');
  const [timer, setTimer] = useState('');
  const [loaded, setLoaded] = useState(false);
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const [resizeMode, setResizeMode] = useState('contain');
  const [popUpMessage, setPopUpMessage] = useState(null);

  //for ads implememtation---
  const vastParser = new VASTParser();
  const adPlayerRef = useRef();

  const [isAdAvailable, setIsAdAvailable] = useState(false)
  const [adType, setAdType] = useState(null);
  const [showAds, setShowAds] = useState(false);
  const [adAllData, setAdAlldata] = useState([]);
  const [skipTime, setSkipTime] = useState(5);
  const [skipable, setSkipable] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showSkipAds, setShowSkipsAds] = useState(false);



  useFocusEffect(React.useCallback(() => {

    ImmersON()

    return () => {
      ImmersOF()
      setpaused(true)
      Orientation.lockToPortrait();
      if (Platform.OS == 'android') {
        Immersive.setImmersive(false);
        return;
      }
      StatusBar.setHidden(false);
    }

  }, []))

  useFocusEffect(
    React.useCallback(() => {
      if (currentTimeAudio) {
        _handleVideoPress()
        playerRef.current.seek(currentTimeAudio);
      } else if (currentTimeHeader) {
        _handleVideoPress()
        playerRef.current.seek(currentTimeHeader)
      }
      Orientation.unlockAllOrientations()
    }, [])
  )

  //to set different ads states and allAddata
  useEffect(() => {
    // Parse the VAST URL and set the video URL when the component mounts
    if (adExchangeUrl) {
      vastParser.getAndParseVAST(adExchangeUrl)
        .then((response) => {
          if (response.ads && response.ads.length > 0) {
            setIsAdAvailable(true);
            const creatives = response.ads[0].creatives;
            creatives.forEach((item) => {
              if (item.mediaFiles && item.mediaFiles.length > 0) {
                setAdType(item.type);
                item.skipDelay > 0 && setSkipable(true) && setSkipTime(item.skipDelay);
                let allUrls = item.mediaFiles.map(i => i.fileURL);
                setAdAlldata(allUrls);
              }
            })
          }
        })
        .catch((error) => console.log(error));
    }
  }, [adExchangeUrl]);


  //play all ads back to back
  const playNextAdd = () => {
    if (currentAdIndex < adAllData.length - 1) {
      adPlayerRef.current?.seek(0);
      setCurrentAdIndex(prev => prev + 1);
      setShowSkipsAds(false)
      setTimeout(() => {
        setShowSkipsAds(true)
      }, skipTime * 1000);
    } else {
      setShowAds(false)
    }
  };

  //to skip add-
  const skipAd = () => {
    if (currentAdIndex < adAllData.length - 1 && showSkipAds) {
      playNextAdd();
    } else {
      setShowAds(false)
    }
  };


  useEffect(() => {
    if (showAds) {
      setpaused(true)
    } else {
      setpaused(false)
    }
  }, [showAds])


  useEffect(() => {
    if (data?.audioDTO == null && data?.audioUrl == null) {
      setAudio(false);
    }
    return () => {
      if (fromLive) clearInterval(timer);
    }
  }, [])

  //This is to listen the change of orientation of the device
  useEffect(() => {
    Dimensions.addEventListener('change', (evt) => {
      const { width, height } = evt.window;
      if (width > height) {
        setIsLandscape(true);
        setControlsVisible(true);
        createNewTimer();
      } else {
        setControlsVisible(true)
        setIsLandscape(false);
        createNewTimer();
      }
    });
  }, []);

  //This is to listen the change of orientation of the device
  useEffect(() => {
    ImmersON()
    return () => {
      ImmersOF();
    }
  }, []);

  const ImmersON = () => {
    if (Platform.OS == 'android') {
      Immersive.on()
      Immersive.setImmersive(true)
    }
  }

  const ImmersOF = () => {
    if (Platform.OS == 'android') {
      Immersive.off();
      Immersive.setImmersive(false)
    }
  }


  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Orientation.unlockAllOrientations();
    });
    return unsubscribe;
  }, [navigation]);


  function findMaxResolutionPath() {
    let final = ""
    let objects = {}
    // console.log('item', item?.videoDTO)
    data?.videoDTO?.flavourList?.map((item) => {
      if (item.size) {
        let name = item.size;
        objects[name] = item.src;
      }
    })
    // console.log('objetcs>>>>', objects)
    // if (objects["2160"]) {
    //   final = objects["2160"];
    // } else if (objects["1080"]) {
    //   final = objects["1080"];
    // } else
    if (objects["720"]) {
      final = objects["720"];
    } else if (objects["480"]) {
      final = objects["480"];
    } else if (objects["360"]) {
      final = objects["360"];
    } else {
      final = data?.videoDTO?.path;
    }

    if (final !== null && final !== undefined && final !== '') {
      // console.log('final is >>', final)
      return final;
    }
    // console.log(data?.videoDTO?.path, 'this');
    return data?.videoDTO?.path;
  }

  //handle controls visible when in lansdscape mode---
  const _handleVideoPress = () => {
    setInPipState(false);

    clearTimeout(timer);
    if (loaded) {
      if (!paused && !animating && controlsVisible) {
        setControlsVisible(false);
      } else if (!controlsVisible) {
        setControlsVisible(true);

        if (!paused && !animating) {
          setTimer(
            setTimeout(() => {
              setControlsVisible(false);
            }, 4000)
          );
        }
      }
    }
    //set else if(!paused && !controlsVisible){
  };

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
  };

  const reset = () => {
    setMultiTime(1);
    setResetValue(false);
  };

  //THIS IS TO GET MEDIAPLAY COUNT IT IS CALLED EVERYTIME VIDEO IS LOADED__
  const gettingMediaPlayCount = async () => {

    const body = {
      deviceType: Platform.OS == 'android' ? 'MOBILE_ANDROID' : 'MOBILE_IOS',
      mediaItemId: data?.id,
      mediaType: 'VIDEO',
    };

    if (!isAuthenticated) {
      try {
        const res = await axiosInstance1.post(
          `${API.MediaCountWithoutLogin}?organizationId=${orgId}`,
          body
        );

        // console.log('res on media play count >>', res);
      } catch (err) {
        console.log('error>>', err);
      }
    } else {
      // console.log('This is running with login');
      try {
        let axiosConfig = {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + `${token}`,
          },
        };
        const res = await axiosInstance1.post(
          `${API.MediaCount}`,
          body,
          axiosConfig
        );
        // console.log('res is with loggin ', res);
      } catch (err) {
        console.log('error>>', err);
      }
    }
  };

  //this is for the switching to audioPlayer-
  const _handleSwitchToAudio = () => {
    setpaused(true);
    navigation.replace('AudioPlayer', {
      image: data?.squareArtwork?.document?.square,
      imageBgColor: data?.squareArtwork?.document?.imageColur,
      data: data,
      currentTimeVideo: currentTime,
      fromVideo: true,
    });
  };

  //this is called on PIP icon tap--------------
  const _handlePip = () => {
    if (Platform.OS == 'android') {
      setInPipState(true);
      PipHandler.enterPipMode(300, 170);
    }
  };

  //called on press of share button---------------------------------
  const shareVideo = () => {
    //called on press of share button---------------------------------
    const shareOptions = {
      message: `${data?.title}\nhttps://${subDomain}/video/${fromHeader ? videoIdHeader : data?.id}`,
    };

    try {
      const ShareResponse = Share.open(shareOptions);
    } catch (error) {
      console.log('Error =====>', error);
    }
  };

  //hanldes down chevron button click in header-
  const _handleBackPress = async () => {
    console.log('this is called');
    RNFetchBlob.fs.unlink(`${RNFetchBlob.fs.dirs.DownloadDir}/.Decrypted/decrypt${videoName}`)
      .then(() => { })
      .catch((err) => {
        console.log('err', err);

      })



    await navigation.goBack();
    return;
  }

  //THIS TIMER HANDLES THE VISIBILITY OF THE CONTROLS
  const createNewTimer = () => {
    clearTimeout(timer);
    setTimer(
      setTimeout(() => {
        setControlsVisible(false);
      }, 4000)
    );
  };

  /**This sectionm contains all the funcitons to handle the player controls---
   *
   */

  const _handleOnLoad = (meta) => {
    setLoaded(true);
    gettingMediaPlayCount();
    setAnimating(false);
    setduration(meta.duration);
    setControlIconsColor('#fff');
    setTimeout(() => {
      setControlsVisible(false);
    }, 4000);
  };

  const _handleOnProgress = (progress) => {
    setCurrentTime(Math.floor(progress.currentTime));
    setProgress(Math.floor(progress.currentTime) / duration);

    if (Platform.OS == 'ios') {
      setAnimating(false);
    }

  };


  const _handleOnEnd = async () => {
    await setpaused(true);
    await setControlsVisible(true);
    // setCurrentTime(0);
    // setProgress(0);
    // await playerRef.current.seek(0);
  };

  const _handleOnEndIOS = async () => {
    await setpaused(true);
    await setControlsVisible(true);
    setCurrentTime(0);
    setProgress(0);
    await playerRef.current.seek(0);

  };

  const _togglePlayPause = () => {
    createNewTimer();
    setpaused(!paused);
  };

  const _togglePlayPauseIOS = async () => {
    createNewTimer();
    setpaused(!paused);
  };

  function _seekBack() {
    createNewTimer();
    if (currentTime >= 15) {
      setCurrentTime(currentTime - 15);
      playerRef.current.seek(Math.floor(progress * duration) - 15);
      setProgress(Math.floor(currentTime - 15) / duration);
    } else {
      setCurrentTime(0);
      playerRef.current.seek(0);
      setProgress(0);
    }
    // console.log('after seek --', Math.floor(progress * duration) - 15)
  }

  function _seekForward() {
    createNewTimer();
    if (currentTime <= duration - 15) {
      setCurrentTime(currentTime + 15);
      playerRef.current.seek(Math.floor(progress * duration) + 15);
      setProgress(Math.floor(currentTime + 15) / duration);
    } else if (currentTime > duration - 15 && currentTime < duration) {
      setCurrentTime(duration);
      playerRef.current.seek(duration);
      setpaused(true)
    } else {
      setCurrentTime(0);
      playerRef.current.seek(0);
      setProgress(0);
      setpaused(!paused)
    }
    // console.log('before seek --', Math.floor(progress * duration) + 15)
  }

  const _seekBackIOS = () => {
    createNewTimer();
    if (currentTime >= 15) {
      playerRef.current.seek(Math.floor(progress * duration) - 15);
    } else {
      playerRef.current.seek(0);
    }
  }

  const _seekForwardIOS = () => {
    createNewTimer();
    if (currentTime <= duration - 15) {
      playerRef.current.seek(Math.floor(progress * duration) + 15);
    } else {
      playerRef.current.seek(0);
      setpaused(true)
    }
  }


  const _handleAnimation = () => {
    Animated.sequence([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      })
    ]).start()
  }

  const _handleResizeModeSwitch = () => {
    if (resizeMode == 'cover') {
      setResizeMode('contain')
      setPopUpMessage('Original')
      _handleAnimation()
    } else {
      setPopUpMessage('Zoomed to fill')
      setResizeMode('cover')
      _handleAnimation()

    }
  }

  //This section contains modals---

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
          <View style={{ ...styles.options, height: audio ? 120 : 60 }}>
            {audio ? (
              <TouchableOpacity
                style={{ height: '50%', justifyContent: 'center' }}
                onPress={() => {
                  _handleSwitchToAudio();
                  setOptionVisibility(false);
                }}
              >
                <View style={styles.optionItem}>
                  <DeleteIcon name="headset" size={25} />
                  <Text style={styles.optionText}>Switch to audio</Text>
                </View>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={{ height: '50%', justifyContent: 'center' }}
              onPress={() => {
                shareVideo();
              }}
            >
              <View style={styles.optionItem}>
                <ShareIcon name="sharealt" size={25} />
                <Text style={styles.optionText}>Share</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#000',
      }}
    >
      <StatusBar
        backgroundColor={'#000'}
        translucent={true}
      />
      {controlsVisible && !inPipMode && showAds == false ? (
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={_handleBackPress}
          >
            <Icon
              name="down"
              size={ThemeConstant.ICON_SIZE_NORMAL}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text numberOfLines={1} style={styles.titleText}>
              {data?.title}
            </Text>
          </View>
        </View>
      ) : null}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => _handleVideoPress()}
        style={{ flex: 1 }}
      >
        {
          fromDownloads == true ?
            <Video
              ref={playerRef}
              paused={paused == true ? true : false}
              source={{ uri: downloadedVideoPath }}
              resizeMode={!IsLandscape && !isLive ? 'contain' : resizeMode}
              repeat={true}
              rate={MultiTime}
              pictureInPicture={true}
              playInBackground={true}
              // fullscreen={IsLandscape && Platform.OS == 'android' ? true : false}
              ignoreSilentSwitch="ignore"
              onLoad={_handleOnLoad}
              onProgress={_handleOnProgress}
              onEnd={Platform.OS == 'android' ? _handleOnEnd : _handleOnEndIOS}
              onBuffer={({ isBuffering }) => {
                if (isBuffering) {
                  setAnimating(true);
                } else {
                  setAnimating(false);
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
              bufferConfig={{
                minBufferMs: 15000,
                maxBufferMs: 50000,
                bufferForPlaybackMs: 2500,
                bufferForPlaybackAfterRebufferMs: 5000
              }}
            />
            :
            <>
              <Video
                ref={playerRef}
                paused={paused == true ? true : false}
                source={{
                  uri: fromHeader ? videoUrlHeader : fromLive ? (isLive ? data?.liveStreamDataDTO.m3u8Url : data?.videoUrl.trim()) : (data?.videoDTO !== null ? findMaxResolutionPath()?.trim() : data?.videoUrl?.trim())
                }}
                resizeMode={!IsLandscape && !isLive ? 'contain' : resizeMode}
                repeat={true}
                rate={MultiTime}
                pictureInPicture={true}
                playInBackground={true}
                ignoreSilentSwitch="ignore"
                onLoad={_handleOnLoad}
                onProgress={_handleOnProgress}
                onEnd={Platform.OS == 'android' ? _handleOnEnd : _handleOnEndIOS}
                onBuffer={({ isBuffering }) => {
                  if (isBuffering) {
                    setAnimating(true);
                  } else {
                    setAnimating(false);
                  }
                }}
                style={{
                  width: '100%',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  opacity: showAds ? 0 : 1
                }}
                bufferConfig={{
                  minBufferMs: 15000,
                  maxBufferMs: 50000,
                  bufferForPlaybackMs: 2500,
                  bufferForPlaybackAfterRebufferMs: 5000
                }}
              />

              {
                isAdAvailable && adAllData && adAllData.length > 0 &&
                <Video
                  ref={adPlayerRef}
                  paused={showAds ? false : true}
                  source={{
                    uri: adAllData[currentAdIndex]
                  }}
                  onLoad={() => {
                    setShowAds(true)
                    setTimeout(() => {
                      setShowSkipsAds(true)
                    }, skipTime * 1000)
                  }}
                  resizeMode={'contain'}
                  repeat={false}
                  pictureInPicture={true}
                  playInBackground={false}
                  ignoreSilentSwitch="ignore"
                  onEnd={playNextAdd}
                  onBuffer={({ isBuffering }) => {
                    if (isBuffering) {
                      setAnimating(true);
                    } else {
                      setAnimating(false);
                    }
                  }}
                  style={{
                    width: '100%',
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    opacity: showAds ? 1 : 0
                  }}
                  bufferConfig={{
                    minBufferMs: 15000,
                    maxBufferMs: 50000,
                    bufferForPlaybackMs: 2500,
                    bufferForPlaybackAfterRebufferMs: 5000
                  }}
                />
              }
            </>
        }

        <View style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Animated.Text style={{
            color: '#fff',
            fontSize: scale(30),
            fontWeight: 'bold',
            opacity: textOpacity
          }}>{popUpMessage}
          </Animated.Text>
        </View>


        {controlsVisible && !inPipMode && showAds == false ? (
          //this is controls component--
          <View style={{ ...styles.controls, opacity: 1 }}>
            {/* this is uppercontrols component-- */}
            {
              (!isLive || liveType !== 'LIVE') &&
              <View style={styles.controlsUp}>

                <View style={styles.controlSlider}>
                  {
                    !isLive && <View style={styles.controlIcon}>
                      <Text style={{ color: controlIconsColor }}>
                        {secondsToTime(currentTime)}
                      </Text>
                    </View>
                  }


                  <View style={styles.slider}>
                    <Slider
                      style={{
                        width: '100%',
                        alignSelf: 'center',
                      }}
                      value={!isLive ? progress : 1}
                      minimumValue={0}
                      tapToSeek={isLive ? false : true}
                      maximumValue={1}
                      thumbTintColor={isLive ? '#ff0000' : "#fff"}
                      minimumTrackTintColor={isLive ? '#ff0000' : "#fff"}
                      maximumTrackTintColor={isLive ? '#ff0000' : "#fff"}
                      onSlidingStart={async (progress) => {
                        clearTimeout(timer);
                        setControlsVisible(true);
                      }}
                      onSlidingComplete={async (progress) => {
                        setProgress(progress);
                        await playerRef.current.seek(
                          Math.floor(progress * duration)
                        );
                        createNewTimer();
                      }}
                      onValueChange={async (progress) => {
                        setCurrentTime(progress * duration);
                        setProgress(progress);
                        await playerRef.current.seek(
                          Math.floor(progress * duration)
                        );
                      }}
                    />
                  </View>

                  {
                    !isLive && <View style={styles.controlIcon}>
                      <Text style={{ color: controlIconsColor }}>
                        -{secondsToTime(duration - currentTime)}
                      </Text>
                    </View>
                  }


                </View>

                {/* this is picture in picture component-- */}
                {Platform.OS == 'android' && !IsLandscape && !isLive ? (
                  <View style={styles.controlIcon}>
                    <TouchableWithoutFeedback
                      onPress={() => {
                        _handlePip();
                      }}
                    >
                      <PIPIcon
                        name="picture-in-picture-top-right"
                        size={24}
                        color={controlIconsColor}
                      />
                    </TouchableWithoutFeedback>
                  </View>
                ) : null}

                {
                  IsLandscape && !isLive && (
                    <View style={styles.controlIcon}>
                      <TouchableWithoutFeedback
                        onPress={_handleResizeModeSwitch}
                      >
                        <YtIcons
                          name={resizeMode == 'cover' ? 'compress' : 'expand'}
                          size={24}
                          color={controlIconsColor}
                        />
                      </TouchableWithoutFeedback>
                    </View>
                  )
                }
              </View>
            }


            {/* this is bottom controls component-- */}
            <View style={styles.controlBottom}>
              {/* this is for the plackspeed modal */}
              {!isLive ? (
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(true);
                  }}
                  style={styles.controlIcon}
                >
                  <Text style={{ color: controlIconsColor, fontSize: 18 }}>
                    {MultiTime.toFixed(1)}X
                  </Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={{
                    width: 50,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: 'red',
                      marginRight: moderateScale(6),
                      marginLeft: moderateScale(20),
                      fontSize: scale(30),
                      fontWeight: 'bold',
                    }}
                  >
                    •
                  </Text>
                  <Text style={{
                    color: '#fff',
                    fontSize: scale(14),
                    fontWeight: 'bold',
                  }}>LIVE</Text>
                </View>
              )}

              <TouchableOpacity
                style={{ ...styles.controlIcon }}
                onPress={() => {
                  if (!isLive) {
                    Platform.OS == 'android' ? _seekBack() : _seekBackIOS()
                  }
                }}
              >
                {
                  !isLive && (
                    <>
                      <SeekIcon
                        name="spinner-rotate-forward"
                        size={30}
                        style={{
                          ...styles.icon,
                          transform: [{ rotateY: '180deg' }],
                          color: isLive ? '#696969' : controlIconsColor,
                        }}
                      />
                      <Text
                        style={{
                          color: isLive ? '#696969' : controlIconsColor,
                          ...styles.seekText,
                        }}
                      >
                        15
                      </Text>
                    </>
                  )
                }
              </TouchableOpacity>


              {/* this is to toggle play and pause */}
              {animating == false ? (
                <TouchableOpacity
                  style={styles.controlIcon}
                  onPress={Platform.OS == 'android' ? _togglePlayPause : _togglePlayPauseIOS}
                >
                  <MainIcon
                    name={!paused ? 'pause' : 'caretright'}
                    size={38}
                    style={{ ...styles.icon, color: '#fff' }}
                  />
                </TouchableOpacity>
              ) : (
                <View style={styles.controlIcon}>
                  <ActivityIndicator
                    animating={true}
                    color="#FFFFFF"
                    size="large"
                    style={{
                      ...styles.activityIndicator,
                    }}
                  />
                </View>
              )}

              {/* this is to seek forward  */}
              <TouchableOpacity
                style={{ ...styles.controlIcon }}
                onPress={() => {
                  if (!isLive) {
                    Platform.OS == 'android' ? _seekForward() : _seekForwardIOS()
                  }
                }}
              >
                {
                  !isLive && (
                    <>
                      <SeekIcon
                        name="spinner-rotate-forward"
                        size={30}
                        style={{
                          ...styles.icon,
                          color: isLive ? '#696969' : controlIconsColor,
                        }}
                      />
                      <Text
                        style={{
                          color: isLive ? '#696969' : controlIconsColor,
                          ...styles.seekText,
                        }}
                      >
                        15
                      </Text>
                    </>
                  )
                }
              </TouchableOpacity>


              {/* this is for options modal-- */}
              <TouchableOpacity
                style={styles.controlIcon}
                onPress={() => {
                  if (!isLive) {
                    setOptionVisibility(!optionVisible);
                  }
                }}
              >
                {
                  !isLive && <OptionIcon
                    name="options"
                    size={20}
                    style={{ ...styles.icon, color: controlIconsColor }}
                  />
                }
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {
          isAdAvailable && showAds && skipable && skipTime > 0 && showSkipAds &&
          <View style={styles.skipButton}>
            <TouchableOpacity activeOpacity={0} onPress={skipAd} style={{
              height: '100%',
              paddingHorizontal: moderateScale(10),
            }}>
              <Text style={{ color: '#000', fontSize: scale(14), fontWeight: '800' }}>Skip</Text>
            </TouchableOpacity>
          </View>

        }

        {
          isAdAvailable && showAds &&
          <View style={styles.adButton}>
            <Text style={{ color: '#000', fontSize: scale(14), fontWeight: '800' }}>Ad</Text>
          </View>
        }

        {PlaybackModal()}
        {optionsModal()}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainComponent: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    height: 120,
    bottom: 20,
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 4,
    width: '100%',
  },
  controlsUp: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignItems: 'center',
  },
  controlBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    color: '#FFF',
  },
  icon: {
    color: '#FFF',
  },
  modalText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  activityIndicator: {
    alignItems: 'center',
    zIndex: 1,
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
  options: {
    backgroundColor: '#fff',
    height: 120,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: ThemeConstant.PADDING_EXTRA_LARGE,
    justifyContent: 'space-around',
  },
  headerContainer: {
    flexDirection: 'row',
    position: 'absolute',
    zIndex: 1,
    top: 0,
    marginTop: moderateVerticalScale(25),
    marginLeft: moderateScale(15)
  },
  headerIcon: {
    padding: 15,
    color: '#fff',
  },
  headerTextContainer: {
    marginHorizontal: ThemeConstant.MARGIN_EXTRA_LARGE,
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    color: ThemeConstant.TEXT_COLOR_WHITE,
    letterSpacing: 1,
    fontSize: ThemeConstant.TEXT_SIZE_MEDIUM,
    paddingRight: 15,
  },
  dateText: {
    color: ThemeConstant.TEXT_COLOR_SUBTEXTS,
    letterSpacing: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: ThemeConstant.MARGIN_EXTRA_LARGE,
  },
  controlIcon: {
    height: 50,
    width: 66,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlLandScape: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 15,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  slider: {
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  controlSlider: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  seekText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontSize: 12,
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
  adButton: {
    backgroundColor: 'yellow',
    paddingHorizontal: moderateScale(10),
    position: 'absolute',
    bottom: scale(10),
    right: scale(10),
    borderRadius: scale(3)
  },
  skipButton: {
    backgroundColor: '#696969',
    position: 'absolute',
    top: scale(20),
    right: scale(20),
    borderRadius: scale(3),
    zIndex: 1000,
  }
});
