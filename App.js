import React, { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  StatusBar,
} from 'react-native';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
  StackActions,
} from '@react-navigation/native';
import { axiosInstance1 } from './app/constant/Auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as API from './app/constant/APIs';
import * as API_CONSTANT from './app/constant/ApiConstant';
import RootNavigator from './app/navigation/RootNavigator';
import { getBranding } from './app/store/actions/brandingAction';
import { useDispatch, useSelector } from 'react-redux';
import { DEVICE_TYPES } from './app/constant/StringConstant';
import deviceInfoModule, { getUniqueId } from 'react-native-device-info';
import { getUserDetails, logoutUser } from './app/store/actions/authAction';
import SQLite from 'react-native-sqlite-storage';
import { createConversationTable } from './query';
import RNFetchBlob from 'rn-fetch-blob';
import { IOSAccessModal, IOSPaidModal } from './app/components';
import {
  SET_ALERT,
  SET_FETCHED,
  SET_NOINTERNET_MODAL,
  SET_SPLASH,
  SET_SPLASH_URL,
  SET_YEAR_STRING,
} from './app/store/actions/types';
import { NoInternet } from './app/components/modal/NointernetModal';
import NetInfo from '@react-native-community/netinfo';
import CustomAlert from './app/components/modal/CustomAlert';
import SplashScreen from 'react-native-splash-screen';
import RNBootSplash from 'react-native-bootsplash';
import { constants } from './app/screens/splashScreen/SplashScreen';
import { StripeProvider } from '@stripe/stripe-react-native';
import Immersive from 'react-native-immersive';
import { getFileNameService } from './operations';
import {
  PERMISSIONS,
  request,
  requestNotifications,
} from 'react-native-permissions';

import { checkUpdateNeeded } from './app/utils/forceUpdate';
import {
  initConnection,
  clearProductsIOS,
  clearTransactionIOS,
} from 'react-native-iap';
import { getPurchasedItems } from './app/store/actions/purchasedItemsAction';
import { setAllPlansInApp } from './app/store/actions/inAppPlansAction';

const WAIT_TIME = 5000;

const APPINFOTYPE = {
  APP_DOWNLOAD: 'APP_DOWNLOAD',
  APP_LAUNCHES: 'APP_LAUNCHES',
  APP_IMPRESSION: 'APP_IMPRESSION',
};
export const navigationRef = React.createRef();

export function navigate(name, params) {
  navigationRef.current?.dispatch(StackActions.push(name, params));
}

const App = () => {
  const dispatch = useDispatch();
  const { mobileTheme: theme, minAppVerison } = useSelector(
    state => state.brandingReducer.brandingData,
  );
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const { key } = useSelector(state => state.publishableKey);
  const { token, isAuthenticated, user, userId } = useSelector(
    state => state.authReducer,
  );
  const { isVisible } = useSelector(state => state.splashReducer);
  const [done, setDone] = useState(false);
  const doneRef = useRef(done);
  doneRef.current = done;

  useEffect(() => {
    getPermissions();
  }),
    [];

  const getPermissions = async () => {
    if (Platform.OS === 'android') {
      await pushNoticationPermission();
    } else {
    }
  };

  const pushNoticationPermission = async () => {
    // try {
    //   const granted = await PermissionsAndroid.request(
    //     PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    //     {
    //       title: "Permissions required",
    //       message: "Please allow Nowcast permissions to enable push notification",

    //       buttonPositive: "OK"
    //     },
    //   );
    // } catch (err) {
    //   console.warn(err)
    // }
    try {
      await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then(value => {
        console.log('value');
      });
    } catch (err) { }
  };

  useEffect(() => {
    if (Platform.OS == 'ios') {
      const startConnection = async () => {
        await clearProductsIOS();
        await clearTransactionIOS();
        await initConnection();
      };
      startConnection().catch(console.error);
    }
  }, []);

  //hide splash after 5 sec if no response from api --
  useEffect(() => {
    let timer = setTimeout(() => {
      if (doneRef.current == false) {
        hideSplash();
      }
    }, WAIT_TIME);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // console.log('visiblity changed of splash screen')
    if (isVisible == false && Platform.OS == 'android') {
      Immersive.setImmersive(false);
    } else if (isVisible == false && Platform.OS == 'ios') {
      StatusBar.setHidden(false);
    }
  }, [isVisible]);

  //set current year  in drawer

  useEffect(() => {
    let str;
    let yr = new Date().getFullYear();
    // console.log('year >>', yr)
    str = yr + `-${+yr.toString().slice(2) + 1}`;
    dispatch({ type: SET_YEAR_STRING, payload: str });
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected == true) {
        dispatch({ type: SET_NOINTERNET_MODAL, payload: false });
      } else if (state.isConnected == false) {
        dispatch({ type: SET_NOINTERNET_MODAL, payload: true });
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // CALLING FUNCTIONS WHILE APP LAUNCHES_
  useEffect(() => {
    (async () => {
      await dispatch(getBranding(() => BackHandler.exitApp()));
      await appInformation(APPINFOTYPE.APP_LAUNCHES);
      await gettingBibleData();
      await appDownloadCount();
      if (Platform.OS == 'ios') dispatch(setAllPlansInApp());
      await checkUpdateNeeded(minAppVerison, dispatch);
      if (isAuthenticated) {
        dispatch(getUserDetails(token, userId));
        dispatch(getPurchasedItems(token));
      }
    })();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getUserDetails(token, userId));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // truncateConversationData() //----to delete data from db table
    // dropConversationDataTable() //--- to drop tables from db
    getFileNameService();
    SQLite.enablePromise(true);
  }, []);

  useEffect(() => {
    API_CONSTANT.db.transaction(tnx => {
      tnx.executeSql(
        createConversationTable,
        [],
        (sqlTnx, res) => {
          // console.log(sqlTnx)
          // console.log("Table Creation for conversation Successfully", res);
        },
        error => {
          // console.log("error on creating conversation Table: " + error.message);
        },
      );
    });
  }, []);

  //setting BibleData data to [] when bible date is null -
  async function gettingBibleData() {
    const data = await AsyncStorage.getItem('bibleData');
    if (data == null) {
      AsyncStorage.setItem('bibleData', JSON.stringify([]));
    }
  }

  const hideSplash = async () => {
    // console.log('hide splash is called')
    if (Platform.OS == 'android') {
      SplashScreen.hide();
    } else {
      RNBootSplash.hide({ fade: true });
    }
    await dispatch({ type: SET_SPLASH, payload: false });
  };

  //TO COUNT APP DOWNLOAD  AND APP LAUNCHED
  const appInformation = async appInfoType => {
    let appVersion = deviceInfoModule.getVersion();
    const deviceId = await getUniqueId();
    const data = {
      appInfoType: appInfoType,
      appVersion: appVersion,
      deviceId: deviceId,
      deviceType:
        Platform.OS == 'android'
          ? DEVICE_TYPES.MOBILE_ANDROID
          : DEVICE_TYPES.MOBILE_IOS,
    };
    try {
      const res = await axiosInstance1.post(
        `${API.appInfo}?organizationId=${orgId}`,
        data,
      );

      // console.log('res>>', res.data.data)
      //SPLASH SCREEN IS HANDLES HERE TO HIDE IF WE DO NOT GET URL IN THIS API.
      if (res.data.data.splashScreenContentUrl == null) {
        setTimeout(async () => {
          if (Platform.OS == 'android') {
            await SplashScreen.hide();
          } else {
            await RNBootSplash.hide({ fade: true });
          }
          await dispatch({ type: SET_SPLASH, payload: false });
        }, constants.duration - 3000);
      } else {
        await dispatch({
          type: SET_SPLASH_URL,
          payload: res.data.data.splashScreenContentUrl,
        });
        await dispatch({ type: SET_FETCHED, payload: true });
      }

      setDone(true);
    } catch (error) {
      console.log(
        'error while saving app info for launches and downloads',
        error,
      );
      hideSplash();
      setDone(true);
    }
  };

  const makeDownloadsFolder = () => {
    const dirs = RNFetchBlob.fs.dirs; //Use the dir API
    const encrptedFolder = dirs.DownloadDir + '/.NowCastDownloads/';
    const decrptedFolder = dirs.DownloadDir + '/.Decrypted/';
    RNFetchBlob.fs.mkdir(encrptedFolder).catch(err => {
      // console.log(err);
    });
    RNFetchBlob.fs.mkdir(decrptedFolder).catch(err => {
      // console.log(err);
    });
    // console.log(dirs.DownloadDir);
    // console.log(encrptedFolder, decrptedFolder, 'both folder');
  };

  // TO COUNT APP DOWNLOAD  WILL BE CALLED WHEN YOU FIRST INSTALL THE APP AFTER INSTALLING
  const appDownloadCount = async () => {
    const launchCount = await AsyncStorage.getItem('launchCount');
    if (launchCount == null) {
      appInformation(APPINFOTYPE.APP_DOWNLOAD);
      AsyncStorage.setItem('launchCount', JSON.stringify(true));
      makeDownloadsFolder();
    } else {
      // console.log('not a first launching app');
    }
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={theme == 'DARK' ? DarkTheme : DefaultTheme}>
      <StripeProvider publishableKey={key}>
        <IOSPaidModal navigate={navigate} />
        <IOSAccessModal />
        <NoInternet />
        <CustomAlert />
        <RootNavigator />
      </StripeProvider>
    </NavigationContainer>
  );
};

export default App;
