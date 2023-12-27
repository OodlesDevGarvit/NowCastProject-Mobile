import { StyleSheet, View, FlatList, RefreshControl, Platform, Text, StatusBar } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as API_CONSTANT from '../../constant/ApiConstant';
import * as API from '../../constant/APIs';
import { axiosInstance1 } from '../../constant/Auth';
import FastImage from 'react-native-fast-image';
import { moderateScale, moderateVerticalScale } from 'react-native-size-matters';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import ThemeConstant, { DynamicThemeConstants } from '../../constant/ThemeConstant';
import { useLayoutEffect } from 'react';
import Loader from '../../components/Loader';
import { SET_ALERT } from '../../store/actions/types';
import { filterContentForIOS } from '../../utils/FilterContentForIos';

const EbookDetail = ({ navigation, route, listDesign }) => {
  const dispatch = useDispatch();
  const brandingData = useSelector((state) => state.brandingReducer);
  const { mobileTheme: theme, brandColor } = brandingData.brandingData;
  const { isAuthenticated, isPaymentDone, token, subscription: { id } } = useSelector(state => state.authReducer);
  const [bookList, setBookList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [MediaBanner, setMediaBanner] = useState(null);
  const [bannerBgcolor, setBannerBgColor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState(null);
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const { noInternetModalVisible } = useSelector(state => state.noInternetReducer)


  useLayoutEffect(() => {
    if (!route.params?.tabId) {
      navigation.setOptions({
        title: title
      })
    }
  }, [title])


  //getting ebook reader list  data based on token----
  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    if (route.params?.tabId) {
      if (isAuthenticated) {
        getTabWithId(token);
      } else {
        getTabWithoutId();
      }

    } else {
      getMediaSeriesData();
    }
  }
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
      .then((response) => {
        console.log('this is gettabbyid api res>>> ', response);

        processTabData(response);
        setRefreshing(false);
      })
      .catch((err) => {
        console.log('error is :--', err.message);
        if (err.message == 'Request failed with status code 401') {
          getTabWithoutId();
        }
        setLoading(false);
      });
  };

  //getting tab data without token----
  const getTabWithoutId = () => {
    axiosInstance1
      .get(
        `${API.tabById}/${route.params.tabId}?organizationId=${orgId}`
      )
      .then((response) => {
        console.log('getting data without id in ebook tab screen', response);
        processTabData(response);
        setRefreshing(false)
      })
      .catch((err) => {
        console.log('error while getting data', err.message);
        setLoading(false);
      });
  };


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
    console.log('getting mediSeries data with auth')
    let axiosConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + `${token}`
      },
    };
    try {
      const response = await axiosInstance1.get(`${API.mediaseries}/${route.params?.seriesId}`, axiosConfig);
      console.log('getting ebook mediascereis data', response);

      processSeriesData(response)
      setRefreshing(false)
    }
    catch (err) {
      if(noInternetModalVisible == false){
        dispatch({
          type: SET_ALERT, payload: {
            setShowAlert: true,
            data: {
              message: 'unable to get series data',
              showCancelButton: true,
              onCancelPressed: () => {
                dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
              },
            }
          }
        })
      }
      // console.log('getting error while getting series data with auth')
      setRefreshing(false);
      setLoading(false);
    }
  };

  const getMediaSeriesDataWithoutAuth = async () => {
    try {
      const response = await axiosInstance1.get(
        `${API.mediaseriesId}/${route.params?.seriesId}?organizationId=${orgId}`
      )
      console.log('getting mediSeries data without auth', response)
      processSeriesData(response)
      setRefreshing(false)

    }
    catch (err) {
      if(noInternetModalVisible == false){
        dispatch({
          type: SET_ALERT, payload: {
            setShowAlert: true,
            data: {
              message: 'unable to get series data without auth',
              showCancelButton: true,
              onCancelPressed: () => {
                dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
              },
            }
          }
        })
      }
  
      // console.log('getting error while getting series data without auth')
      setRefreshing(false);
      setLoading(false);
    }
  };

  //TO PROCESS SERIES DATA __
  const processTabData = async (response) => {
    const nameList = response.data?.data[0].mediaSeriesDTO;
    //setting title to show int he header--

    //creating imageURL to show in the header section 
    if (nameList.bannerArtwork != null) {
      nameList.bannerArtwork.document[
        'newImage'
      ] = `${API.IMAGE_LOAD_URL}/${nameList.bannerArtwork.document.id}?${API_CONSTANT.BANNER_IMAGE_HEIGHT_WIDTH}`;
      setMediaBanner(nameList.bannerArtwork.document.newImage);
      setBannerBgColor((nameList?.bannerArtwork?.document?.imageColur) ? nameList.bannerArtwork.document.imageColur : ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR);
    }

    if (nameList.mediaItemDTO != null) {
      nameList.mediaItemDTO.map((item, index) => {
        if (item.squareArtwork != null) {
          item.squareArtwork.document['newImage'] = `${API.IMAGE_LOAD_URL}/${item.squareArtwork.document.id}?${API_CONSTANT.SQUARE_IMAGE_HEIGHT_WIDTH}`;
        }
      });
    }

    let newContentList = [];
    nameList?.mediaItemDTO.forEach((item) => {
      if (item.status == "PUBLISHED") {
        newContentList.push(item);
      }
    }
    );
    const finalList = newContentList.map((item, index) => {
      let type = item.document?.path.slice(-3,);
      if (type == 'pdf') {
        return { ...item, type: 'pdf' }
      } else {
        return { ...item, type: 'epub' }
      }
    })

    console.log('final list>>', finalList)
    setBookList(filterContentForIOS(finalList));
    setLoading(false)

  }

  const processSeriesData = async (response) => {
    const nameList = response.data?.data
    setTitle(nameList?.title);
    if (nameList.bannerArtwork != null) {
      nameList.bannerArtwork.document[
        'newImage'
      ] = `${API.IMAGE_LOAD_URL}/${nameList.bannerArtwork.document.id}?${API_CONSTANT.BANNER_IMAGE_HEIGHT_WIDTH}`;
      setMediaBanner(nameList.bannerArtwork.document.newImage);
      setBannerBgColor((nameList?.bannerArtwork?.document?.imageColur) ? nameList.bannerArtwork.document.imageColur : ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR);
    }
    if (nameList.mediaItemDTO != null) {
      nameList.mediaItemDTO.map((item, index) => {
        if (item.squareArtwork != null) {
          item.squareArtwork.document['newImage'] = `${API.IMAGE_LOAD_URL}/${item.squareArtwork.document.id}?${API_CONSTANT.SQUARE_IMAGE_HEIGHT_WIDTH}`;
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
    const finalList = newContentList.map((item, index) => {
      let type = item.document?.path.slice(-3,);
      if (type == 'pdf') {
        return { ...item, type: 'pdf' }
      } else {
        return { ...item, type: 'epub' }
      }
    });

    setBookList(filterContentForIOS(finalList));
    setLoading(false)
  }


  const onRefresh = () => {
    setRefreshing(true)
    getData()
  }

  return (
    <View style={{ ...styles.container, backgroundColor: theme == "DARK" ? '#000' : '#fff' }}>
      <Loader loading={loading} />
      <StatusBar translucent={false} showHideTransition={true} backgroundColor={brandColor} />
      <FlatList
        showsVerticalScrollIndicator={false}
        style={{
          marginLeft: moderateScale(3),
          marginRight: moderateScale(3)
        }}
        nestedScrollEnabled={true}
        data={bookList}
        numColumns={2}
        ItemSeparatorComponent={() => <View style={styles.mainViewFlat} />}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            tintColor={'gray'}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }

        renderItem={({ item, index, type }) => {
          return (

            <View style={{ ...styles.item, }}>
              <TouchableOpacity activeOpacity={0.7} style={(index % 2 === 0) ? styles.evenItemPadding : styles.oddItemPadding} onPress={() => {
                if (item.document == null) {
                  dispatch({
                    type: SET_ALERT, payload: {
                      setShowAlert: true,
                      data: {
                        message: 'No book is available',
                        showCancelButton: true,
                        onCancelPressed: () => {
                          dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                        },
                      }
                    }
                  })
                } else {
                  navigation.navigate('EbookItem', {
                    type: item.type,
                    imageBgColor: item?.ebookArtwork?.document?.imageColur,
                    ebookItemId: item?.id

                  })
                }
              }}>
                <FastImage
                  source={{
                    uri: `${item.ebookArtwork.document.path}`,
                    priority: FastImage.priority.high
                  }}
                  style={{
                    width: '100%',
                    aspectRatio: 396 / 612,
                    backgroundColor: item?.ebookArtwork?.document?.imageColur
                  }}
                />
              </TouchableOpacity>
            </View>

          )
        }}
        keyExtractor={(item) => item.id}
      />
    </View>
  )
}

export default EbookDetail

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: moderateVerticalScale(15)
  },
  item: {
    flex: .5,
    flexDirection: 'row',
    padding: moderateScale(2),
    // backgroundColor:'red',
    justifyContent: 'center',
    // marginLeft: moderateScale(11.5),
    // marginRight: moderateScale(11.5),
    // marginBottom: moderateScale(12),

  },
  mainViewFlat: {
    width: 16,
  },
  row: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  oddItemPadding: {
    paddingLeft: 6,//+2
    paddingRight: 10,//'+2
    paddingBottom: 10//+2
  },
  evenItemPadding: {
    paddingLeft: 10,//+2
    paddingRight: 6,//+2
    paddingBottom: 10//+2
  },

})