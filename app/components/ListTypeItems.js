import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import ThemeConstant from "../constant/ThemeConstant"
import { useNavigation } from "@react-navigation/native";
import * as tabDesignService from "../services/TabDesignsService";
import moment from "moment";
import { DynamicThemeConstants } from "../constant/ThemeConstant";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useSelector, useDispatch } from "react-redux";
import HeaderComponent from "./HeaderComponent";
import { moderateScale, scale } from "react-native-size-matters";
import FastImage from "react-native-fast-image";
import CustomButton from "./CustomButton";
import { TouchableOpacity } from "react-native";

const ListTypeItems = ({
  data,
  itemImages,
  itemDisplay,
  shadow,
  screenType,
  theme,
  refreshing,
  onRefresh,
  listDesign
}) => {
  const { token } = useSelector(state => state.authReducer);
  const navigation = useNavigation();
  const dateToString = (momentInUTC, format) => {
    return moment.utc(momentInUTC).format(format);
  };
  const { height, width } = useWindowDimensions();

  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id + item.title}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={React.useMemo(() => {
        return (
          <View style={{
            flex: 1,
            overflow: 'hidden',
            marginBottom: 0,
          }}>
            <HeaderComponent listDesign={listDesign} />
          </View>
        )
      })}
      renderItem={({ item, index }) => {
        return (
          <TouchableOpacity
            key={index}
            onPress={() => {
              tabDesignService.navigateItem(item, token, navigation)
            }
            }
            activeOpacity={1}
          >
            <View
              style={{
                ...Styles.card,
                height: height > width ? 90 : 60,
                borderBottomWidth: theme == 'DARK' ? 0.7 : 1.4,
                borderBottomColor:
                  theme == 'DARK' ? ThemeConstant.BORDER_COLOR_BETA : '#f7f8fa',
              }}
            >
              {itemDisplay === 'IMAGE' ? (
                <ImageComp item={item} screenType={screenType} itemImages={itemImages} theme={theme} shadow={shadow} itemDisplay={itemDisplay} />
              ) : null}

              {itemDisplay === 'DATE' ? (
                <View
                  style={{
                    ...Styles.date,
                    shadowColor: ThemeConstant.SHADOW_COLOR,
                    shadowOpacity: 1,
                    shadowOffset: ThemeConstant.SHADOW_OFFSET,
                    shadowRadius: 3,
                    elevation: 5,
                    borderColor: theme == 'DARK' ? 'gray' : '#d3d3d3',
                  }}
                >
                  <View>
                    <Text style={{ ...Styles.monthText }}>
                      {dateToString(item.createdDate, 'MMM')}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ ...Styles.createDate }}>
                      {dateToString(item.createdDate, ' DD')}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        alignSelf: 'center',
                        fontWeight: 'bold',
                        color: '#000',
                      }}
                    >
                      {dateToString(item.createdDate, 'yyyy')}
                    </Text>
                  </View>
                </View>
              ) : null}


              <View style={{ ...Styles.details }}>
                <Text
                  numberOfLines={1}
                  style={{
                    ...Styles.title,
                    color:
                      theme == 'DARK'
                        ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                        : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                  }}
                >
                  {item.title}
                </Text>
                {item.subtitle || item.subTitle ? (
                  <Text
                    numberOfLines={1}
                    style={{
                      ...Styles.description,
                      color:
                        theme == 'DARK'
                          ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                          : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY,
                    }}
                  >
                    {item.subtitle || item.subTitle}
                  </Text>
                ) : null}
              </View>
              {itemDisplay !== 'IMAGE' &&
                <LiveIndicator item={item} />
              }
            </View>
          </TouchableOpacity>
        )
      }}
    />
  );
}

export default React.memo(ListTypeItems)

const LiveIndicator = ({ item }) => {
  return (
    (item?.contentType == 'LIVE_STREAMING' && item.liveStatus == 'LIVE' &&
      <CustomButton
        butttonText={'Live'}
        btnTextStyle={{ fontSize: 13 }}
        inputStyle={{ position: 'absolute', borderRadius: 5, top: 6, right: 6, backgroundColor: 'red', height: moderateScale(19), width: moderateScale(32) }}

      />
    )
  )

}
const ImageComp = ({ item, screenType, itemImages, theme, shadow, itemDisplay }) => {
  const [showColor, setShowColor] = useState(true);
  return (
    <View
      style={{
        //FOR SHADOW  __
        shadowColor:
          shadow && theme == 'LIGHT' ? ThemeConstant.SHADOW_COLOR : null,
        shadowOpacity: shadow && 1,
        shadowOffset: ThemeConstant.SHADOW_OFFSET,
        shadowRadius: 3,
        elevation: shadow ? 5 : 0,
        //shadow end--

        display:
          itemDisplay === 'TITLEONLY'
            ? 'none'
            : itemDisplay === 'IMAGE'
              ? 'flex'
              : 'none',
        borderRadius: scale(14),
        backgroundColor: showColor ?
          tabDesignService.imageColor(
            item,
            screenType,
            itemImages
          )
            ? tabDesignService.imageColor(
              item,
              screenType,
              itemImages
            )
            : ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR :
          null,
        aspectRatio: itemImages === 'WIDE' ? 16 / 9 : 1 / 1,
      }}
    >
      <FastImage
        style={{
          ...Styles.image,
          borderRadius: scale(10),
          aspectRatio: itemImages === 'WIDE' ? 16 / 9 : 1 / 1,
        }}
        source={{
          uri: screenType == 'vod' ? item?.squareArtwork?.document?.newImage ? item?.squareArtwork?.document?.newImage : item?.wideArtwork?.document?.newImage : item.newImage
        }}
        onLoad={() => setShowColor(false)}
        resizeMode={FastImage.resizeMode.contain}
      />
      <LiveIndicator item={item} />
    </View>
  )
}

const Styles = StyleSheet.create({
  card: {
    // height: 90,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    paddingVertical: 5,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  monthText: {
    fontSize: 20,
    alignSelf: 'center',
    fontFamily: ThemeConstant.FONT_FAMILY,
    color: 'black',
    fontWeight: 'bold',
  },
  createDate: {
    fontSize: 15,
    fontFamily: ThemeConstant.FONT_FAMILY,
    color: 'black',
    fontWeight: 'bold',
    // marginRight: 3,
    // borderWidth: 1,
    // borderColor: "red",
    width: '100%',
    textAlign: 'center',
    paddingRight: 5,
  },
  title: {
    fontWeight: 'bold',
    fontSize: ThemeConstant.TEXT_SIZE_LARGE,
    color: 'rgba(0,0,0,0.75)',
    fontFamily: ThemeConstant.FONT_FAMILY,
    // textTransform: 'capitalize',
  },
  description: {
    color: 'rgba(0,0,0,0.5)',
    fontSize: 14,
    fontFamily: ThemeConstant.FONT_FAMILY,
    textTransform: 'capitalize',
    marginTop: 3,
  },
  details: {
    flex: 1,
    marginLeft: 15,
  },
  date: {
    borderWidth: 1,
    height: 70,
    width: 70,
    borderRadius: 10,
    justifyContent: 'center',
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#D3D3D3',
  },
  shadow: {
    flex: 1,
  },
});
