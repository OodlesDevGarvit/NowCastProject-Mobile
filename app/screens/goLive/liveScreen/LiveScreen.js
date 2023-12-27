import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, Alert, BackHandler, StatusBar, Dimensions } from "react-native"
// import { NodeCameraView } from 'react-native-nodemediaclient';
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale } from "react-native-size-matters";
import Icon from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useDispatch, useSelector } from "react-redux";
import { axiosInstance1 } from "../../../constant/Auth";
import { styles } from "./styles";
import * as API from '../../../constant/APIs';
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import Loader from "../../../components/Loader";
// import Orientation from "react-native-orientation";
import Orientation from 'react-native-orientation-locker';

import { isLandscape } from "react-native-device-info";
import Immersive from "react-native-immersive";
import { SET_ALERT } from "../../../store/actions/types";


const VIDEO_DEFAULT_BIT = 500000;
let interval;

//THIS IS THE COMPONENT RENDERED ON THE TOP OF TEH SCREEN WITH ICONS AND BACK Button-
const ICON_SIZE = scale(25);
const ICON_COLOR = '#fff';

const LiveScreen = ({ route, navigation }) => {
  const dispatch = useDispatch()
  const { token, user } = useSelector(state => state.authReducer)
  const playerRef = useRef(null);
  const isFocused = useIsFocused();

  const [renderHack, setRenderHack] = useState(false)
  const [published, setPublished] = useState(false)
  const [viewerCount, setViewerCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [cameraState, setCameraState] = useState(true);
  const [micState, setMicState] = useState(true);
  const [videoBit, setVideoBit] = useState(VIDEO_DEFAULT_BIT);
  const [streamLive, setStreamLive] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [IsLandscape, setIsLandscape] = useState(false);


  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Orientation.unlockAllOrientations();
    });
    return unsubscribe;
  }, [navigation]);

  //on hardware button press -
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backHandle);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backHandle);
    };
  }, []);
  const backHandle = () => {
    playerRef.current.stop();
    navigation.navigate('ItemsList');
    Orientation.lockToPortrait();
    return true;
  }

  //This is to listen the change of orientation of the device
  useEffect(() => {
    Dimensions.addEventListener('change', (evt) => {
      const { width, height } = evt.window;
      setIsLandscape(width > height)
    });
  }, []);

  //This is to take full screen in landscape mode
  useEffect(() => {
    if (Platform.OS == 'android') {
      Immersive.on()
      Immersive.setImmersive(true)
    }
    return () => {
      Immersive.off();
      Immersive.setImmersive(false)
    }
  }, []);



  useEffect(() => {
    setRenderHack(true)
    return () => {
      setRenderHack(false)
      if (playerRef.current) playerRef.current.stop()
      setPublished(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      interval = setInterval(async () => {
        getViewerCount();
      }, 10000)

      return () => {
        console.log('this is called...')
        clearInterval(interval);
      }
    }, [streamLive])
  );

  const getViewerCount = async () => {
    if (streamLive) {
      try {
        const res = await axiosInstance1.get(`${API.viewerCount}/${route.params.streamId}`);
        const data = res.data.data;
        if (data.dashViewerCount && data.hlsViewerCount && data.rtmpViewerCount && data.webRTCViewerCount) {
          const totalViewerCount = parseInt(data.dashViewerCount) + parseInt(data.hlsViewerCount) + parseInt(data.rtmpViewerCount) + parseInt(data.webRTCViewerCount);
          console.log('res viewer>>', data, totalViewerCount);
          if (isNaN(totalViewerCount)) {
            setViewerCount(0);
          } else {
            setViewerCount(totalViewerCount);
          }
        }

      }
      catch (err) {
        console.log('err>>', err);
      }
    } else {
      setViewerCount(0)
    }
  }

  const _handleToggleControls = () => {
    setShowControls(!showControls);
  }

  const showConfirmDialog = () => {
    dispatch({
      type: SET_ALERT, payload: {
        setShowAlert: true,
        data: {
          message: "Do you want to end this stream?",
          showCancelButton: true,
          onCancelPressed: () => {
            dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
          },
          showConfirmButton: true,
          confirmText: 'End',
          onConfirmPressed: async () => {
            await playerRef.current.stop();
            dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            return true;
          }
        }

      }
    }
    )
  };

  const _handlePressReverse = () => {
    playerRef.current.switchCamera();
  }

  const _handleVideoOff = () => {
    if (videoBit == 0) {
      setVideoBit(VIDEO_DEFAULT_BIT);
    } else {
      setVideoBit(0)
    }
  }

  const _handleMicMute = () => {
    setMicState(!micState)
  }

  function numFormatter(num) {
    if (num > 999 && num < 1000000) {
      return (num / 1000).toFixed(1) + 'K'; // convert to K for number from > 1000 < 1 million 
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'; // convert to M for number from > 1 million 
    } else if (num < 900) {
      return num; // if value < 1000, nothing to do
    }
  }

  const _handleStartLive = async () => {
    await setLoading(true);
    if (streamLive) {
      playerRef.current.stop();
      Orientation.unlockAllOrientations();
    } else {
      playerRef.current.start();
      if (IsLandscape) {
        Orientation.lockToLandscapeLeft();
      } else {
        Orientation.lockToPortrait();
      }
    }
  }

  const _handleBackHandler = () => {
    if (streamLive) {
      showConfirmDialog();
      return true;
    } else {
      navigation.navigate('ItemsList');
      Orientation.lockToPortrait();
      return true;
    }
  }

  const _changeStatusLive = async (val) => {
    let axiosConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + `${token}`,
      },
    };
    if (val) {
      try {
        const res = await axiosInstance1.put(`${API.startStream}/${route.params.streamId}?isLandScape=${IsLandscape}&landScapeType=${IsLandscape ? 'Left' : null}&liveTypeDevice=MOBILE_APP`, axiosConfig);
        console.log('response start stream', res);
      } catch (err) {
        console.log('error>>', err)
      }
    } else {
      try {
        const res = await axiosInstance1.put(`${API.stopStream}/${route.params.streamId}`, axiosConfig)
      } catch (err) {
        console.log('error>>', err)
      }

    }
  }

  return (
    <View style={{ flex: 1, position: 'relative', backgroundColor: '#fff' }}  >
      {isFocused && <StatusBar hidden={IsLandscape ? true : false} translucent backgroundColor={'transparent'} />}
      <Loader loading={loading} />

      {/* PLAY BUTTON AT BOTTOM */}
      <View style={styles.playIconContainer}>
        <TouchableOpacity activeOpacity={0.8} onPress={_handleStartLive}>
          <View style={{ width: moderateScale(60), height: moderateScale(60), justifyContent: 'center', alignItems: 'center' }}>
            <Icon name={!streamLive ? "play-circle-outline" : "stop"} size={ICON_SIZE + scale(15)} color={ICON_COLOR} />
            <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: scale(16), color: ICON_COLOR }}>{!streamLive ? "start" : "stop"}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* controls section */}
      <View style={styles.controlContainer}>
        <View style={styles.profileContainer}>
          <TouchableOpacity activeOpacity={0.8} onPress={_handleBackHandler}>
            <Icon name={"arrow-back"} size={ICON_SIZE} color={ICON_COLOR} />
          </TouchableOpacity>
        </View>

        <View style={styles.conrolsContainerRight}>
          <View style={{ ...styles.liveBtnContainer, backgroundColor: !streamLive ? 'rgba(26,26,29,0.4)' : "red" }}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>

          <View style={{
            ...styles.liveBtnContainer,
            flexDirection: 'row',
            backgroundColor: 'rgba(26, 26, 29, 0.4)',
            paddingHorizontal: moderateScale(10)
          }}>
            <Text style={{ color: '#fff', fontSize: scale(14), marginHorizontal: moderateScale(5) }}>{numFormatter(viewerCount)}</Text>
            <Icon name={"remove-red-eye"} size={ICON_SIZE - scale(5)} color={'#fff'} />
          </View>

          {/* BUTTONS */}
          <View style={styles.btnsContainer}>
            {/* <TouchableOpacity onPress={_handleToggleControls} style={styles.btn}>
              <Entypo name={showControls ? "cross" : "chevron-down"} color={ICON_COLOR} size={ICON_SIZE} />
            </TouchableOpacity> */}
            {
              true &&
              <>
                {/* <TouchableOpacity onPress={_handleMicMute} style={styles.btn}>
                  <Icon name={micState ? "mic" : "mic-off"} color={ICON_COLOR} size={ICON_SIZE} />
                </TouchableOpacity>

                <TouchableOpacity onPress={_handleVideoOff} style={styles.btn}>
                  <Icon name={videoBit !== 0 ? "videocam" : "videocam-off"} color={ICON_COLOR} size={ICON_SIZE} />
                </TouchableOpacity> */}

                <TouchableOpacity onPress={_handlePressReverse} style={styles.btn}>
                  <Icon name={"flip-camera-android"} color={ICON_COLOR} size={ICON_SIZE} />
                </TouchableOpacity>
              </>
            }


          </View>
        </View>

      </View>

      {/* MAIN CONTAINER */}
      <View style={styles.container}>
        {/* {renderHack ?
          <NodeCameraView
            style={styles.camera}
            ref={playerRef}
            outputUrl={`${route.params?.url}${route.params?.streamId}`}
            camera={{ cameraId: 1, cameraFrontMirror: true }}
            audio={{ bitrate: 32000, profile: 1, samplerate: 44100 }}
            video={{ preset: 1, bitrate: videoBit, profile: 2, fps: 30, videoFrontMirror: false }}
            smoothSkinLevel={3}
            autopreview={true}
            onStatus={(code, msg) => {
              console.log("onStatus=" + code + " msg=" + msg);
              if (code === 2001) {
                setPublished(true)
                setStreamLive(true)
                setLoading(false)
                _changeStatusLive(true);

              } else if (code === 2004) {
                setPublished(false)
                setStreamLive(false)
                _changeStatusLive(false);
                setViewerCount(0)
                setLoading(false)

              }
            }}
          />
          : null} */}
      </View>

    </View>
  )
}

export default LiveScreen