import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ImageBackground,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import ThemeConstant from '../constant/ThemeConstant';
import { useNavigation } from '@react-navigation/native';
import { DynamicThemeConstants } from '../constant/ThemeConstant';
import moment from 'moment';
import { moderateScale, moderateVerticalScale } from 'react-native-size-matters';
const { width, height } = Dimensions.get('window');
import { useSelector } from 'react-redux';
import { convertDate, convertTime } from '../utils/TimeFormat';
import BlurredHeader from './common/BlurredHeader';

const getDateMonthFromDate = (dateSplit, type) => {
  dateSplit = dateSplit.split('-');

  var monthShortNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  var months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const date = new Date(dateSplit[0], dateSplit[1], dateSplit[2]); // 2020-06-21
  if (type == 'short') {
    return dateSplit[2] + ' ' + monthShortNames[date.getMonth()];
  }
  if (type == 'long') {
    return dateSplit[2] + ' ' + months[date.getMonth()];
  }
};

export default function EventList({
  EventData,
  banner,
  itemImage,
  imageBgColor,
  shadow,
  itemDisplay,
  animation,
  onRefresh,
  refreshing,
  title,
}) {
  const { width, height } = useWindowDimensions();
  const { mobileTheme: theme, timeZone: timeZone } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
  //called onRefresh()

  const navigation = useNavigation();
  const dateToString = (momentInUTC, format) => {
    return moment.utc(momentInUTC).format(format);
  };
  const dateForm = (item) => {
    let [startDate, startTime] = convertTime(timeZone, item.startedDate, item.startTime);
    let [endDate, endTime] = convertTime(timeZone, item.endedDate, item.endTime);

    let startedDate = startDate + ' ' + startTime;
    let endedDate = endDate + ' ' + endTime;
    if (item.startedDate == item.endedDate && item.startTime == item.endTime && item.allDayEvent == false) {
      // console.log("dhfuih");
      return (
        dateToString(startedDate, 'MMM DD, h:mm A') +
        ' - ' +
        dateToString(endedDate, 'h:mm A')
      );
    }
    else if (item.startTime !== item.endTime && !item.allDayEvent) {
      return (
        dateToString(startedDate, 'MMM DD, h:mm A') +
        ' - ' +
        dateToString(endedDate, 'MMM DD, h:mm A')
      );
    }
    else if (item.allDayEvent) {
      if (item.startedDate == item.endedDate) {
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
      // console.log("elese time");
      return (
        dateToString(startedDate, 'MMM DD, h:mm A') +
        ' - ' +
        dateToString(endedDate, 'MMM DD, h:mm A')
      );
    }
  };
  //for setting header background

  return (
    <ScrollView
      nestedScrollEnabled
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={'gray'}
        />
      }
      contentContainerStyle={{
        backgroundColor:
          theme == 'DARK'
            ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
            : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
        height: '100%',
        width: '100%',
      }}
    >
      {animation ? (
        <ActivityIndicator
          animating={animation}
          color={theme == 'DARK' ? 'white' : 'black'}
          size="large"
          style={Styles.activityIndicator}
        />
      ) : null}

      <View
        style={{
          backgroundColor: imageBgColor,
          shadowRadius: 0,
          shadowOffset: {
            height: 0,
          },
          aspectRatio: 1920 / 692,
          shadowColor: 'transparent',
          width: width,
          overflow: 'hidden'
        }}
      >
        <Image
          source={{ uri: banner }}
          style={{
            width: width * 1.3,
            // height: '100%',
            aspectRatio: 1920 / 1080,
            // alignItems: 'center',
            right: width * 0.1,
            backgroundColor: imageBgColor,
          }}
          blurRadius={3}
        />
        <View style={[Styles.overlay, { aspectRatio: 1920 / 692 }]} />
      </View>

      <View style={Styles.bannerImageContainer}>
        <Image
          source={{ uri: banner }}
          style={{
            width: '100%',
            height: '100%',
            height: undefined,
            aspectRatio: 3 / 1.2,
            backgroundColor: imageBgColor
          }}
        />
      </View>
      <FlatList
        nestedScrollEnabled
        data={EventData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          return (
            <>
              {item.published ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    navigation.navigate('EventDetail', {
                      eventId: item.id,
                      title: item.title,
                      color: imageBgColor,
                    })
                  }
                >
                  <View
                    style={[
                      Styles.card,
                      {
                        borderBottomWidth: theme == 'DARK' ? 0.7 : 1.4,
                        borderBottomColor:
                          theme == 'DARK'
                            ? ThemeConstant.BORDER_COLOR_BETA
                            : '#f7f8fa',
                        backgroundColor:
                          theme == 'DARK'
                            ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
                            : DynamicThemeConstants.LIGHT
                              .BACKGROUND_COLOR_WHITE,
                      },
                    ]}
                  >
                    {itemImage == 'WIDE' ? (
                      <View
                        style={[
                          Styles.imageBackground,
                          {
                            borderRadius: 10,
                            overflow: "hidden",
                            backgroundColor:
                              item?.wideArtwork?.document?.imageColur ||
                              ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR,
                            elevation: shadow && theme == 'LIGHT' ? 5 : 0,
                            display:
                              itemDisplay === 'TITLEONLY'
                                ? 'none'
                                : itemDisplay === 'IMAGE'
                                  ? 'flex'
                                  : 'none',
                          },
                        ]}
                      >
                        <ImageBackground
                          style={[
                            Styles.image,
                            {
                              display:
                                itemDisplay === 'TITLEONLY'
                                  ? 'none'
                                  : itemDisplay === 'IMAGE'
                                    ? 'flex'
                                    : 'none',
                            },
                          ]}
                          source={
                            item.wideArtwork != null
                              ? {
                                uri: item.wideArtwork.document.newImage,
                              }
                              : null
                          }
                        >
                          {item.publishedDate !== null ? (
                            <View
                              style={[
                                Styles.titleView,
                                {
                                  opacity: theme == 'DARK' ? 0.8 : 0.7,
                                },
                              ]}
                            >
                              <Text style={Styles.title}>
                                {/* {getDateMonthFromDate(
                                  `${item.startedDate +
                                    ' ' +
                                    item.startTime}`.slice(0, 8),
                                  'short'
                                )} */}
                                {
                                  getDateMonthFromDate(`${convertDate(timeZone, item.startedDate, item.startTime)[0] + ' ' + convertDate(timeZone, item.startedDate, item.startTime)[1].trim()}`.slice(0, 8), 'short')
                                }
                              </Text>
                              {/* {item.publishedDate && month(item.publishedDate.slice(5, 7))}</Text> */}
                              <Text style={Styles.title2}>
                                {/* {`${item.startedDate +
                                  ' ' +
                                  item.startTime}`.slice(8, 10)} */}
                                {
                                  `${convertDate(timeZone, item.startedDate, item.startTime)[0] + ' ' + convertDate(timeZone, item.startedDate, item.startTime)[1].trim()}`.slice(8, 10)

                                }
                              </Text>
                            </View>
                          ) : null}
                        </ImageBackground>
                      </View>
                    ) : (
                      <View
                        style={[
                          Styles.squareimageBackground,
                          {
                            borderRadius: 10,
                            backgroundColor:
                              item?.squareArtwork?.document?.imageColur ||
                              ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR,
                            elevation: shadow ? 5 : 0,
                            display:
                              itemDisplay === 'TITLEONLY'
                                ? 'none'
                                : itemDisplay === 'IMAGE'
                                  ? 'flex'
                                  : 'none',
                          },
                        ]}
                      >
                        <ImageBackground
                          style={[
                            Styles.squareimage,
                            {
                              display:
                                itemDisplay === 'TITLEONLY'
                                  ? 'none'
                                  : itemDisplay === 'IMAGE'
                                    ? 'flex'
                                    : 'none',
                            },
                          ]}
                          source={
                            item.squareArtwork != null
                              ? {
                                uri: item.squareArtwork.document.newImage,
                              }
                              : null
                          }
                        >
                          {item.publishedDate !== null ? (
                            <View style={Styles.squaretitleView}>
                              <Text style={Styles.squaretitle}>
                                {/* {getDateMonthFromDate(
                                  `${item.startedDate +
                                    ' ' +
                                    item.startTime}`.slice(0, 8),
                                  'short'
                                )} */}
                                {
                                  getDateMonthFromDate(`${convertDate(timeZone, item.startedDate, item.startTime)[0] + ' ' + convertDate(timeZone, item.startedDate, item.startTime)[1].trim()}`.slice(0, 8), 'short')
                                }
                              </Text>
                              {/* {item.publishedDate && month(item.publishedDate.slice(5, 7))}</Text> */}
                              <Text style={Styles.squaretitle2}>
                                {/* {`${item.startedDate +
                                  ' ' +
                                  item.startTime}`.slice(8, 10)} */}
                                {
                                  `${convertDate(timeZone, item.startedDate, item.startTime)[0] + ' ' + convertDate(timeZone, item.startedDate, item.startTime)[1].trim()}`.slice(8, 10)
                                }
                              </Text>
                            </View>
                          ) : null}
                        </ImageBackground>
                      </View>
                    )}

                    {itemDisplay === 'DATE' ? (
                      <View
                        style={{
                          ...Styles.date,
                        }}
                      >
                        <Text style={Styles.dateMonth}>
                          {/* add date date DATA here */}
                          {/* {getDateMonthFromDate(
                            `${item.startedDate + ' ' + item.startTime}`.slice(
                              0,
                              8
                            ),
                            'short'
                          )} */}
                          {
                            getDateMonthFromDate(`${convertDate(timeZone, item.startedDate, item.startTime)[0] + ' ' + convertDate(timeZone, item.startedDate, item.startTime)[1].trim()}`.slice(0, 8), 'short')

                          }
                        </Text>
                        <Text style={Styles.dateMonth}>
                          {/* {`${item.startedDate + ' ' + item.startTime}`.slice(
                            8,
                            10
                          )} */}
                          {
                            `${convertDate(timeZone, item.startedDate, item.startTime)[0] + ' ' + convertDate(timeZone, item.startedDate, item.startTime)[1].trim()}`.slice(8, 10)

                          }
                          {/* add data date month data here */}
                          {/* DEC */}
                        </Text>
                        <Text style={Styles.dateMonth}>
                          {' '}
                          {`${item.startedDate + ' ' + item.startTime}`.slice(
                            0,
                            4
                          )}
                        </Text>
                      </View>
                    ) : null}

                    <View
                      style={[
                        itemDisplay == 'DATE' ? { left: 20 } : { left: 15 },
                        {
                          backgroundColor:
                            theme == 'DARK'
                              ? DynamicThemeConstants.DARK
                                .BACKGROUND_COLOR_BLACK
                              : DynamicThemeConstants.LIGHT
                                .BACKGROUND_COLOR_WHITE,
                          flex: 1,
                          marginRight: 10,
                        },
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          Styles.descriptionTitle,
                          {
                            color:
                              theme == 'DARK'
                                ? DynamicThemeConstants.LIGHT
                                  .BACKGROUND_COLOR_WHITE
                                : DynamicThemeConstants.DARK
                                  .BACKGROUND_COLOR_BLACK,
                          },
                        ]}
                      >
                        {item.title && item.title}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[
                          Styles.descriptionSubTitle,
                          {
                            color:
                              theme == 'DARK'
                                ? DynamicThemeConstants.LIGHT
                                  .BACKGROUND_COLOR_WHITE
                                : DynamicThemeConstants.DARK
                                  .BACKGROUND_COLOR_BLACK,
                          },
                        ]}
                      >
                        {item.subTitle != null ? item.subTitle : null}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{
                          ...Styles.descriptionSubTitle,
                          color:
                            theme == 'DARK'
                              ? DynamicThemeConstants.LIGHT
                                .BACKGROUND_COLOR_WHITE
                              : DynamicThemeConstants.DARK
                                .BACKGROUND_COLOR_BLACK,
                        }}
                      >
                        {dateForm(item)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ) : null}
            </>
          );
        }}
      />
    </ScrollView>
  );
}

const Styles = StyleSheet.create({
  card: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
  },
  imageBackground: {
    height: 80,
    marginRight: 10,
  },
  squareimageBackground: {
    height: 80,
    marginRight: 10,
    overflow: "hidden"
  },
  image: {
    width: undefined,
    height: '100%',
    aspectRatio: 16 / 9,
    // marginRight: 10,
  },
  squareimage: {
    width: undefined,
    height: '100%',
    aspectRatio: 1 / 1,
    //marginRight: 10,
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
  squaretitleView: {
    width: 45,
    height: 45,
    borderRadius: 5,
    alignSelf: 'flex-end',
    backgroundColor: '#000',
    opacity: 0.7,
    justifyContent: 'center',
    position: 'absolute', //Here is the trick
    bottom: 1,
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
    color: ThemeConstant.TEXT_COLOR_WHITE,
    fontFamily: ThemeConstant.FONT_FAMILY,
    textTransform: 'uppercase',
  },
  title2: {
    fontWeight: '700',
    fontSize: 25,
    color: ThemeConstant.TEXT_COLOR_WHITE,
    fontFamily: ThemeConstant.FONT_FAMILY,
  },
  squaretitle: {
    fontWeight: '700',
    fontSize: 14,
    color: ThemeConstant.TEXT_COLOR_WHITE,
    fontFamily: ThemeConstant.FONT_FAMILY,
    textTransform: 'uppercase',
  },
  squaretitle2: {
    fontWeight: '700',
    fontSize: 22,
    color: ThemeConstant.TEXT_COLOR_WHITE,
    fontFamily: ThemeConstant.FONT_FAMILY,
  },

  descriptionTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    color: 'rgba(0,0,0,0.75)',
    fontFamily: ThemeConstant.FONT_FAMILY,
    textTransform: 'capitalize',
  },
  descriptionSubTitle: {
    color: ThemeConstant.THEME_BACKGROUND_COLOR_BLACK,
    fontSize: 15,
    fontFamily: ThemeConstant.FONT_FAMILY,
    opacity: 0.5,
  },
  shadow: {
    flex: 1,
    overflow: 'hidden',
  },
  date: {
    borderWidth: 1,
    height: 65,
    width: 65,
    borderRadius: 10,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#D3D3D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: {
    fontWeight: 'bold',
    fontSize: 16,
    width: '100%',
    color: 'black',
    textAlign: 'center',
    flex: 1 / 3,
  },
  activityIndicator: {
    zIndex: 1,
    position: 'absolute',
    width: width,
    height: height,
  },
  bannerImageContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: '10%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: moderateVerticalScale(-100),
    marginBottom: moderateVerticalScale(20)
  },
  overlay: {
    width: '100%',
    position: 'absolute',
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
});
