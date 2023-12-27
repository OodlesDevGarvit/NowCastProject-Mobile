import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StatusBar, ActivityIndicator, View, } from 'react-native';
// import Orientation from 'react-native-orientation';
import Orientation from 'react-native-orientation-locker';


import styles from './styles';
import ListTypeItems from '../../components/ListTypeItems';
import StackTypeItem from '../../components/StackTypeItem';
import GridTypeItems from '../../components/gridType/GridTypeItems';
import * as API_CONSTANT from '../../constant/ApiConstant';
import * as API from '../../constant/APIs';
import { axiosInstance1 } from '../../constant/Auth';
import ThemeConstant, { DynamicThemeConstants } from '../../constant/ThemeConstant';
import { clearRemoteMessage } from '../../store/actions/remoteNotificationAction';
import { logoutUser } from '../../store/actions/authAction';
import { useNetInfo } from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import { SET_ALERT } from '../../store/actions/types';
import { filterContentForIOS } from '../../utils/FilterContentForIos';

const WelcomeScreen = ({ navigation, route }) => {

  const dispatch = useDispatch();
  const [contentData, setContent] = useState([]);
  const [ItemLayoutType, setItemLayoutType] = useState('GRID'); //ROWS,STACKED,GRID
  const [itemImages, setItemImages] = useState('WIDE');
  const [itemTitle, setItemTitle] = useState('OVERLAY'); //below, overlay,off
  const [marginType, setMarginType] = useState('VERYTHIN');
  const [marginEdges, setMarginEdges] = useState('CURVE');
  const [itemDisplay, setItemDisplay] = useState(null);
  const [margin, setMargin] = useState(false); //true or false
  const [shadow, setShadow] = useState(false); //true or  false
  const [animating, setAnimating] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listDesign, setListDesign] = useState({});
  const [showTransparency, setShowTransparency] = useState(false);
  const [showBannerTransparency, setShowBannerTransparency] = useState(false);
  const [transparencyColor, setTransparencyColor] = useState('');
  const [transparencyCount, setTransparencyCount] = useState('');
  const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);
  const { brandColor, mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const { fromNotification, remoteMessage: notification } = useSelector(
    (state) => state.remoteReducer
  );
  const { token, isAuthenticated, userId } = useSelector(state => state.authReducer);
  const { isVisible } = useSelector(state => state.splashReducer);


  //getting and setting the orientatin-----
  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  useEffect(() => {
    if (logoutPopupVisible && isVisible == false) {
      showConfirmDialog()
    }
  }, [isVisible])

  useEffect(() => {
    if (fromNotification && isVisible == false) {
      navigateToNotification()
    }
  }, [isVisible])

  useFocusEffect(
    React.useCallback(() => {
      Orientation.lockToPortrait();
    }, [])
  )

  //redirecting to  TYPR of notification  page--
  const navigateToNotification = () => {
    if (fromNotification) {
      dispatch(clearRemoteMessage());
      if (notification.data.mediaSeries) {
        const item = {
          id: notification.data.mediaSeries,
          type: notification.data.type == "EBOOK_SERIES" ? "EBOOK_SERIES" : "MEDIASERIES",
        };
        if (item.type == "EBOOK_SERIES") {
          return navigation.navigate('EbookDetail', {
            seriesId: item.id,
            title: item?.title,
          })
        } else {
          return navigation.navigate('VideoSeries', {
            seriesId: item.id,
            title: item?.title,
            type: item.type,
          });
        }
      } else if (notification.data.mediaItem) {
        const item = {
          id: notification.data.mediaItem,
          type: notification.data.type == 'EBOOK' ? 'EBOOK' : 'MEDIA_ITEM',
        };
        if (item.type == 'EBOOK') {
          return navigation.navigate('EbookItem', {
            ebookItemId: item.id,
            imageBgColor: ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR
          })
        } else {
          return navigation.navigate('MediaItem', {
            mediaItemId: item.id,
            color: ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR,
          })
        }
      } else if (notification.data.calendar) {
        const item = {
          id: notification.data.calendar,
          type: 'CALENDAR',
        };
        return navigation.navigate('Calendar', {
          calendarId: item.id,
          title: item?.title,
          color: item?.bannerArtworkImageColor,
        });
      } else if (notification.data.list) {
        const item = {
          id: notification.data.list,
          type: 'LIST',
        };
        return navigation.navigate('VideoOnDemand', {
          itemId: item.id,
        });
      } else if (notification.data.album) {
        const item = {
          id: notification.data.album,
          type: 'ALBUM',
        };
        return navigation.navigate('AlbumDetail', {
          seriesId: item.id,
          title: item?.title,
          type: item.type,
          color: ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR,
        });
      } else if (notification.data.event) {
        const item = {
          id: notification.data.event,
          type: 'EVENT',
        };
        return navigation.navigate('EventDetail', {
          eventId: item.id,
          title: item?.title,
          color: item.bannerArtworkImageColor,
        });
      } else if (notification.data.songs) {
        const item = {
          id: notification.data.songs,
          type: 'MUSIC',

        };
        return navigation.navigate('AudioPlayer', {
          musicItemId: item?.id
        });
      } else if (notification.data.rssFeed) {
        const item = {
          id: notification.data.rssFeed,
          type: 'RSSFEED',
        };
        return navigation.navigate('RssFeedItem', {
          itemId: item.id,
          fromWelcome: true
        });
      } else if (notification.data.link) {
        const item = {
          id: notification.data.link,
          type: 'LINK',
        };
        return navigation.navigate('LinkItem', {
          itemId: item.id,
          fromWelcome: true
        })
      } else {
        navigation.navigate('DrawerNavigator', { screen: 'Inbox' });
      }
    }
  }

  //getting tab data based on token----
  useEffect(() => {
    if (isAuthenticated) {
      getTabWithId();
    } else {
      getTabWithoutId();
    }
  }, [token]);

  //getting tab data on Refresh----
  const onRefresh = () => {
    setRefreshing(true);
    if (isAuthenticated) {
      getTabWithId(token);
    } else {
      getTabWithoutId();
    }

  };

  //getting tab data with token----
  const getTabWithId = () => {
    let axiosConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + `${token}`,
        // 'Authorization': 'Bearer ' + `axiosjdbw`
      },
    };
    axiosInstance1
      .get(`${API.tab}/${route.params.tabId}`, axiosConfig)
      .then((res) => {
        // console.log('this is gettabbyid api res>>> ', res);

        processTabDataResponse(res);
      })
      .catch(async (err) => {
        console.log('error is :--', err.message);
        if (err.message == 'Request failed with status code 401') {
          setLogoutPopupVisible(true)
          getTabWithoutId();
        }
      });
  };

  //getting tab data without token----
  const getTabWithoutId = () => {
    axiosInstance1
      .get(
        `${API.tabById}/${route.params.tabId}?organizationId=${orgId}`
      )
      .then((res) => {
        // console.log('getting data without id', res);
        processTabDataResponse(res);
      })
      .catch((err) => {
        console.log('error while getting data', err);
      });
  };

  //processing tab data response----
  const processTabDataResponse =
    (res) => {
      const nameList = res.data.data;
      let listDesign = {};
      // console.log('nameList-----:', nameList);
      if (
        nameList[0] != null &&
        nameList[0].tabBasicInfo != null &&
        (nameList[0].tabBasicInfo.tabType === 'BUILD_YOUR_OWN' ||
          nameList[0].tabBasicInfo.tabType === 'MUSIC')
      ) {
        if (
          nameList[0].buildYourOwnDTO != null &&
          nameList[0].buildYourOwnDTO.design != null
        ) {
          listDesign = nameList[0].buildYourOwnDTO.design;
        } else if (
          nameList[0].smartListDTO != null &&
          nameList[0].smartListDTO.design != null
        ) {
          listDesign = nameList[0].smartListDTO.design;
        }

        if (listDesign != null) {
          setItemLayoutType(listDesign.itemLayout);

          if (listDesign.itemDisplay !== null) {
            setItemDisplay(listDesign.itemDisplay);
          }

          setItemImages(listDesign.itemImages);
          setItemTitle(listDesign.itemTitles);
          setTransparencyColor(listDesign.transparencyColor)
          setShowTransparency(listDesign.showTransparency)
          setShowBannerTransparency(listDesign.showBannerTransparency)
          setTransparencyCount(listDesign.transparencyCount)
          if (listDesign.margins !== null) {
            setMargin(listDesign.margins);
            if (listDesign.marginType !== null) {
              setMarginType(listDesign.marginType);
            }
            if (listDesign.marginEdges !== null) {
              setMarginEdges(listDesign.marginEdges);
            }
          }
          if (listDesign.shadow != null) {
            setShadow(listDesign.shadow);
          }
        }

        let contentList;
        if (
          nameList[0].buildYourOwnDTO != null &&
          nameList[0].buildYourOwnDTO.contents != null
        ) {
          contentList = nameList[0].buildYourOwnDTO.contents;
        } else if (
          nameList[0].smartListDTO != null &&
          nameList[0].smartListDTO.contents != null
        ) {
          contentList = nameList[0].smartListDTO.contents;
        }
        if (contentList != null) {
          contentList.forEach((item) => {
            if (listDesign != null && listDesign.itemImages == 'BANNER') {
              if (item.bannerArtworkId != null) {
                item[
                  'newImage'
                ] = `${API.IMAGE_LOAD_URL}/${item.bannerArtworkId}?${API_CONSTANT.STACK_BANNER}`;
              }
            } else if (listDesign != null && listDesign.itemImages == 'SQUARE') {
              if (item.squareArtworkId != null) {
                if (listDesign.itemLayout === 'ROWS') {
                  item[
                    'newImage'
                  ] = `${API.IMAGE_LOAD_URL}/${item.squareArtworkId}?${API_CONSTANT.ROW_SQAURE}`;
                } else {
                  item[
                    'newImage'
                  ] = `${API.IMAGE_LOAD_URL}/${item.squareArtworkId}?${API_CONSTANT.GRID_SQUARE}`;
                }
              }
            } else if (listDesign != null && listDesign.itemImages == "WIDE") {
              if (item.wideArtworkId !== null) {
                if (listDesign.itemLayout === 'ROWS') {
                  item[
                    'newImage'
                  ] = `${API.IMAGE_LOAD_URL}/${item.wideArtWorkId}?${API_CONSTANT.ROW_WIDE}`;
                } else {
                  item[
                    'newImage'
                  ] = `${API.IMAGE_LOAD_URL}/${item.wideArtWorkId}?${API_CONSTANT.STACK_WIDE}`;
                }

              }
            }
          });

          const newContentList = [];
          contentList.forEach((item) => {
            if (item.status == "PUBLISHED") {
              newContentList.push(item);
            }
          });

          // console.log('Tab Data DEBUG!!!:', newContentList);
          setContent(filterContentForIOS(newContentList));
        }

        setListDesign(listDesign);
        setAnimating(false);
        setRefreshing(false);
      }
    }

  //shown when you are inactive for long time----
  const showConfirmDialog = () => {
    dispatch({
      type: SET_ALERT, payload: {
        setShowAlert: true,
        data: {
          message: "You have been inactive for long please login again.",
          showCancelButton: true,
          onCancelPressed: async () => {
            await dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            await dispatch(logoutUser(token))
          },
          showConfirmButton: true,
          confirmText: 'Login',
          onConfirmPressed: async () => {
            dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            setAnimating(true)
            await dispatch(logoutUser(token))
            await navigation.navigate('Auth', { screen: 'LoginScreen' });
            setAnimating(false)
          }
        }

      }
    }
    )
  };

  /**
   * This section contains all the components (Header and Body)
   */

  //This is the main component body of the screen -- rendered based on type (GRID,LIST,STACKED)
  const mainContent = (itemLayout) => {
    if (itemLayout == 'GRID') {
      return (
        <GridTypeItems
          data={contentData}
          itemImages={itemImages}
          itemTitle={itemTitle}
          margin={margin}
          shadow={shadow}
          marginType={marginType}
          marginEdges={marginEdges}
          screenType="welcome"
          theme={theme}
          listDesign={listDesign}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      );
    } else if (itemLayout == 'ROWS') {
      return (
        <ListTypeItems
          data={contentData}
          itemDisplay={itemDisplay}
          itemImages={itemImages}
          shadow={shadow}
          screenType="welcome"
          theme={theme}
          listDesign={listDesign}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      );
    } else if (itemLayout == 'STACKED') {
      return (
        <StackTypeItem
          data={contentData}
          itemImages={itemImages}
          itemTitle={itemTitle}
          margin={margin}
          marginType={marginType}
          marginEdges={marginEdges}
          shadow={shadow}
          screenType="welcome"
          theme={theme}
          showTransparency={showTransparency}
          showBannerTransparency={showBannerTransparency}
          transparencyColor={transparencyColor}
          transparencyCount={transparencyCount}
          listDesign={listDesign}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      );
    }
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
      <StatusBar showHideTransition={true} backgroundColor={brandColor} barStyle={'light-content'} />
      {animating ? (
        <ActivityIndicator
          animating={animating}
          color={theme == 'DARK' ? 'white' : 'black'}
          size="large"
          style={styles.activityIndicator}
        />
      ) : null}
      <View style={{ flex: 1 }}>
        {mainContent(ItemLayoutType)}
      </View>
    </View>
  );
};
export default WelcomeScreen;
