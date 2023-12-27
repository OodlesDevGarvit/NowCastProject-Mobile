import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  FlatList,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DynamicThemeConstants } from '../../constant/ThemeConstant';
import { axiosInstance1 } from '../../constant/Auth';
import * as API_CONSTANT from '../../constant/ApiConstant';
import * as API from '../../constant/APIs';
import Loader from '../../components/Loader';
import { useSelector } from 'react-redux';
export default function Notifications({ navigation, route }) {
  const [mainSwitch, setMainSwitch] = useState('');
  const { token, isAuthenticated,userId } = useSelector(state => state.authReducer);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { orgId } = useSelector(state => state.activeOrgReducer);

  const theme = route.params;

  //to get the value of mainSwitch from apis based on if the user is logged in or not---------
  const getVAlueOfMainASwitch = async () => {
    const deviceToken = await AsyncStorage.getItem('@push_notification_token');

    if (isAuthenticated) {
      try {
        const axiosConfig = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };

        const res = await axiosInstance1.get(
          `${API.mainNotificationWithogin}?deviceType=${
            Platform.OS == 'android' ? 'MOBILE_ANDROID' : 'MOBILE_IOS'
          }`,
          axiosConfig
        );
        // console.log('main switch is loggedIn :', res.data.data);
        setMainSwitch(res.data.data);
        setIsLoading(false);
      } catch (err) {
        console.log('err while getting value of the main switch >>', err);
        setIsLoading(false);
      }
    } else {
      const res = await axiosInstance1.get(
        `${
          API.mainNotificationWithoutLogin
        }?deviceToken=${deviceToken}&deviceType=${
          Platform.OS == 'android' ? 'MOBILE_ANDROID' : 'MOBILE_IOS'
        }`
      );
      // console.log('main switch is withoutLogIN :', res.data.data);
      setMainSwitch(res.data.data);
      setIsLoading(false);
    }
  };

  //to get all the topics  consitionally if  user is logged in or not------------------------------------
  const getAllGroups = async () => {
    const deviceToken = await AsyncStorage.getItem('@push_notification_token');
    if (!isAuthenticated) {
      try {
        let res = await axiosInstance1.get(
          `${API.notificationWithout}?organizationId=${orgId}&token=${deviceToken}`
        );
        // console.log('All topic without login >>', res.data.data);
        setTopics(res.data.data);
        setIsLoading(false);
      } catch (err) {
        console.log('error while gettign all groups without login');
        setIsLoading(false);
      }
    } else {
      try {
        let axiosConfig = {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ` + `${token}`,
          },
        };

        let res = await axiosInstance1.get(
          `${API.notification}?userId=${userId}&token=${deviceToken}`,
          axiosConfig
        );
        // console.log('All topic with login >>', res.data.data);
        setTopics(res.data.data);
        setIsLoading(false);
      } catch (err) {
        console.log('error while gettign all groups without login');
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    getVAlueOfMainASwitch();
    getAllGroups();
  }, []);

  //to unsubscribe all topics at once-------------------------------------
  async function unsubscribeAll() {
    setMainSwitch(!mainSwitch);
    setIsLoading(true);

    const deviceId = await AsyncStorage.getItem('deviceId');
    const deviceToken = await AsyncStorage.getItem('@push_notification_token');

    // console.log("access Token is :", accessToken);

    if (!isAuthenticated) {
      try {
        let res = await axiosInstance1.put(
          `${
            API.changeNotificationStateWithout
          }?deviceToken=${deviceToken}&deviceType=${
            Platform.OS == 'android' ? 'MOBILE_ANDROID' : 'MOBILE_IOS'
          }&deviceUniqueKey=${deviceId}&organizationId=${
          orgId
          }&subscribedKey=${!mainSwitch}`
        );

        // console.log(
        //   'res while unscbs all groups without login >>',
        //   res.data.data
        // );
        getVAlueOfMainASwitch();
        getAllGroups();
        setIsLoading(false);
      } catch (err) {
        console.log('error while unsubscring all groups without login', err);
        setIsLoading(false);
      }
    } else {
      try {
        const axiosConfig = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };
        let res = await axiosInstance1.put(
          `${
            API.changeNotificationStateWith
          }?deviceToken=${deviceToken}&deviceType=${
            Platform.OS == 'android' ? 'MOBILE_ANDROID' : 'MOBILE_IOS'
          }&deviceUniqueKey=${deviceId}&subscribedKey=${!mainSwitch}`,
          null,
          axiosConfig
        );
        // console.log('res while unscbs all groups with login >>', res);
        getVAlueOfMainASwitch();
        getAllGroups();
        setIsLoading(false);
      } catch (err) {
        console.log('error while unsubscring all groups with login', err);
        setIsLoading(false);
      }
    }
  }

  //to toggle between subscribe and unsubscribe--------------------------
  const toSubscibeTopic = (id) => {
    AsyncStorage.getItem('deviceId').then(async (value) => {
      let deviceId = value;

      // console.log("device id is :", deviceId);

        if (!isAuthenticated) {
          AsyncStorage.getItem('@push_notification_token').then(
            async (notificationToken) => {
              // console.log("noti token is :", notificationToken);
              let data = {};

              const newTopics = topics.map((item) => {
                if (item.id == id) {
                  data = {
                    deviceType:
                      Platform.OS == 'android'
                        ? 'MOBILE_ANDROID'
                        : 'MOBILE_IOS',
                    groupId: id,
                    deviceUniqueKey: deviceId,
                    organizationId: orgId,
                    subscribe: !item.notificationAllowed,
                    tokens: notificationToken,
                  };
                  return {
                    ...item,
                    notificationAllowed: !item.notificationAllowed,
                  };
                } else {
                  return item;
                }
              });
              setTopics(newTopics);

              axiosInstance1
                .post(`${API.subscribe}`, data)
                .then((res) => {
                  // console.log(res.data)
                  setIsLoading(false);
                })
                .catch((err) => {
                  // console.log(err)
                  setIsLoading(false);
                });
            }
          );
        } else {
            AsyncStorage.getItem('@push_notification_token').then(
              async (token) => {
               
                const newTopics = topics.map((item) => {
                  if (item.id == id) {
                    let axiosConfig = {
                      headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + `${token}`,
                      },
                    };
                    let data = {
                      deviceType:
                        Platform.OS == 'android'
                          ? 'MOBILE_ANDROID'
                          : 'MOBILE_IOS',
                      groupId: id,
                      organizationId: orgId,
                      subscribe: !item.notificationAllowed,
                      userId: userId,
                      tokens: token,
                      deviceUniqueKey: deviceId,
                    };
                    axiosInstance1
                      .post(`${API.subscribe}`, data, axiosConfig)
                      .then((res) => {
                        // console.log(res.data)
                        setIsLoading(false);
                      })
                      .catch((err) => {
                        // console.log(err)
                        setIsLoading(false);
                      });

                    return {
                      ...item,
                      notificationAllowed: !item.notificationAllowed,
                    };
                  } else {
                    return item;
                  }
                });
                setTopics(newTopics);
              }
            );

        }

    });
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
      <Loader loading={isLoading} />
      <View style={{ ...Styles.item, backgroundColor: '#d3d3d3' }}>
        <Text style={Styles.text}>{mainSwitch ? 'On' : 'Off'}</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#333001' }}
          thumbColor={
            mainSwitch ? (theme == 'DARK' ? '#60669F' : '#010433') : '#f4f3f4'
          }
          value={mainSwitch}
          onValueChange={() => {
            unsubscribeAll();
          }}
        />
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          bounces={false}
          data={topics}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                ...Styles.item,
                opacity: mainSwitch ? 1 : 0.5,
              }}
            >
              <Text
                style={{
                  ...Styles.text,
                  color:
                    theme == 'DARK'
                      ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                      : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                }}
              >
                {item.name}
              </Text>
              <Switch
                disabled={!mainSwitch}
                trackColor={{ false: '#767577', true: '#d3d3d3' }}
                thumbColor={
                  item.notificationAllowed
                    ? theme == 'DARK'
                      ? '#60669F'
                      : '#010433'
                    : '#f4f3f4'
                }
                value={item.notificationAllowed}
                onValueChange={() => {
                  toSubscibeTopic(item.id);
                }}
              />
            </View>
          )}
        />
      </View>
    </View>
  );
}

const Styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 16,
  },
});
