import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  StatusBar
} from 'react-native';
import GridTypeItems from '../../components/gridType/GridTypeItems';
import ListTypeItems from '../../components/ListTypeItems';
import StackTypeItem from '../../components/StackTypeItem';
import * as API_CONSTANT from '../../constant/ApiConstant';
import * as API from '../../constant/APIs';
import { axiosInstance1 } from '../../constant/Auth';
import { DynamicThemeConstants } from '../../constant/ThemeConstant';
import { useSelector } from 'react-redux';
import { useLayoutEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { filterContentForIOS } from '../../utils/FilterContentForIos';

const { height, width } = Dimensions.get('window');

const VideoOnDemand = ({ route, navigation }) => {

  const { brandColor, mobileTheme: theme } = useSelector(state => state.brandingReducer.brandingData);
  const { token, isAuthenticated } = useSelector(state => state.authReducer);
  const { itemId, type } = route.params;
  const isFocused = useIsFocused();


  const [contentData, setContent] = useState([]);

  const [animating, setAnimating] = useState(true);
  const [ItemLayout, setItemLayout] = useState('ROWS');
  const [itemImages, setItemImages] = useState('');
  const [itemDisplay, setItemDisplay] = useState('IMAGE');
  const [itemTitle, setItemTitle] = useState('OFF'); //below, overlay,off
  const [margin, setMargin] = useState(false); //true or false
  const [shadow, setShadow] = useState(false); //true or  false
  const [marginType, setMarginType] = useState('VERYTHIN');
  const [marginEdges, setMarginEdges] = useState('CURVE');
  const [title, setTitle] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [listDesign, setListDesign] = useState({});
  const { orgId } = useSelector(state => state.activeOrgReducer);

  //setting the title ---
  useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
    });
  }, [title]);


  useEffect(() => {
    if (isAuthenticated) {
      dataWithAuth();
    } else {
      dataWithoutAuth();
    }
  }, [token]);

  // [contentData])
  const dataWithAuth = () => {
    let axiosConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + `${token}`,
        'Access-Control-Allow-Origin': '*',
      },
    };
    axiosInstance1
      .get(`${API.catalogIdAuth}/${itemId}`, axiosConfig)
      .then((response) => {
        processCatalogResponseData(response);
      })
      .catch((error) => {
        setRefreshing(false);
        setAnimating(false);
      });
  };

  const dataWithoutAuth = () => {
    axiosInstance1
      .get(
        `${API.catalogId}/${itemId}?organizationId=${orgId}`
      )
      .then((response) => {
        processCatalogResponseData(response);
      })
      .catch((error) => {
        setRefreshing(false);
        setAnimating(false)
        // console.log("error", error);
      });
  };

  function processCatalogResponseData(response) {
    if (response.status == 200) {
      const nameList = response.data.data;

      console.log('nameList>>', nameList)
      setTitle(nameList.title);

      let listDesign = {};

      if (nameList.listDesign != null) {

        setListDesign(nameList?.listDesign[0])
        listDesign = nameList?.listDesign[0];


        nameList.listDesign.map((item, index) => {
          if (
            item != null &&
            item.designType != null &&
            item.designType === 'MOBILE_APP'
          ) {
            if (item.itemLayout != null) {
              setItemLayout(item.itemLayout);
            }
            if (item.itemDisplay != null) {
              setItemDisplay(item.itemDisplay);
            }
            if (item.itemTitles != null) {
              setItemTitle(item.itemTitles);
            }
            if (item.itemImages != null) {
              setItemImages(item.itemImages);
            }

            if (item.margins != null) {
              setMargin(item.margins);
              if (listDesign.marginType !== null) {
                setMarginType(listDesign.marginType);
              }
              if (listDesign.marginEdges !== null) {
                setMarginEdges(listDesign.marginEdges);
              }
            }
            if (item.shadow != null) {
              setShadow(item.shadow);
            }
          }
        });
      }
      if (nameList.catalogContents != null) {
        nameList.catalogContents.map((item, index) => {
          if (listDesign != null && listDesign.itemImages == 'BANNER') {
            if (item.bannerArtwork !== null) {
              item.bannerArtwork.document[
                'newImage'
              ] = `${API.IMAGE_LOAD_URL}/${item.bannerArtwork.document.id}?${API_CONSTANT.STACK_BANNER}`;
            }
          }
          else if (listDesign != null && listDesign.itemImages == 'WIDE') {
            if (item.wideArtwork != null) {
              if (listDesign.itemLayout === 'ROW') {
                item.squareArtwork.document[
                  'newImage'
                ] = `${API.IMAGE_LOAD_URL}/${item.squareArtwork.document.id}?${API_CONSTANT.ROW_WIDE}`;
              } else {
                item.wideArtwork.document[
                  'newImage'
                ] = `${API.IMAGE_LOAD_URL}/${item.wideArtwork.document.id}?${API_CONSTANT.STACK_WIDE}`;
              }
            }

          } else if (listDesign != null && listDesign.itemImages == 'SQUARE') {
            if (item.squareArtwork !== null) {
              if (listDesign.itemLayout === 'ROW') {
                item.squareArtwork.document[
                  'newImage'
                ] = `${API.IMAGE_LOAD_URL}/${item.squareArtwork.document.id}?${API_CONSTANT.ROW_SQAURE}`;
              } else {
                item.squareArtwork.document[
                  'newImage'
                ] = `${API.IMAGE_LOAD_URL}/${item.squareArtwork.document.id}?${API_CONSTANT.GRID_SQUARE}`;
              }
            }
          }
        });
        const newContentList = [];
        nameList.catalogContents.forEach((item) => {
          if (item?.status == "PUBLISHED") {
            newContentList.push(item);
          } 
        });

        console.log('LIST data DEBUG!!!>>', newContentList)
        setContent(filterContentForIOS(newContentList));
      }
    }
    setRefreshing(false);
    setAnimating(false)
  }


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
          screenType="vod"
          theme={theme}
          refreshing={refreshing}
          onRefresh={onRefresh}
          listDesign={listDesign}
        />
      );
    } else if (itemLayout == 'ROWS') {
      return (
        <ListTypeItems
          data={contentData}
          itemDisplay={itemDisplay}
          itemImages={itemImages}
          marginType={marginType}
          marginEdges={marginEdges}
          screenType="vod"
          theme={theme}
          refreshing={refreshing}
          onRefresh={onRefresh}
          listDesign={listDesign}
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
          screenType="vod"
          theme={theme}
          refreshing={refreshing}
          onRefresh={onRefresh}
          listDesign={listDesign}
        />
      );
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (isAuthenticated) {
      dataWithAuth();
    } else {
      dataWithoutAuth();
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        width: width,
        backgroundColor:
          theme == 'DARK'
            ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
            : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
      }}
    >
      {isFocused && <StatusBar showHideTransition={true} backgroundColor={brandColor} barStyle={'light-content'} translucent={false} />}
      {animating ? (
        <ActivityIndicator
          animating={animating}
          color={'gray'}
          size="large"
          style={styles.activityIndicator}
        />
      ) : null}

        {mainContent(ItemLayout)}

    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  activityIndicator: {
    zIndex: 1,
    position: 'absolute',
    width: width,
    height: height,
  },
  customSlide: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    height: 130,
    marginTop: 0,
  },
});
export default VideoOnDemand;
