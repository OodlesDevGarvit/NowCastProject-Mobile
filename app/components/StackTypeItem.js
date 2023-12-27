import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  useWindowDimensions,
  Platform
} from "react-native";
import ThemeConstant from "../constant/ThemeConstant";
import { useNavigation } from "@react-navigation/native";
import { DynamicThemeConstants } from "../constant/ThemeConstant";
import * as tabDesignService from "../services/TabDesignsService";
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  verticalScale,
} from 'react-native-size-matters';
import { useSelector } from "react-redux";
import HeaderComponent from "./HeaderComponent";
import FastImage from "react-native-fast-image";
import CustomButton from "./CustomButton";

export default function StackTypeItem({
  data,
  itemImages,
  itemTitle,
  margin,
  marginType,
  marginEdges,
  shadow,
  showTransparency,
  transparencyColor,
  transparencyCount,
  // showBannerTransparency,
  screenType,
  theme,
  refreshing,
  onRefresh,
  listDesign
}) {

  const { token } = useSelector(state => state.authReducer);
  const navigation = useNavigation();

  let newTransparencyCount = transparencyCount / 10

  return (
    <FlatList
      data={data}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ItemSeparatorComponent={() => <View style={{
        height: margin && itemTitle !== 'BELOW' ?
          marginType === 'VERYTHIN'
            ? ThemeConstant.MARGIN_VERY_THIN
            : marginType === 'THIN'
              ? ThemeConstant.MARGIN_THIN
              : ThemeConstant.MARGIN_THICK
          : 0,
      }} />}
      contentContainerStyle={{
        margin: margin
          ? marginType == 'VERYTHIN'
            ? ThemeConstant.MARGIN_VERY_THIN
            : marginType === 'THIN'
              ? ThemeConstant.MARGIN_THIN
              : ThemeConstant.MARGIN_THICK
          : 0,
        paddingBottom: margin ?
          marginType == 'VERYTHIN' ?
            ThemeConstant.MARGIN_VERY_THIN + 5 :
            marginType == 'THIN' ?
              ThemeConstant.MARGIN_THIN + 5 :
              ThemeConstant.MARGIN_THICK + 5
          :
          0,
      }}
      ListHeaderComponent={React.useMemo(() => {
        return (
          <View style={{
            flex: 1,
            overflow: 'hidden',
            borderRadius: margin && marginEdges === 'CURVE' ? 10 : 0,
            marginBottom: margin && listDesign.headerType !== "OFF" ?
              marginType === 'VERYTHIN'
                ? ThemeConstant.MARGIN_VERY_THIN
                : marginType === 'THIN'
                  ? ThemeConstant.MARGIN_THIN
                  : ThemeConstant.MARGIN_THICK
              : 0,
          }}>
            <HeaderComponent listDesign={listDesign} />
          </View>
        )
      })}
      keyExtractor={item => item.id + item.title}
      renderItem={({ item, index }) => {
        return (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              tabDesignService.navigateItem(item, token, navigation)
            }
            }
          >
            {item.contentType == 'LIVE_STREAMING' && item.liveStatus == 'LIVE' &&
              <CustomButton
                butttonText={'Live'}
                btnTextStyle={{ color: '#fff' }}
                inputStyle={{ position: 'absolute', borderRadius: 5, top: 8, right: 8, backgroundColor: 'red', height: moderateScale(28), width: moderateScale(50), zIndex: 10, elevation: 2 }}

              />
            }
            <ImageComp item={item} screenType={screenType} itemImages={itemImages} margin={margin} marginEdges={marginEdges} shadow={shadow} theme={theme} />
            {
              itemTitle == 'BELOW' &&
              <View
                style={{
                  height: moderateVerticalScale(40),
                  paddingHorizontal: moderateScale(15),
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    ...Styles.title,
                    color: '#fff',
                    width: '85%',
                    textAlign: 'center',
                    elevation: 8,
                    fontSize: scale(15),
                    marginBottom: Platform.OS == 'android' ? moderateVerticalScale(-3) : moderateVerticalScale(-2),
                    color:
                      theme == 'DARK'
                        ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                        : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                  }}
                >
                  {item.title}
                </Text>
                {
                  item.subtitle || item.subTitle ?
                    <Text
                      numberOfLines={1}
                      style={{
                        ...Styles.description,
                        width: '80%',
                        textAlign: 'center',
                        elevation: 8,
                        fontSize: scale(13),
                        fontWeight: '500',
                        marginTop: Platform.OS == 'android' ? moderateVerticalScale(-3) : moderateVerticalScale(-2),
                        color:
                          itemTitle === 'OVERLAY' && theme == 'DARK'
                            ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                            : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY,
                      }}
                    >
                      {item.subtitle || item.subTitle}
                    </Text>
                    :
                    null
                }
              </View>
            }

            {
              itemTitle == 'OVERLAY' &&
              <>
                <View style={{
                  zIndex: 2,
                  flex: 1,
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: margin && marginEdges === 'CURVE' ? scale(12) : 0,
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  elevation: margin && shadow ? 5 : 0,
                }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      ...Styles.title,
                      color: '#fff',
                      width: '92%',
                      textAlign: 'center',
                      elevation: 8,
                      textShadowColor: 'rgba(0, 0, 0, 0.75)s)',
                      textShadowOffset: { width: .5, height: 1 },
                      textShadowRadius: 0,
                      fontSize: scale(19),
                      letterSpacing: scale(-0.5)
                    }}
                    includeFontPadding={false}
                  >
                    {item.title}
                  </Text>

                  {item.subtitle != null && item.subtitle !== '' &&
                    <Text
                      numberOfLines={1}
                      style={{
                        ...Styles.description,
                        width: '95%',
                        textAlign: 'center',
                        color: '#fff',
                        elevation: 8,
                        textShadowColor: 'rgba(0, 0, 0, 0.75)s)',
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 4,
                        fontSize: scale(14),
                        marginTop: Platform.OS == 'android' ? moderateVerticalScale(-6) : moderateVerticalScale(-4)
                      }}
                      includeFontPadding={false}
                    >
                      {item.subtitle}
                    </Text>}

                </View>

                {showTransparency &&
                  <View style={{
                    ...Styles.details,
                    display: 'flex',
                    position: 'absolute',
                    width: '100%',
                    height: index == data.length - 1 && !margin ? '110%' : '100%',
                    alignItems: 'center',
                    backgroundColor: transparencyColor,
                    borderRadius: margin && marginEdges === 'CURVE' ? scale(12) : 0,
                    opacity: newTransparencyCount,
                    elevation: margin && shadow ? 5 : 0,
                    margin: !margin ? -2 : 0,
                  }}>
                  </View>
                }

              </>
            }
          </TouchableOpacity>
        )
      }}
    />
  );
}

const ImageComp = ({ item, screenType, itemImages, margin, marginEdges, shadow, theme }) => {
  const { height, width } = useWindowDimensions();
  const [showColor, setShowColor] = useState(true);

  const shadowStyle = {
    shadowColor: shadow && margin && theme == "LIGHT" ? ThemeConstant.SHADOW_COLOR : null,
    shadowOffset: ThemeConstant.SHADOW_OFFSET,
    shadowOpacity: shadow && margin && theme == "LIGHT" ? 1 : 0,
    shadowRadius: 3,
    elevation: shadow && margin && theme == "LIGHT" ? 5 : 0,
  }

  return (

    <View style={[shadowStyle, { margin: !margin ? -1 : 0 }]}>
      <FastImage
        style={{
          ...shadowStyle,
          backgroundColor: showColor ?
            tabDesignService.imageColor(
              item,
              screenType,
              itemImages
            )
              ? tabDesignService.imageColor(item, screenType, itemImages)
              : ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR
            :
            null,
          borderRadius: margin && marginEdges === 'CURVE' ? scale(12) : 0,
          width: '100%',
          aspectRatio: itemImages === 'BANNER' ? 1920 / 692 : 1920 / 1080,
        }}
        source={{
          uri: screenType == 'vod' ? item?.wideArtwork?.document?.newImage ? item?.wideArtwork?.document?.newImage : item?.bannerArtwork?.document?.newImage : item.newImage
        }}
        resizeMode={FastImage.resizeMode.contain}
        onLoad={() => {
          setShowColor(false)
        }}
      />
    </View>
  )

}

export const Styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
  image: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  details: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    // fontWeight: Platform.OS == 'android' ? '700' : '600',
    fontWeight: 'bold',
    fontFamily: ThemeConstant.FONT_FAMILY,
    paddingHorizontal: scale(2)
  },
  description: {
    fontSize: moderateScale(17),
    color: 'rgba(0,0,0,0.5)',
    fontFamily: ThemeConstant.FONT_FAMILY,
    fontWeight: '400'
  },
});
