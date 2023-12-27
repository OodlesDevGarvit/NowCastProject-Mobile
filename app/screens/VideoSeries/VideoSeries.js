import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar
} from 'react-native';
import { axiosInstance1 } from '../../constant/Auth';
import { mediaseries, mediaseriesId, MusicsInAlbum } from '../../constant/APIs';
import ThemeConstant, { DynamicThemeConstants } from '../../constant/ThemeConstant';
import * as API_CONSTANT from '../../constant/ApiConstant';
import * as API from '../../constant/APIs';
import Loader from '../../components/Loader';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { moderateScale } from 'react-native-size-matters';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import CustomButton from '../../components/CustomButton';
import Immersive from 'react-native-immersive';
import { filterContentForIOS } from '../../utils/FilterContentForIos';


const VideoSeries = ({ route, navigation }) => {
  const { brandColor, mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
  const isFocused = useIsFocused();
  const { token, isAuthenticated } = useSelector(state => state.authReducer);

  const { seriesId, type } = route.params;
  const [seriesContent, setSeriesContent] = useState([]);
  const [MediaBanner, setMediaBanner] = useState(null);
  const [bannerBgcolor, setBannerBgColor] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState(null);
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const { noInternetModalVisible } = useSelector(state => state.noInternetReducer)

  useEffect(() => {
    navigation.setOptions({
      title: title,
      cardOverlay: () => (
        <View
          style={{
            height: 50,
            backgroundColor: brandColor,
          }}
        />
      ),
    });
  }, [title]);


  //CALLING 
  useEffect(() => {
    getData()
  }, [])

  //TO GAT DATA
  const getData = async () => {
    getMediaSeriesData()
  }

  //GETTING MEDIASERIES DATA--
  const getMediaSeriesData = async () => {
    if (!isAuthenticated) {
      getMediaSeriesDataWithoutAuth()
    }
    else {
      getMediaSeriesDataWithAuth()
    }
  }

  //CALLING APIs TO GET DATA__
  const getMediaSeriesDataWithAuth = async () => {
    // console.log('getting mediSeries data with auth')
    let axiosConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + `${token}`
      },
    };
    try {
      const response = await axiosInstance1.get(`${mediaseries}/${seriesId}`, axiosConfig);
      processSeriesData(response)
    }
    catch (err) {
      if(noInternetModalVisible == false){
        alert('unable to get series data')
      }
    
      // console.log('getting error while getting series data with auth')
      setRefreshing(false);
      setLoading(false);
    }

  };

  const getMediaSeriesDataWithoutAuth = async () => {
    // console.log('getting mediSeries data without auth')
    try {
      const response = await axiosInstance1.get(
        `${mediaseriesId}/${seriesId}?organizationId=${orgId}`
      )
      // console.log('mediaseries data checking for ebook series',response);

      processSeriesData(response)

    }
    catch (err) {
      if(noInternetModalVisible ==false){
        alert('unable to get series data without auth')
      }
      
      // console.log('getting error while getting series data without auth')
      setRefreshing(false);
      setLoading(false);
    }
  };


  //TO PROCESS SERIES DATA __
  const processSeriesData = async (response) => {
    const nameList = response.data.data;
    //setting title to show int he header--
    setTitle(nameList.title)
    // console.log('namelist series data in process >>>',nameList)

    //creating imageURL to show in the header section 
    if (nameList.bannerArtwork != null) {
      nameList.bannerArtwork.document[
        'newImage'
      ] = `${API.IMAGE_LOAD_URL}/${nameList.bannerArtwork.document.id}?${API_CONSTANT.STACK_BANNER}`;
      setMediaBanner(nameList.bannerArtwork.document.newImage);
      setBannerBgColor((nameList?.bannerArtwork?.document?.imageColur) ? nameList.bannerArtwork.document.imageColur : ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR);
    }

    if (nameList.mediaItemDTO != null) {
      nameList.mediaItemDTO.map((item, index) => {
        if (item.squareArtwork != null) {
          item.squareArtwork.document['newImage'] = `${API.IMAGE_LOAD_URL}/${item.squareArtwork.document.id}?${API_CONSTANT.ROW_SQAURE}`;
        }
      });
    }

    let newContentList = [];
    nameList?.mediaItemDTO.forEach((item) => {
      if (item.status == 'PUBLISHED') {
        newContentList.push(item);
      }
    }
    );
    setSeriesContent(filterContentForIOS(newContentList));
    setIsDataLoaded(true);
    setRefreshing(false);
    setLoading(false);
  }

  const onRefresh = () => {
    setRefreshing(true);
    getData()
  };


  //fucntion to fomat date in the required format------
  const formatDate = (date) => {
    let formatedDate = format(new Date(date), "MMMM dd, yyyy");
    return formatedDate;
  };

  return (
    <View style={styles.fullStrech}>
      {isFocused &&
        <StatusBar translucent={false} animated={true} showHideTransition={true} backgroundColor={brandColor} />
      }
      <ScrollView
        refreshControl={
          <RefreshControl
            tintColor={"gray"}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        style={{
          backgroundColor:
            theme == "DARK"
              ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
              : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
        }}
      >
        <Loader loading={loading} />

        {/* TOP HEADER COMPONENT */}
        {
          MediaBanner &&
          (<>
            <View
              style={{ ...styles.headerContainer, backgroundColor: bannerBgcolor }}
            >
              <FastImage
                source={{ uri: MediaBanner }}
                style={styles.headerImage}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          </>
          )
        }

        {seriesContent.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            onPress={() => {
              navigation.navigate('MediaItem', {
                mediaItemId: item.id,
                color: item?.wideArtwork?.document?.imageColur,
              });

            }}
          >
            <View
              style={{
                ...styles.card,
                backgroundColor:
                  theme == "DARK"
                    ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
                    : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
                flex: 1,
                flexDirection: "row",
                borderBottomWidth: theme == "DARK" ? 0.7 : 1.4,
                borderBottomColor:
                  theme == "DARK" ? ThemeConstant.BORDER_COLOR_BETA : "#f7f8fa",
              }}
            >
              {/* IMAGE COMPOENNT ON THE CARD */}
              <View
                style={{
                  backgroundColor: item?.squareArtwork?.document?.imageColur,
                  ...styles.itemImageContainer, overflow: 'hidden'
                }}
              >
                <FastImage
                  style={styles.itemImage}
                  source={{ uri: item.squareArtwork?.document?.newImage }}
                  resizeMode={FastImage.resizeMode.contain}
                />
                {item.liveStatus == 'LIVE' &&
                  <CustomButton
                    butttonText={'Live'}
                    btnTextStyle={{ fontSize: 13 }}
                    inputStyle={{ position: 'absolute', borderRadius: 5, top: 8, right: 8, backgroundColor: 'red', height: moderateScale(18), width: moderateScale(30) }}

                  />
                }
              </View>

              {/* TEXT COMPONENT ON THE CARD */}
              <View style={styles.textContaier}>
                <Text
                  numberOfLines={1}
                  style={{
                    color:
                      theme == "DARK"
                        ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                        : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                    ...styles.title,
                  }}
                >
                  {item.title}
                </Text>
                <Text numberOfLines={1} style={styles.subtitle}>
                  {item.subTitle}
                  {item.subTitle && item.date ? " | " : null}
                  {item.date ? formatDate(item.date) : null}
                  {item.speaker ? " | " : null} {item.speaker}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullStrech: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  headerContainer: {
    width: "100%",
    aspectRatio: 1920 / 692,
  },
  headerImage: {
    width: "100%",
    aspectRatio: 1920 / 692,
  },
  itemImageContainer: {
    borderRadius: 10,
    height: 80,
  },
  itemImage: {
    aspectRatio: 1 / 1,
    height: "100%",
  },
  counter: {
    fontSize: 25,
    marginLeft: 5,
    marginRight: 15,
    justifyContent: "center",
    opacity: 0.5,
    fontFamily: ThemeConstant.FONT_FAMILY,
  },
  card: {
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: ThemeConstant.PADDING_NORMAL,
  },
  textContaier: {
    marginLeft: ThemeConstant.MARGIN_NORMAL,
    flex: 1,
    flexWrap: "wrap",
    // borderWidth: 1
  },
  title: {
    fontWeight: "bold",
    fontSize: ThemeConstant.TEXT_SIZE_LARGE,
    width: "100%",
  },
  subtitle: {
    fontSize: ThemeConstant.TEXT_SIZE_MEDIUM,
    letterSpacing: 1,
    marginRight: ThemeConstant.MARGIN_TINNY,
    color: ThemeConstant.TEXT_COLOR_SUBTEXTS,
    width: "100%",
  },
});
export default VideoSeries;