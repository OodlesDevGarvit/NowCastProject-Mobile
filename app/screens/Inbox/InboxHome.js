import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
  FlatList,
  ActivityIndicator
} from 'react-native';
import ThemeConstant from '../../constant/ThemeConstant';
import { DynamicThemeConstants } from '../../constant/ThemeConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosInstance1 } from '../../constant/Auth';
import * as API_CONSTANT from '../../constant/ApiConstant';
import * as API from '../../constant/APIs';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { format } from 'date-fns';
import Loader from '../../components/Loader';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { SET_ALERT } from '../../store/actions/types';
import { useFocusEffect } from '@react-navigation/native';


let limit = 10;
let loadMore = true;

export default function InboxHome({ navigation, route }) {
  const dispatch = useDispatch();
  const { brandColor, mobileTheme: theme } = useSelector((state) => state.brandingReducer.brandingData);
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const { token, isAuthenticated } = useSelector(state => state.authReducer);
  const { noInternetModalVisible } = useSelector(state => state.noInternetReducer)

  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showloader, setShowLoader] = useState(false)
  const [render, setRender] = useState(true);
  const [page, setPage] = useState(1)

  useFocusEffect(
    React.useCallback(() => {
      loadMore = true
    }, [])
  )

  //to fetch initial notification data
  useEffect(() => {
    fetchData();
  }, [])


  //fn to fetch the notifications
  const fetchData = async () => {
    const deviceToken = await AsyncStorage.getItem('@push_notification_token');
    const query = `?page=${page}&size=${limit}`;
    const query2 = `?organizationId=${orgId}&page=${page}&size=${limit}&token=${deviceToken}`
    if (isAuthenticated) {
      let axiosConfig = {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      try {
        const res = await axiosInstance1.get(`${API.inboxNotifications}` + query, axiosConfig);
        processData(res);
      } catch (err) {
        console.log('error while getting notifications with login>', err);
        if (noInternetModalVisible == false) {
          dispatch({
            type: SET_ALERT, payload: {
              setShowAlert: true,
              data: {
                message: 'Could not fetch notification data , please try again',
                showCancelButton: true,
                onCancelPressed: () => {
                  dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                },
              }
            }
          })
        }
        setRefreshing(false);
        setLoading(false);


      }
    } else {
      try {
        const res = await axiosInstance1.get(`${API.inboxNotificationWithout}` + query2);
        processData(res);
      } catch (err) {
        console.log('error while getting notifications without login>', err);
        if (noInternetModalVisible == false) {
          dispatch({
            type: SET_ALERT, payload: {
              setShowAlert: true,
              data: {
                message: 'Could not fetch notification data , please try again',
                showCancelButton: true,
                onCancelPressed: () => {
                  dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                },
              }
            }
          })
        }
        setRefreshing(false);
        setLoading(false);

      }
    }
  };

  //fn to fetch notification on pull down to refresh
  const fetchOnRefresh = async () => {
    const deviceToken = await AsyncStorage.getItem('@push_notification_token');
    const query2 = `?organizationId=${orgId}&token=${deviceToken}`
    if (isAuthenticated) {
      let axiosConfig = {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      try {
        const res = await axiosInstance1.get(`${API.inboxNotifications}`, axiosConfig);
        processOnRefresh(res);
      } catch (err) {
        console.log('error while getting notifications with login>', err);
        if (noInternetModalVisible == false) {
          dispatch({
            type: SET_ALERT, payload: {
              setShowAlert: true,
              data: {
                message: 'Could not fetch notification data , please try again',
                showCancelButton: true,
                onCancelPressed: () => {
                  dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                },
              }
            }
          })
        }
        setRefreshing(false);
        setLoading(false);

      }
    } else {
      try {
        const res = await axiosInstance1.get(`${API.inboxNotificationWithout}` + query2);
        processOnRefresh(res);
      } catch (err) {
        console.log('error while getting notifications without login>', err);
        if (noInternetModalVisible == false) {
          dispatch({
            type: SET_ALERT, payload: {
              setShowAlert: true,
              data: {
                message: 'Could not fetch notification data , please try again',
                showCancelButton: true,
                onCancelPressed: () => {
                  dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                },
              }
            }
          })
        }
        setRefreshing(false);
        setLoading(false);

      }
    }
  }

  //to process the data fetched in the above function
  const processData = (res) => {
    let notifications = res.data.data.content;
    console.log('res>>', res.data.data)
    if (res.data.data?.last == true) {
      loadMore = false;
    }
    notifications.map((item) => {
      if (item.squareArtwork !== null) {
        item.squareArtwork[
          'newImage'
        ] = `${API.IMAGE_LOAD_URL}/${item?.squareArtwork?.document?.id}?${API_CONSTANT.SQUARE_IMAGE_ROW_HEIGHT_WIDTH}`;
      }
      if (item.wideArtwork !== null) {
        item.wideArtwork[
          'newImage'
        ] = `${API.IMAGE_LOAD_URL}/${item?.wideArtwork?.document?.id}?${API_CONSTANT.WIDE_IMAGE_HEIGHT_WIDTH_EVENT}`;
      }
      if (item.bannerArtwork !== null) {
        item.bannerArtwork[
          'newImage'
        ] = `${API.IMAGE_LOAD_URL}/${item?.bannerArtwork?.document?.id}?${API_CONSTANT.BANNER_IMAGE_HEIGHT_WIDTH}`;
      }
    });
    if (notifications.length == 0) {
      setRender(false);
    }
    console.log('notifications are:', notifications);
    setData([...data, ...notifications]);
    setPage(page + 1);
    setShowLoader(false)
    setRefreshing(false);
    setLoading(false);
  };

  //fn to process data 
  const processOnRefresh = (res) => {
    let namelist = res.data?.data;
    console.log('namelist>>', namelist)
    let notifications = namelist;
    if (namelist?.last == true) {
      loadMore = false;
    }
    notifications.map((item) => {
      if (item.squareArtwork !== null) {
        item.squareArtwork[
          'newImage'
        ] = `${API.IMAGE_LOAD_URL}/${item?.squareArtwork?.document?.id}?${API_CONSTANT.SQUARE_IMAGE_ROW_HEIGHT_WIDTH}`;
      }
      if (item.wideArtwork !== null) {
        item.wideArtwork[
          'newImage'
        ] = `${API.IMAGE_LOAD_URL}/${item?.wideArtwork?.document?.id}?${API_CONSTANT.WIDE_IMAGE_HEIGHT_WIDTH_EVENT}`;
      }
      if (item.bannerArtwork !== null) {
        item.bannerArtwork[
          'newImage'
        ] = `${API.IMAGE_LOAD_URL}/${item?.bannerArtwork?.document?.id}?${API_CONSTANT.BANNER_IMAGE_HEIGHT_WIDTH}`;
      }
    });
    if (notifications.length == 0) {
      setRender(false);
    }
    console.log('notifications are:', notifications);
    setData(notifications);
    setPage(page + 1);
    setShowLoader(false)
    setRefreshing(false);
    setLoading(false);
  }

  //called on pull down to refresh 
  const onRefresh = () => {
    if (!refreshing) {
      setRefreshing(true);
      fetchOnRefresh()
    }
  };

  //to format the date
  const getDate = (passedDate, passedTime) => {
    // console.log("passedDate :", passedDate);
    // console.log("passedTime :", passedTime);
    let date, time, timeNew;
    let dateTime = moment
      .utc(`${passedDate} ${passedTime}`)
      .local()
      .format();
    [date, timeNew] = dateTime.split('T');
    time = timeNew.slice(0, 8);

    // Get the current date and time in the user's time zone
    var currentDate = new Date(date);
    console.log('current date',currentDate);

    // Get the user's time zone offset in minutes
    var timezoneOffset = currentDate.getTimezoneOffset();
    console.log('timezoneoffset',timezoneOffset);

    // Convert the offset to milliseconds
    var offsetMilliseconds = timezoneOffset * 60 * 1000;
    console.log('offsetmilisecond',offsetMilliseconds);

    var adjustedDate = new Date(currentDate.getTime() + offsetMilliseconds).getDate()
    console.log('adjusted date isss',adjustedDate);

    if (new Date(date).getDate() === new Date().getDate()) {
      let timeStr = time.slice(0, 5);
      let timeToshow = tConvert(timeStr);
      return timeToshow;
    }
    else if(adjustedDate === new Date().getDate() ) {
      let timeStr = time.slice(0, 5);
      let timeToshow = tConvert(timeStr);
      return timeToshow;
    }
    else if (new Date(date).getDate() + 1 === new Date().getDate()) {
      return 'yesterday';
    }
    return format(new Date(date), 'do MMM');
  };

  //converting the time format--------------------------
  function tConvert(time) {
    // Check correct time format and split into components
    time = time
      .toString()
      .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) {
      // If time format correct
      time = time.slice(1); // Remove full string match value
      time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join(''); // return adjusted time or original string
  }

  //called once on end is called .
  const onEndReached = () => {
    if (loadMore) {
      setShowLoader(true);
      fetchData()
    }
  }

  const _listFooterComponent = useCallback(() => {
    return <ActivityIndicator style={{ marginVertical: 16 }} color={brandColor} size={'large'} />;
  }, [])

  const _keyExtractor = useCallback((item) => item.id.toString());

  const _renderItem = useCallback(({ item, index }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          ...Styles.item,
        }}
        onPress={() => {
          // if (item.contentId !== null)
          navigation.navigate('InboxDetail', { item, getDate });
        }}
      >
        <View style={Styles.left}>
          {/* <Text>{item.id}</Text> */}
          <Text
            style={{
              ...Styles.type,
              color:
                theme == 'DARK'
                  ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                  : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY,
            }}
          >
            {item.groupName}
          </Text>
          <Text
            style={{
              ...Styles.description,
              color:
                theme == 'DARK'
                  ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                  : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY,
            }}
          >
            {item.text}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              ...Styles.date,
              color:
                theme == 'DARK'
                  ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                  : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY,
            }}
          >
            {item?.notificationSentDate !== null && item?.notificationSentTime !== null
              ? getDate(
                item?.notificationSentDate,
                item?.notificationSentTime
              )
              : null}
          </Text>
          {item.contentId !== null ? (
            <View
              style={{
                backgroundColor:
                  item.squareArtwork !== null &&
                    item.squareArtwork.document
                    ? item.squareArtwork?.document?.imageColur
                    : ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR,
                ...Styles.img,
              }}
            >
              <Image
                style={Styles.img}
                source={{ uri: item.squareArtwork['newImage'] }}
              />
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    )
  }, [data])

  if (render) {
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
        <StatusBar
          animated={true}
          backgroundColor={brandColor}
        />
        <Loader loading={loading} />

        <FlatList
          data={data}
          refreshControl={<RefreshControl tintColor={'gray'} refreshing={refreshing} onRefresh={onRefresh} />}
          keyExtractor={_keyExtractor}
          renderItem={_renderItem}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={showloader && _listFooterComponent}
        />
      </View>
    );
  } else {
    return (
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <StatusBar
          animated={true}
          backgroundColor={brandColor}
        />
        <View
          style={{
            flex: 1,
            backgroundColor:
              theme == 'DARK'
                ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
                : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Icon name="inbox" size={150} color={'gray'} />

            <Text
              style={{
                color:
                  theme == 'DARK'
                    ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                    : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                fontSize: 20,
              }}
            >
              No notifications
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const Styles = StyleSheet.create({
  item: {
    // borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    height: 120,
  },
  left: {
    // borderWidth: 1,
    maxWidth: '83%',
    overflow: 'hidden',
  },
  type: {
    // borderWidth: 1,
    fontSize: 14,
    marginBottom: 10,
    color: ThemeConstant.TEXT_COLOR_SUBTEXTS,
  },
  description: {
    // borderWidth: 1,
    fontSize: 18,
    color: ThemeConstant.TEXT_COLOR_SUBTEXTS,
    lineHeight: 20,
    maxHeight: 50,
    paddingBottom: 7,
    overflow: 'hidden',
  },
  date: {
    // borderWidth: 1,
    marginBottom: 10,
    color: ThemeConstant.TEXT_COLOR_SUBTEXTS,
  },
  img: {
    width: 50,
    height: 50,
    // borderRadius: ThemeConstant.BORDER_RADIUS_SMALL
  },
  button: {
    backgroundColor: ThemeConstant.BACKGROUND_COLOR_SELECTED,
    padding: 10,
    marginTop: 40,
    marginHorizontal: 20,
  },
});
