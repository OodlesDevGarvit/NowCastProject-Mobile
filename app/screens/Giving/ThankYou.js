import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Animated,
  StatusBar,
  BackHandler,
  SafeAreaView,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import CircleIcon from 'react-native-vector-icons/FontAwesome';
import InboxIcon from 'react-native-vector-icons/EvilIcons';
import { useDispatch, useSelector } from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import Loader from '../../components/Loader';
import * as API from '../../constant/APIs';
import * as API_CONSTANT from '../../constant/ApiConstant';
import { BASE_URL } from '../../constant/Auth';
import { SET_ALERT } from '../../store/actions/types';
const deviceWidth = Dimensions.get('window').width;

export default function ThankYouScreen({ navigation, route }) {
  const dispatch = useDispatch()
  const fromItem = route.params?.fromItem;
  const { givingId, invoiceId, amount } = route.params
  const { brandColor, mobileTheme: theme, organizationName: orgName, } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const backAction = () => {
      navigation.navigate('DrawerNavigator');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  function historyDownload(url) {
    //Function to check the platform
    //If iOS the start downloading
    //If Android then ask for runtime permission
    if (Platform.OS === 'ios') {
      setLoading(false);
      downloadHistory(url);
    } else {
      setLoading(false);
      try {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'storage title',
            message: 'storage_permission',
          }
        ).then((granted) => {
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            //Once user grant the permission start downloading
            console.log('Storage Permission Granted.');
            downloadHistory(url);
          } else {
            //If permission denied then show alert 'Storage Permission
            // Not Granted'
            dispatch({
              type: SET_ALERT, payload: {
                setShowAlert: true,
                data: {
                  message: 'storage_permission',
                  showCancelButton: true,
                  onCancelPressed: () => {
                    dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                  },
                }
              }
            })
          }
        });
      } catch (err) {
        //To handle permission related issue
        console.log('error', err);
      }
    }
  }

  async function downloadHistory(url) {
    setLoading(true);
    const { config, fs } = RNFetchBlob;
    let path = Platform.OS == 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir
    let date = new Date();
    let options = {
      fileCache: true,
      path:
        path +
        `/${orgName}` +
        Math.floor(date.getTime() + date.getSeconds() / 2) + '.pdf',
      addAndroidDownloads: {
        //Related to the Android only
        path:
          path +
          `/${orgName}` +
          Math.floor(date.getTime() + date.getSeconds() / 2) + '.pdf',
        useDownloadManager: true,
        notification: true,
        title: `Receipt${Date.now()}`,
        description: 'Downloading...',
        mime: 'application/pdf',
        mediaScannable: true,
        description: 'Risk Report Download',
      },
    };
    config(options)
      .fetch('GET', url)
      .then((res) => {
        console.log('success')
        setLoading(false);
        dispatch({
          type: SET_ALERT, payload: {
            setShowAlert: true,
            data: {
              message: 'Receipt downloaded successfully',
              showCancelButton: true,
              onCancelPressed: () => {
                dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
              },
            }
          }
        })
      })
      .catch(err => {
        console.log('error', err);
        setLoading(false);
        dispatch({
          type: SET_ALERT, payload: {
            setShowAlert: true,
            data: {
              message: 'Receipt download failed',
              showCancelButton: true,
              onCancelPressed: () => {
                dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
              },
            }
          }
        })
      })
  }

  const downloadReceipt = async () => {
    historyDownload(`${BASE_URL}/${API.DownloadGivingReceipt}/${givingId}/${invoiceId}`);
  };

  return (
    <SafeAreaView style={styles.innerContainer}>
      <StatusBar
        animated={true}
        backgroundColor={brandColor} />
      <View style={styles.backArrow}>
        <Loader loading={loading} />
        {Platform.OS == 'ios' ? (
          <TouchableOpacity
            style={{
              width: '100%',
              height: '100%',
              alignItems: 'center',
              marginVertical: 40,
              marginHorizontal: 10,
            }}
            onPress={() => {
              if (fromItem == true) {
                navigation.navigate('MediaItem');
              } else {
                navigation.navigate('DrawerNavigator');
              }
            }}
          >
            <Icon name="arrowleft" color={'#000'} size={24} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{ width: '100%', height: '100%', alignItems: 'center' }}
            onPress={() => {
              if (fromItem == true) {
                navigation.navigate('MediaItem');
              } else {
                navigation.navigate('DrawerNavigator');
              }
            }}
          >
            <Icon name="arrowleft" color={'#000'} size={24} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.innerMost}>
        <View style={styles.IconContainer}>
          <CircleIcon
            name="check-circle"
            size={70}
            color={'green'}
            style={{ ...styles.Icon, marginTop: 35 }}
          />
        </View>

        <View style={styles.texts}>
          <Text style={styles.thankYou}>Thank You!</Text>
          <Text numberOfLines={2} style={styles.amount}>
            You donated <Text style={{ color: brandColor }}>${amount}</Text>{' '}
          </Text>
          <View style={styles.message}>
            <InboxIcon name="envelope" size={24} />
            <Text>You will receive your donation receipt via email</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <View
            style={{
              ...styles.btn,
              backgroundColor: brandColor,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                if (fromItem == true) {
                  navigation.navigate('MediaItem');
                } else {
                  navigation.navigate('DrawerNavigator');
                }
              }}
            >
              <Text style={{ color: '#fff' }}>Donate Again</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              ...styles.btnOutline,
              ...styles.btn,
              backgroundColor: brandColor,
              borderColor: brandColor,
            }}
          >
            <TouchableOpacity activeOpacity={0.5} onPress={downloadReceipt}>
              <Text style={{ color: '#fff' }}>Download receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    backgroundColor: '#fff',
    flex: 1,
  },
  innerMost: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    marginTop: 40,
  },
  IconContainer: {
    borderWidth: 0,
    width: 120,
    height: 120,
    borderRadius: 70,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  texts: {
    // borderWidth: 1,
    alignItems: 'center',
    padding: 10,
  },

  thankYou: {
    fontSize: 50,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 10,
  },
  message: {
    fontSize: 14,
    marginTop: 10,
    flexDirection: 'row',
  },
  buttons: {
    flexDirection: 'row',
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginHorizontal: 10,
    marginTop: 20,
    color: '#fff',
    borderRadius: 10,
  },
  btnOutline: {
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 10,
    marginTop: 20,
    borderRadius: 10,
  },
  backArrow: {
    position: 'absolute',
    top: 10,
    left: 0,
    width: 40,
    height: 30,
  },
});
