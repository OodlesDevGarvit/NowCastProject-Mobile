import React, { useEffect, useLayoutEffect, useState } from 'react'
import { View, StyleSheet, Dimensions, StatusBar, } from 'react-native'
import { axiosInstance1 } from '../../constant/Auth';
import * as API from '../../constant/APIs';
import * as API_CONSTANT from '../../constant/ApiConstant';
import EventList from '../../components/EventList';
import Loader from '../../components/Loader';
import { DynamicThemeConstants } from '../../constant/ThemeConstant';
import { useDispatch, useSelector } from 'react-redux';
import { SET_ALERT } from '../../store/actions/types';

const { width, height } = Dimensions.get('window');
export default function Calendar({ route, navigation }) {
  const dispatch = useDispatch()
  const { brandColor, mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
  const { noInternetModalVisible } = useSelector(state => state.noInternetReducer)
  const { token, isAuthenticated } = useSelector(state => state.authReducer);
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const [EventData, setEventData] = useState([]);
  const [bannerImg, setBannerImg] = useState(null);
  const [itemImage, setItemImage] = useState('WIDE');
  const [imageBgColor, setImageBgColor] = useState(null);
  const [shadow, setShadow] = useState(null);
  const [itemDisplay, setItemDisplay] = useState('IMAGE');
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [calanderTitle, setCalanderTitle] = useState(null);

  const processEventDataResponse = (res) => {
    // console.log('event res', res)
    // console.log("tab id", route.params.tabId);
    if (res.status == 200) {
      const nameList = res.data.data;
      // console.log('Namelist is --------------:', nameList);
      if (nameList.calendar.bannerArtwork != null) {
        // console.log("ssdsfbsijk");
        let bannerImage = `${API.IMAGE_LOAD_URL}/${nameList.calendar.bannerArtwork.document.id}?${API_CONSTANT.EVENT_BANNER_IMAGE_HEIGHT_WIDTH}`;
        setBannerImg(bannerImage);
        setImageBgColor(nameList.calendar.bannerArtwork.document.imageColur);
      }

      if (nameList.event != null) {
        nameList.event.forEach((event) => {
          if (event.squareArtwork != null) {
            event.squareArtwork.document[
              'newImage'
            ] = `${API.IMAGE_LOAD_URL}/${event.squareArtwork.document.id}?${API_CONSTANT.SQUARE_IMAGE_ROW_HEIGHT_WIDTH}`;
          }
          if (event.wideArtwork != null) {
            // console.log("event ", event);
            event.wideArtwork.document[
              'newImage'
            ] = `${API.IMAGE_LOAD_URL}/${event.wideArtwork.document.id}?${API_CONSTANT.WIDE_IMAGE_GRID_HEIGHT_WIDTH}`;
          }
        });
        // console.log("event updated list", nameList.calendar);
        setEventData(nameList.event);
      }
    }
  };

  const setCalendarDesign = (res) => {
    // console.log('calander design res', res);
    setItemImage(res.itemImages);
    setShadow(res.shadow);
    setItemDisplay(res.itemDisplay);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: calanderTitle
    })
  }, [calanderTitle])


  useEffect(() => {
    gettingCalanderDesign();
    gettingEventData();
  }, []);

  //getting  calanderDesign from calendar id-------------------
  const gettingCalanderDesign = async () => {
    if (!isAuthenticated) {
      axiosInstance1
        .get(
          `${API.calendar}/${route.params.calendarId}/${orgId}`
        )
        .then((res) => {
          setCalanderTitle(res.data.data.title)
          if (res.data.data.calendarDesign) {
            setCalendarDesign(res.data.data.calendarDesign);
          }
          setRefreshing(false);
        })
        .catch((err) => {
          if (noInternetModalVisible == false) {
            console.log('error while gettign calander design>>', err);
          }


          setRefreshing(false);
        });
    } else {
      axiosInstance1
        .get(`${API.calendar}/${route.params.calendarId}`)
        .then((res) => {
          setCalanderTitle(res.data.data.title)
          if (res.data.data.calendarDesign) {
            setCalendarDesign(res.data.data.calendarDesign);
          }
          setRefreshing(false);
        })
        .catch((err) => {
          if (noInternetModalVisible == false) {
            console.log('error while gettign calander design>>', err);
          }

          setRefreshing(false);
        });
    }
  };

  //getting event data from the calendar -----------------------
  const gettingEventData = async () => {
    if (!isAuthenticated) {
      axiosInstance1
        .get(
          `${API.calendarEvent}/${route.params.calendarId}/${orgId}?allEvents=All&deviceType=MOBILE`
        )
        .then((res) => {
          // console.log('res when calendar is opned is :', res)
          setTitle(res.data.data.calendar.title);
          processEventDataResponse(res);
          setLoading(false);
          setRefreshing(false);
        })
        .catch((err) => {
          // console.log(err)
          setLoading(false);
          setRefreshing(false);
        });
    } else {
      let axiosConfig = {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          Authorization: 'Bearer ' + `${token}`,
        },
      };
      axiosInstance1
        .get(`${API.calendarEvent}/${route.params.calendarId}?allEvents=All&deviceType=MOBILE`, axiosConfig)
        .then((res) => {
          // console.log('res when calendat is opned is :', res)
          processEventDataResponse(res);
          setTitle(res.data.data.calendar.title);
          setLoading(false);
          setRefreshing(false);
        })
        .catch((err) => {
          if (noInternetModalVisible == false) {
            dispatch({
              type: SET_ALERT, payload: {
                setShowAlert: true,
                data: {
                  message: 'Could not get data',
                  showCancelButton: true,
                  onCancelPressed: () => {
                    dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                  },
                }
              }
            }
            )
          }
          // console.log(err)

          setLoading(false);
          setRefreshing(false);
        });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    gettingCalanderDesign();
    gettingEventData();
  };

  return (
    <View
      style={{
        ...Styles.container,
        backgroundColor:
          theme == 'DARK'
            ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
            : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
      }}
    >
      <StatusBar animated={true} translucent={false} showHideTransition={true} backgroundColor={brandColor} />
      <Loader loading={loading} />

      <EventList
        EventData={EventData}
        banner={bannerImg}
        itemImage={itemImage}
        imageBgColor={imageBgColor}
        shadow={shadow}
        itemDisplay={itemDisplay}
        title={title}
        navigation={navigation}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginHorizontal: width * 0.05,
    marginBottom: width * 0.05,
    paddingVertical: height / 18,
    backgroundColor: '#5C5859',
  },
  icons: {
    textAlign: 'center',
  },
});
