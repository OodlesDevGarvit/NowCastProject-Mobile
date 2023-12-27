import React, { useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  useWindowDimensions
} from 'react-native';
import Video from 'react-native-video';
import {
  moderateScale,
  moderateVerticalScale,
} from 'react-native-size-matters';
import { getRemoteMessage } from '../../store/actions/remoteNotificationAction';
import { useDispatch } from 'react-redux';
import Orientation from 'react-native-orientation-locker';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import SplashScreen from 'react-native-splash-screen';
import RNBootSplash from "react-native-bootsplash";
import { SET_SPLASH } from '../../store/actions/types';
import RNModal from 'react-native-modal';
import { navigate } from '../../../App';
import { notificationController } from '../../services/NotificationController';
import { useRef } from 'react';
import { cacheDoc } from '../../utils/caching';

/**TODO: ONLY MAKE CHANGES IN THE constants---- */

export const constants = {
  //THIS IS TO SET THE ORGANIZATION LOGO PASTE THE LOGO IN THE ASSETS FOLDER AND SET THE NAME OF IMAGE HERE AFTER /assests/..
  orgLogo: require('../../assets/org_logo.png'), //TOGGLE THIS LINE WITH "COMMAND+/" TO SHOW OR HIDE THIS LOGO
  //THIS IS TO SET THE NOWCAST LOGO PASTE THE LOGO IN THE ASSETS FOLDER AND SET THE NAME OF IMAGE HERE AFTER /assests/..
  nowcastLogo: require('../../assets/logo.png'),//TOGGLE THIS LINE WITH "COMMAND+/" TO SHOW OR HIDE THIS LOGO
  //THIS IS THE BACKGROUND COLOR OF THE SPLASH SCREEN
  bgColor: '#000000',
  //TO SET THE SIZE OF THE ORG LOGO-
  logoWidth: 440,
  //TO SET THE DURATION OF THE SPLASH SCREEN IN SECONDS eg . "duration"*1000-
  duration: 5 * 1000,

  MAX_SPLASH_TIME: 20 * 1000,
  //TO CHANGE THE ORG LOGO'S POSITION
  offset: 100,
  //toggle this value between true & false when your want to repeat the video to see the logo width and position
  REPEAT_SPLASH: !(false)
};

const ImageContainer = () => {
  return (
    <>
      <Image style={styles.topOrgLogo} source={constants.orgLogo} />
      <Image style={styles.bottomNowcastLogo} source={constants.nowcastLogo} />
    </>
  );
};

export const SplashScreenModal = () => {
  const dispatch = useDispatch();
  const videoRef = useRef(false);
  const { height } = useWindowDimensions();
  const [showLogos, setShowLogos] = useState(false);
  const { isVisible, url, fetched } = useSelector(state => state.splashReducer);
  const { token, userId } = useSelector(state => state.authReducer);
  const [modalOpacity, setModalOpacity] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    Orientation.lockToPortrait();
    dispatch(getRemoteMessage());

    setTimeout(() => {
      notificationController(navigate, token, userId);
    }, constants.duration + 1500)
  }, []);


  useEffect(() => {
    if (fetched) {
      init()
    }
  }, [fetched])

  useEffect(() => {
    if (duration > 0) {
      setTimeout(() => {
        // console.log('this is called after duration', duration)
        if (constants.REPEAT_SPLASH) {
          dispatch({ type: SET_SPLASH, payload: false })
        }
      }, duration * 1000 - 700)
    }
  }, [duration])

  const init = async () => {
    if (url) {
      let cachedUrl = await cacheDoc(url, '.mp4');
      // console.log('cached', cachedUrl)
      setVideoUrl(cachedUrl)
      setTimeout(() => {
        if (videoRef.current == false) {
          if (Platform.OS == 'android') {
            SplashScreen.hide()
          } else {
            RNBootSplash.hide({ fade: true })
          }
          dispatch({ type: SET_SPLASH, payload: false })
        } else {
          // console.log('video was loaded  in duration')
        }
      }, constants.duration)
    }
  }

  const _handleOnLoad = async (meta) => {
    // console.log('meta >>', meta)
    setDuration(meta?.duration);
    await setShowLogos(true);
    videoRef.current = true;
    setTimeout(() => {
      setModalOpacity(1);
      if (Platform.OS == 'android') {
        SplashScreen.hide()
      } else {
        RNBootSplash.hide({ fade: true })
      }
    }, 300)

    setTimeout(() => {
      if (constants.REPEAT_SPLASH) {
        dispatch({ type: SET_SPLASH, payload: false })
      }
    }, constants.MAX_SPLASH_TIME)
  }


  return (
    <RNModal
      visible={isVisible}
      transparent={true}
      animationType={'fade'}
      deviceHeight={height}
      hasBackdrop={true}
      backdropOpacity={0.5}
      backdropColor="black"
      animationIn="fadeIn"
      animationOut="fadeOut"
      statusBarTranslucent
      useNativeDriver={true}
      onModalHide={() => {
        console.log('Splash modal is now hidden')
      }}

      style={{
        margin: 0,
        opacity: modalOpacity
      }}
    >
      <View style={styles.mainContainer}>
        <View
          style={{
            flex: 1,
          }}
        >
          <Video
            source={{ uri: videoUrl || '' }}
            style={styles.videoBackground}
            muted={true}
            repeat={!constants.REPEAT_SPLASH}
            playWhenInactive={true}
            resizeMode={'cover'}
            rate={1.0}
            ignoreSilentSwitch={'obey'}
            onLoad={_handleOnLoad}
            onEnd={() => {
              console.log('video ended')
              if (constants.REPEAT_SPLASH) {
                dispatch({ type: SET_SPLASH, payload: false })
              }
            }}
          />
          {
            showLogos &&
            <View style={styles.backgroundImage}>
              <ImageContainer />
            </View>
          }
        </View>
      </View>
    </RNModal>

  )
}

//Styles of the splash screen--
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topOrgLogo: {
    width: moderateScale(constants.logoWidth),
    resizeMode: 'contain',
    marginTop: moderateVerticalScale(constants.offset)
  },
  bottomNowcastLogo: {
    width: moderateScale(120),
    height: moderateVerticalScale(60),
    resizeMode: 'contain',
    position: 'absolute',
    bottom: 20,
  },
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    backgroundColor: constants.bgColor,
  },
});
