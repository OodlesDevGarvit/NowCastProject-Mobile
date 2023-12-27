import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ImageBackground,
  ScrollView,
  StatusBar,
} from 'react-native';
import ThemeConstant from '../../constant/ThemeConstant';
import { useNavigation } from '@react-navigation/native';
import { axiosInstance1 } from '../../constant/Auth';
import { DynamicThemeConstants } from '../../constant/ThemeConstant';
import Calendar from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as API_CONSTANT from '../../constant/ApiConstant';
import * as API from '../../constant/APIs';
import * as AddCalendarEvent from 'react-native-add-calendar-event';
import moment from 'moment';
import Loader from '../../components/Loader';
import { useSelector } from 'react-redux';
import { moderateScale, moderateVerticalScale } from 'react-native-size-matters';
import { convertTime } from '../../utils/TimeFormat';

// const TIME_NOW_IN_UTC = moment.utc();
const utcDateToString = (momentInUTC) => {
  let s = moment.utc(momentInUTC).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
  return s;
};

const EventDetail = ({ route }) => {
  const { brandColor, mobileTheme: theme, timeZone: timeZone } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const { token, isAuthenticated } = useSelector(state => state.authReducer);
  const [eventDetailData, setEventDetailData] = useState([]);
  const [imageBgColor, setImageBgColor] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    getEventData()
  }, []);



  const getEventData = async () => {
    if (isAuthenticated) {
      getEventById()
    }
    else {
      getEventByIdWithoutLogin()
    }
  }

  const getEventById = () => {
    console.log('getting event by id with login')
    let axiosConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization:
          'Bearer ' + token,
        // "Access-Control-Allow-Origin": "*",
      },
    };
    axiosInstance1
      .get(`${API.eventsById}?eventId=${route.params.eventId}`, axiosConfig)
      .then((res) => {
        // console.log("event res detail src", res);
        processData(res)
      })
      .catch((error) => {
        console.log('getting error while fetching data with login', error);
        setLoading(false);
      });
  };
  const getEventByIdWithoutLogin = () => {
    console.log('getting event by id without login')
    axiosInstance1
      .get(
        `${API.eventsById}/${route.params.eventId}?organizationId=${orgId}`
      )
      .then((res) => {
        // console.log("event res detail src", res);
        processData(res)
      })
      .catch((error) => {
        // console.log(error);
        setLoading(false);
      });
  }

  const processData = (res) => {
    if (res.status == 200) {
      const nameList = res.data.data;
      if (nameList.squareArtwork != null) {
        nameList.squareArtwork.document[
          'newImage'
        ] = `${API.IMAGE_LOAD_URL}/${nameList.squareArtwork.document.id}?height=250&width=350`;
      }
      if (nameList.wideArtwork != null) {
        nameList.wideArtwork.document[
          'newImage'
        ] = `${API.IMAGE_LOAD_URL}/${nameList.wideArtwork.document.id}?${API_CONSTANT.WIDE_IMAGE_HEIGHT_WIDTH_EVENT}`;
        setImageBgColor(nameList.wideArtwork.document.imageColur);
      }
      setEventDetailData(nameList);
      console.log('event detail data is', nameList, nameList.wideArtwork.document.imageColur);

      setLoading(false);
    }
  }
  let [startDates, startTimes] = convertTime(timeZone, eventDetailData.startedDate, eventDetailData.startTime);
  let [endDates, endTimes] = convertTime(timeZone, eventDetailData.endedDate, eventDetailData.endTime);

  let startedDate =
    startDates + ' ' + startTimes;
  let endedDate = endDates + ' ' + endTimes;

  const dateToString = (momentInUTC, format) => {
    return moment.utc(momentInUTC).format(format);
  };

  const dateMonth = () => {
    if (
      eventDetailData.startedDate == eventDetailData.endedDate &&
      eventDetailData.startTime == eventDetailData.endTime && eventDetailData.allDayEvent == false
    ) {
      return (
        dateToString(startedDate, 'MMMM DD, h:mm A') +
        ' - ' +
        dateToString(endedDate, 'h:mm A')
      );
    } else if (eventDetailData.startTime != eventDetailData.endTime && !eventDetailData.allDayEvent) {
      return (
        dateToString(startedDate, 'MMMM DD, h:mm A') +
        ' - ' +
        dateToString(endedDate, 'MMMM DD, h:mm A')
      );
    } else if (eventDetailData.allDayEvent) {
      if (eventDetailData.startedDate == eventDetailData.endedDate) {
        return (
          dateToString(startedDate, 'DD MMMM YYYY')
        );
      } else {
        return (
          dateToString(startedDate, 'MMM DD') +
          ' - ' +
          dateToString(endedDate, 'MMM DD')
        );
      }
    }
    else {
      return (
        dateToString(startedDate, 'MMMM DD, h:mm A') +
        ' - ' +
        dateToString(endedDate, 'MMMM DD, h:mm A')
      );
    }
  };

  const listData = () => {
    if (eventDetailData.websiteURL) {
      // console.log('this is eventdetail data for website',eventDetailData.websiteURL);
      return (
        <View style={{ ...Styles.cardView }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text
              numberOfLines={2}
              style={{
                ...Styles.dateTitle,
                opacity: 0.7,
                flexWrap: 'wrap',
                ...Styles.cardTitle,
              }}
            >
              Website
            </Text>
            <Text
              numberOfLines={2}
              onPress={() => {
                Linking.openURL(eventDetailData.websiteURL);
              }}
              style={{
                ...Styles.dateTitle,
                flex: 1,
                flexWrap: 'wrap',
                color: '#0645AD',
              }}
            >
              {eventDetailData.websiteURL}
            </Text>
          </View>
        </View>
      );
    }
  };


  const registerLink = () => {
    if (eventDetailData.registerToggleCheck) {
      return (

        <View style={{ ...Styles.cardView }}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('RegisterForm', {
                eventId: route.params.eventId,
                eventData: eventDetailData,
                color: eventDetailData.wideArtwork.document.imageColur

              });
            }}
          >
            <View
              style={{ justifyContent: "center", alignItems: 'center' }}
            >
              <Text
                numberOfLines={2}
                style={{
                  ...Styles.dateTitle,
                  flex: 1,
                  flexWrap: 'wrap',
                  color: '#0645AD',
                }}
              >
                {eventDetailData.registrationTitle}
              </Text>

            </View>
          </TouchableOpacity>
        </View>
      );
    }
  };



  const phoneEmail = () => {
    if (eventDetailData.email) {
      return (
        <View
          style={{
            ...Styles.cardView,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...Styles.dateTitle, opacity: 0.7, ...Styles.cardTitle }}>
              Email{' '}
            </Text>
            <Text
              numberOfLines={2}
              onPress={() => {
                Linking.openURL(`mailto:` + eventDetailData.email);
              }}
              style={{
                ...Styles.dateTitle,
                flex: 1,
                flexWrap: 'wrap',
                color: '#0645AD',
              }}
            >
              {' '}
              {eventDetailData.email}
            </Text>
          </View>
        </View>
      );
    } else {
      return null;
    }
  };
  const phone = () => {
    if (eventDetailData.phoneNo) {
      return (
        <View
          style={{
            ...Styles.cardView,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...Styles.dateTitle, opacity: 0.7, ...Styles.cardTitle }}>
              Phone{' '}
            </Text>
            <Text
              numberOfLines={2}
              onPress={() => {
                Linking.openURL(`tel:` + eventDetailData.phoneNo);
              }}
              style={{
                ...Styles.dateTitle,
                flex: 1,
                flexWrap: 'wrap',
                color: '#0645AD',
              }}
            >
              {' '}
              {eventDetailData.phoneNo}
            </Text>
          </View>
        </View>
      );
    }
  };

  const description = () => {
    if (eventDetailData.descreption) {
      return (
        <View
          style={{
            ...Styles.cardView,
          }}
        >
          <Text
            style={{
              ...Styles.dateTitle,
              // flexWrap: 'wrap',
              color: '#000',
              // justifyContent: 'center',
              // textAlign: 'justify',
              // alignItems: 'center',
            }}
          >
            {eventDetailData.descreption.trim()}
          </Text>
        </View>
      );
    } else {
      return null;
    }
  };

  function addEventToCalendar() {
    const eventConfig = {
      title:
        eventDetailData.title != null ? eventDetailData.title : 'default title',
      startDate: utcDateToString(startedDate),
      endDate: utcDateToString(moment.utc(endedDate)),
      notes:
        eventDetailData.descreption != null
          ? eventDetailData.descreption
          : 'default event description',
    };

    AddCalendarEvent.presentEventCreatingDialog(eventConfig)
      .then((eventInfo) => {
        // alert(JSON.stringify(eventInfo));
      })
      .catch((error) => {
        // alert('Error ', error);
      });
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor:
          theme == 'DARK'
            ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
            : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
      }}
    >
      <StatusBar animated={true} translucent={false} backgroundColor={brandColor} />
      <Loader loading={loading} />
      <View
        style={{
          backgroundColor:
            theme == 'DARK'
              ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
              : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
          marginBottom: moderateVerticalScale(50),
        }}
      >
        {eventDetailData.published ? (
          <>
            <View
              style={[
                Styles.imageBackground,
                {
                  backgroundColor: route.params.color
                    ? route.params.color
                    : imageBgColor
                      ? imageBgColor
                      : '#D3D3D3',
                  height: imageBgColor == null ? 200 : undefined,
                },
              ]}
            >
              <ImageBackground
                style={Styles.image}
                source={
                  eventDetailData.wideArtwork != null
                    ? { uri: eventDetailData.wideArtwork.document.newImage }
                    : null
                }
                imageStyle={{ borderRadius: 0 }}
              >
                <View style={Styles.calender}>
                  <View
                    style={{ flex: 1, paddingVertical: 10, paddingRight: 10 }}
                  >
                    <TouchableOpacity
                      onPress={addEventToCalendar}
                    // onPress={() => { Linking.openURL(DATA.url); }}
                    >
                      <Calendar
                        name="calendar-plus"
                        size={35}
                        color="#fff"
                        style={Styles.iconStyle}
                      />
                    </TouchableOpacity>
                  </View>

                </View>
              </ImageBackground>
            </View>

            <View style={{ width: '95%', alignSelf: 'center', }}>
              <Text style={{ ...Styles.descriptionTitle, color: theme == 'DARK' ? '#fff' : '#000' }}>
                {eventDetailData.title}
              </Text>
              <Text style={Styles.descriptionSubTitle}>
                {eventDetailData.subTitle}
              </Text>
            </View>
            {description()}
            <View style={[Styles.cardView]}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    ...Styles.dateTitle,
                    opacity: 0.7,
                    ...Styles.cardTitle
                  }}
                >
                  Date/Time{' '}
                </Text>
                <Text style={[Styles.dateTitle, { flex: 1 }]}>
                  {dateMonth()}
                </Text>
              </View>
            </View>
            {listData()}
            {phoneEmail()}
            {phone()}
            {registerLink()}

          </>
        ) : null}
      </View>
      {/* {alert(moment(startedDate).format("hh:mm A"))} */}
    </ScrollView>
  );
};

const Styles = StyleSheet.create({
  card: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    height: 90,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    backgroundColor: '#fff',
  },
  imageBackground: {
    height: undefined,
    width: '100%',
  },
  image: {
    alignSelf: 'center',

    width: '100%',
    aspectRatio: 1920 / 1080,

    // marginRight: 15,
  },
  titleView: {
    width: 50,
    height: 50,
    borderRadius: 5,
    alignSelf: 'flex-end',
    backgroundColor: '#000',
    opacity: 0.7,
    justifyContent: 'space-evenly',
    position: 'absolute', //Here is the trick
    bottom: 0,
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 12,
    color: ThemeConstant.TEXT_COLOR_WHITE,
    fontFamily: ThemeConstant.FONT_FAMILY,
  },
  title2: {
    fontWeight: '700',
    fontSize: 25,
    color: ThemeConstant.TEXT_COLOR_WHITE,
    fontFamily: ThemeConstant.FONT_FAMILY,
  },

  descriptionTitle: {
    fontSize: 20,
    fontFamily: ThemeConstant.FONT_FAMILY,
    fontWeight: 'bold',
    paddingTop: moderateVerticalScale(10)
  },
  descriptionSubTitle: {
    color: ThemeConstant.TEXT_COLOR_SUBTEXTS,
    fontSize: 16,
    fontFamily: ThemeConstant.FONT_FAMILY,
    opacity: 0.8,
  },
  calender: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    alignContent: 'space-between',
  },
  iconStyle: {
    alignSelf: 'flex-end',
    opacity: 0.8,
    // justifyContent: 'flex-end',
    // alignItems: 'flex-end',
  },
  dateTitle: {
    fontSize: 17,
    fontFamily: ThemeConstant.FONT_FAMILY,
    opacity: 0.5,
    // borderWidth: 1,
    // borderColor: 'red',
    //left: 10,
    // lineHeight: 20,
  },
  cardTitle: {
    width: moderateScale(100),
    marginRight: moderateScale(4)
  },
  cardView: {
    backgroundColor: ThemeConstant.TEXT_COLOR_WHITE,
    minHeight: moderateVerticalScale(40),
    justifyContent: 'center',
    // alignItems:'center',
    alignSelf: 'center',
    borderRadius: 6,
    elevation: 10,
    width: '95%',
    position: 'relative',
    shadowColor: '#696969',
    marginTop: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateVerticalScale(20)
  },
});

export default EventDetail;
