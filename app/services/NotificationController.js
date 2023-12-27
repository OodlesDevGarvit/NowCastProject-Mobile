import { Platform } from 'react-native';
import PushNotification, { Importance } from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType, importance } from '@notifee/react-native';
import * as API from '../constant/APIs';
import * as API_CONSTANT from '../constant/ApiConstant';
import { axiosInstance1 } from '../constant/Auth';
import { navigateItem } from './TabDesignsService';
import { store } from '../store/store';

export function notificationController(navigation, token, userId) {

  // console.log('notification controller is called with token and userIs', token, userId);
  requestUserPermission(token, userId);

  //----------------------controls notification redirection when app is in backgroiund state----------------
  messaging().onNotificationOpenedApp((remoteMessage) => {
    navigateFromNotification(remoteMessage, navigation, token, userId);
  });

  //----------------------controls notification redirection when app is in foreground state----------------
  messaging().onMessage((remoteMessage) => {
    if (Platform.OS == 'ios') {
      onNotification(remoteMessage, navigation, token, userId);
    }
  });

  //Working for android---
  PushNotification.configure({
    onNotification: (notification) => {
      onNotification(notification, navigation, token, userId);
    },
  });

  //create custom notification  channel------
  PushNotification.createChannel({
    channelId: 'channel-id', // (required)
    channelName: 'Push Notifications', // (required)
    channelDescription: 'A channel to categorise All your Local notification', // (optional) default: undefined.
    soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
    importance: 4, // (optional) default: 4. Int value of the Android notification importance
    vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
  });

  //THIS IS TO REDIRECT FROM NOTIFICATION WHEN APP IS IN FOREGROUND STATE IN IOS-
  notifee.onForegroundEvent(({ type, detail }) => {
    switch (type) {
      case EventType.PRESS:
        navigateFromNotification(detail.notification, navigation, token, userId);
        break;
    }
  });
}

//-----------------to send  user and device token to backend for push notification setup-------------
const saveDeviceDetails = async (token, userId, deviceId, tokenNoti) => {
  const orgId  = store.getState().activeOrgReducer.orgId;
  if (token == null) {
    try {
      let axiosConfig = {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
      let data = {
        deviceToken: `${tokenNoti}`,
        deviceType: Platform.OS == 'android' ? 'MOBILE_ANDROID' : 'MOBILE_IOS',
        organizationId: orgId,
        deviceUniqueKey: `${deviceId}`,
      };
      const res = await axiosInstance1.post(
        `${API.pushNotificationDeviceDetails}`,
        data,
        axiosConfig
      );
      // console.log('data is sent to backend devicedata>>', res)
    } catch (err) {
      // console.log('error while savingd device details wihtout login>>', err);
    }
  } else {
    try {
      let axiosConfig = {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
      let data = {
        deviceToken: `${tokenNoti}`,
        deviceType: Platform.OS == 'android' ? 'MOBILE_ANDROID' : 'MOBILE_IOS',
        userId: userId,
        deviceUniqueKey: `${deviceId}`,
      };

      let res = await axiosInstance1.post(
        `${API.pushNotificationDeviceDetails}`,
        data,
        axiosConfig
      );

      // console.log('res while saving user device details with login in notifcontroller>>', res);
    } catch (err) {
      // console.log('error while savingd device details with login>>', err);
    }
  }
};

//requests permission for notification IOS--
async function requestUserPermission(token, userId) {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    // console.log("Authorization status:", authStatus);
    getFcmToken(token, userId);
  }
}

//getting token from firebase--
const getFcmToken = async (token, userId) => {
  const deviceId =await  DeviceInfo.getUniqueId();
  try {
    const tokenNoti = await messaging().getToken();
    // console.log('Token is :', token);
    await AsyncStorage.setItem('@push_notification_token', tokenNoti);
    await AsyncStorage.setItem('deviceId', deviceId);

    saveDeviceDetails(token, userId, deviceId, tokenNoti);
    // console.log('token generated is :', token);
  } catch (err) {
    console.log('error is :', err.message);
  }
};

//--------------funciton to generate local notification  -----
const generateLocalNotification = (notification, mediaItem = null,token,userId) => {
  // console.log('generating local notification');
  PushNotification.localNotification({
    /* Android Only Properties */
    channelId: 'channel-id', // (required) channelId, if the channel doesn't exist, notification will not trigger.
    largeIcon: '', // (optional) default: "ic_launcher". Use "" for no large icon.
    largeIconUrl: mediaItem, // (optional) default: undefined
    //bigPictureUrl: mediaItem, // (optional) default: undefined
    smallIcon: 'ic_notification', // (optional) default: "ic_notification" with fallback for "ic_launcher". Use "" for default small icon.
    bigText: notification.message, // (optional) default: "message" prop
    ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear). should be used in combine with `com.dieam.reactnativepushnotification.notification_foreground` setting
    onlyAlertOnce: false, // (optional) alert will open only once with sound and notify, default: false
    messageId: 'google:message_id', // (optional) added as `message_id` to intent extras so opening push notification can find data stored by @react-native-firebase/messaging module.
    invokeApp: true, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true
    /* iOS and Android properties */
    id: notification.id, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
    title: notification.title, // (optional)
    message: notification.message ? notification.message.slice(0, 40) : ' ', // (required)
    soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
    data: notification.data,
    priority: 'high',
  });
};

// function to create notification for IOS foreground--
const createNotificationIOS = async (notification, imageUrl = undefined,token,userId) => {
  // console.log('this is notification in create notification>>', notification);
  const { data, messageId } = notification;
  const dataToSend = {
    ...data,
    fcm_options: '',
  };

  imageUrl
    ? await notifee.displayNotification({
        id: messageId,
        title: data.text,
        body: data.description,
        data: dataToSend,
        ios: {
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },

          attachments: [
            {
              url: imageUrl,
            },
          ],
        },
      })
    : await notifee.displayNotification({
        id: messageId,
        title: data.text,
        body: data.description,
        data: dataToSend,
        ios: {
          importance: Importance.HIGH,
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
      });
};

//called When notification in received to generate a certain type of local notification
function onNotification(notification, navigation, token, userId) {
  // when the notification data is selected  mediaSeries----------------

  const sqaureImageId = notification.data.squareArtworkId;

  //to navigation.navigate to inbpx when app is in foreground state ..
  if (notification.foreground && notification.userInteraction) {
    navigateFromNotification(notification, navigation, token, userId);
  }

  //to generate local notication with square image-
  if (sqaureImageId !== undefined || sqaureImageId !== null) {
    const imageUrl = `${API.IMAGE_LOAD_URL}/${sqaureImageId}?${API_CONSTANT.SQUARE_IMAGE_HEIGHT_WIDTH}`;
    if (
      Platform.OS == 'android' &&
      notification.foreground &&
      notification.userInteraction == false
    ) {
      generateLocalNotification(notification, imageUrl, token, userId);
    } else if (Platform.OS == 'ios') {
      createNotificationIOS(notification, imageUrl, token, userId);
    }
  } else {
    if (
      Platform.OS == 'android' &&
      notification.foreground &&
      notification.userInteraction == false
    ) {
      generateLocalNotification(notification, undefined, token, userId);
    } else if (Platform.OS == 'ios') {
      createNotificationIOS(notification, undefined, token, userId);
    }
  }
}

//  ----------------------------function to navigation.navigate to diffrent screens --------------------------------
const navigateFromNotification = async (notification, navigation, token, userId) => {
  const orgId= store.getState().activeOrgReducer.orgId;

  if (notification.data.mediaSeries) {
    const item = {
      id: notification.data.mediaSeries,
      type: notification.data.type == "EBOOK_SERIES" ? "EBOOK_SERIES" : 'MEDIASERIES',
    };
    return navigateItem(item, token, navigation, null, true);
  } else if (notification.data.mediaItem) {
    const item = {
      id: notification.data.mediaItem,
      type:notification.data.type ==  'EBOOK' ? 'EBOOK' : 'MEDIA_ITEM',
    };
    return navigateItem(item, token, navigation, null, true);
  } else if (notification.data.calendar) {
    const item = {
      id: notification.data.calendar,
      type: 'CALENDAR',
    };
    return navigateItem(item, token, navigation, null, true);
  } else if (notification.data.list) {
    const item = {
      id: notification.data.list,
      type: 'LIST',
    };
    return navigation('VideoOnDemand', {
      itemId: notification.data.list,
      type: 'LIST',
    });
  } else if (notification.data.album) {
    const item = {
      id: notification.data.album,
      type: 'ALBUM',
    };
    return navigateItem(item, token, navigation, null, true);
  } else if (notification.data.link) {
    const item = {
      type: 'LINK',
      id: notification.data.link,
    };
    return navigateItem(item, token, navigation, null, true);
  } else if (notification.data.event) {
    const item = {
      id: notification.data.event,
      type: 'EVENT',
    };
    return navigateItem(item, token, navigation, null, true);
  } else if (notification.data.songs) {
    const item = {
      id: notification.data.songs,
      type: 'MUSIC',
    };
    return navigateItem(item, token, navigation, null, true);
  } else if (notification.data.rssFeed) {
    const item = {
      id: notification.data.rssFeed,
      type: 'RSSFEED',
    };
    return navigateItem(item, token, navigation, null, true);
  } else {
    navigation('DrawerNavigator', { screen: 'Inbox' });
  }
};
//---------------------------------------navigation END---------------------------------------------------
