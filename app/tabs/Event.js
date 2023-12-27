import React, { useState, useEffect, useLayoutEffect } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import EventList from '../components/EventList';
import { axiosInstance1 } from '../constant/Auth'
import * as API_CONSTANT from '../constant/ApiConstant';
import * as API from '../constant/APIs';
import { useSelector } from 'react-redux';
const { width, height } = Dimensions.get('window');
export default function Events({ route, navigation }) {
  const { token, isAuthenticated } = useSelector(state => state.authReducer);
  const [EventData, setEventData] = useState([]);
  const [bannerImg, setBannerImg] = useState(null);
  const [itemImage, setItemImage] = useState('WIDE');
  const [imageBgColor, setImageBgColor] = useState(null);
  const [shadow, setShadow] = useState(null);
  const [itemDisplay, setItemDisplay] = useState('IMAGE')
  const [animation, setAnimation] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { orgId } = useSelector(state => state.activeOrgReducer);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: imageBgColor,
        shadowRadius: 0,
        shadowColor: "transparent",
        elevation: 0,
        shadowOffset: {
          height: 0,
        },
      },
      // headerShown: false
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      getTabWithId();
    } else {
      axiosInstance1
        .get(
          `${API.tabById}/${route.params.tabId}?organizationId=${orgId}`
        )
        .then((res) => {
          processEventDataResponse(res);
        })
        .catch((error) => {
          // alert("Falid to request Network")
          // console.log(error);
          //   setLoading(false);
        });
    }
  }, []);

  const processEventDataResponse = (res) => {
    console.log("event res", res);
    // console.log("tab id", route.params.tabId);
    if (res.status == 200) {
      const nameList = res.data.data;
      // console.log("scu",nameList[0].calendarDTO.bannerArtwork.document.id);
      if (nameList[0].calendarDTO.bannerArtwork != null) {
        // console.log("ssdsfbsijk");
        nameList[0].calendarDTO.bannerArtwork.document[
          "newImage"
        ] = `${API.IMAGE_LOAD_URL}/${nameList[0].calendarDTO.bannerArtwork.document.id}?${API_CONSTANT.STACK_BANNER}`;
        setBannerImg(nameList[0].calendarDTO.bannerArtwork.document.newImage);
        // console.log('banner img>>', nameList[0].calendarDTO.bannerArtwork.document.newImage);
        setImageBgColor(
          nameList[0].calendarDTO.bannerArtwork.document.imageColur
        );
      }

      if (nameList[0].calendarDTO != null) {
        if (nameList[0].calendarDTO.calendarDesign != null) {
          setItemImage(nameList[0].calendarDTO.calendarDesign.itemImages);
          setShadow(nameList[0].calendarDTO.calendarDesign.shadow);
          setItemDisplay(nameList[0].calendarDTO.calendarDesign.itemDisplay);
        }
        nameList[0].calendarDTO.eventDTOList.forEach((event) => {
          if (event.squareArtwork != null) {
            event.squareArtwork.document[
              "newImage"
            ] = `${API.IMAGE_LOAD_URL}/${event.squareArtwork.document.id}?${API_CONSTANT.SQUARE_IMAGE_ROW_HEIGHT_WIDTH}`;
          }
          if (event.wideArtwork != null) {
            // console.log("event ", event);
            event.wideArtwork.document[
              "newImage"
            ] = `${API.IMAGE_LOAD_URL}/${event.wideArtwork.document.id}?${API_CONSTANT.WIDE_IMAGE_GRID_HEIGHT_WIDTH}`;
          }
        });
        // console.log("event updated list", nameList[0].calendarDTO);
        setEventData(nameList[0].calendarDTO.eventDTOList);
        setAnimation(false);
        setRefreshing(false);
      }
    }
  };

  const getTabWithId = () => {
    let axiosConfig = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + `${token}`,
      },
    };
    axiosInstance1
      .get(`${API.tab}/${route.params.tabId}`, axiosConfig)
      .then((res) => {
        processEventDataResponse(res);
      })
      .catch((error) => {
        // alert("Falid to request Network")
        // console.log(error);
        //   setLoading(false);
      });
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (isAuthenticated) {
      getTabWithId();
    } else {
      axiosInstance1
        .get(
          `${API.tabById}/${route.params.tabId}?organizationId=${orgId}`
        )
        .then((res) => {
          processEventDataResponse(res);
        })
        .catch((error) => {
          // console.log(error);
        });
    }
  };
  return (
    <View style={Styles.container}>
      <EventList
        EventData={EventData}
        banner={bannerImg}
        itemImage={itemImage}
        imageBgColor={imageBgColor}
        shadow={shadow}
        itemDisplay={itemDisplay}
        animation={animation}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}
const Styles = StyleSheet.create({
  container: {
    // backgroundColor: '#fff', 
    flex: 1,
    // paddingTop: width * 0.05
  },
  card: {
    // borderWidth: 1,
    marginHorizontal: width * 0.05,
    marginBottom: width * 0.05,
    paddingVertical: height / 18,
    backgroundColor: '#5C5859'

  },
  icons: {
    // borderWidth: 1,
    textAlign: 'center'
  }
})
