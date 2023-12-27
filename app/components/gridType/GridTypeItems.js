import React, { useEffect, useState } from 'react';
import {
  FlatList,
  View,
  Image,
  TouchableOpacity,
  RefreshControl,
  Text,
  useWindowDimensions,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native'
import ThemeConstant, { DynamicThemeConstants } from '../../constant/ThemeConstant';
import * as tabDesignService from "../../services/TabDesignsService";
import styles from './styles'
import { useSelector } from 'react-redux';
import HeaderComponent from '../HeaderComponent';
import { moderateScale, scale } from 'react-native-size-matters';
import FastImage from 'react-native-fast-image';
import CustomButton from '../CustomButton';

export default function GridTypeItems({ data, itemImages, itemTitle, margin, shadow, marginType, marginEdges, screenType, theme, refreshing, onRefresh, listDesign }) {
  const navigation = useNavigation();
  const { width } = useWindowDimensions()
  const { token } = useSelector(state => state.authReducer);

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          tintColor={'gray'}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      contentContainerStyle={{
        margin: margin ?
          marginType == 'VERYTHIN' ?
            ThemeConstant.MARGIN_VERY_THIN :
            marginType == 'THIN' ?
              ThemeConstant.MARGIN_THIN :
              ThemeConstant.MARGIN_THICK
          :
          0,
        paddingBottom: margin ?
          marginType == 'VERYTHIN' ?
            ThemeConstant.MARGIN_VERY_THIN + 5 :
            marginType == 'THIN' ?
              ThemeConstant.MARGIN_THIN + 5 :
              ThemeConstant.MARGIN_THICK + 8
          :
          0,
      }}

      nestedScrollEnabled={true}
      data={data}
      numColumns={2}
      ItemSeparatorComponent={() => <View style={{
        height: margin && itemTitle !== 'BELOW' ?
          marginType === 'VERYTHIN'
            ? ThemeConstant.MARGIN_VERY_THIN
            : marginType === 'THIN'
              ? ThemeConstant.MARGIN_THIN
              : ThemeConstant.MARGIN_THICK
          : 0,
      }} />}
      columnWrapperStyle={{ justifyContent: 'space-between' }}
      keyExtractor={(item) => item.id + item.title}
      ListHeaderComponent={
        React.useMemo(() => {
          return (
            <View style={{
              flex: 1,
              overflow: 'hidden',
              borderRadius: margin && marginEdges === 'CURVE' ? 10 : 0,
              marginBottom: margin && listDesign.headerType !== 'OFF' ?
                marginType === 'VERYTHIN'
                  ? ThemeConstant.MARGIN_VERY_THIN
                  : marginType === 'THIN'
                    ? ThemeConstant.MARGIN_THIN
                    : ThemeConstant.MARGIN_THICK
                : -1,
            }}>
              <HeaderComponent listDesign={listDesign} />
            </View>
          )
        })}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            tabDesignService.navigateItem(item, token, navigation)
          }
          }
          style={{
            ...styles.subViewFlatlist,
            marginRight: margin && index % 2 == 0 ?
              marginType === 'VERYTHIN'
                ? ThemeConstant.MARGIN_VERY_THIN
                : marginType === 'THIN'
                  ? ThemeConstant.MARGIN_THIN
                  : ThemeConstant.MARGIN_THICK
              : -1,

          }}
        >
          <ImageComp item={item} screenType={screenType} itemImages={itemImages} margin={margin} marginEdges={marginEdges} shadow={shadow} theme={theme} itemTitle={itemTitle} />
          <View
            style={{
              ...styles.details,
              display: itemTitle === 'BELOW' ? 'flex' : 'none',
              width: '100%',
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...styles.title,
                color:
                  theme == 'DARK'
                    ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                    : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                paddingHorizontal: 5,
              }}
            >
              {item.title}
            </Text>

            {item.subtitle || item.subTitle ? (
              <Text
                numberOfLines={1}
                style={{
                  ...styles.description,
                  color:
                    theme == 'DARK'
                      ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                      : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY,
                  paddingHorizontal: 5,
                }}
              >
                {item.subtitle || item.subTitle}
              </Text>
            ) : null}

          </View>

        </TouchableOpacity>
      )}
    />
  );
}

const ImageComp = ({ item, screenType, itemImages, margin, marginEdges, shadow, theme, itemTitle }) => {
  const [showColor, setShowColor] = useState(true);

  return (

    <View style={{
      ...styles.card,
      //SHADOW ____
      shadowColor:
        shadow && theme == 'LIGHT' ? ThemeConstant.SHADOW_COLOR : null,
      shadowOpacity: 1,
      shadowOffset: ThemeConstant.SHADOW_OFFSET,
      shadowRadius: 10,
      shadowOpacity: shadow && margin && 1,
      elevation: margin && shadow ? 5 : 0,
      marginTop: !margin && itemTitle == 'OFF' ? -2 : 0,
      //shadow end-

      borderRadius: margin && marginEdges === 'CURVE' ? scale(14) : 0,
      backgroundColor: showColor ?
        tabDesignService.imageColor(
          item,
          screenType,
          itemImages
        )
          ? tabDesignService.imageColor(item, screenType, itemImages)
          : ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR
        : null,
    }}>
      {
        itemImages === 'WIDE' ?

          <FastImage
            style={[
              {
                ...styles.image,
                borderRadius: margin && marginEdges === 'CURVE' ? scale(10) : 0,
                width: '100%',
                height: undefined,
                aspectRatio: 16 / 9
              },
            ]}
            onLoad={() => {
              setShowColor(false)
            }}
            source={{ uri: item?.wideArtwork ? item?.wideArtwork?.document?.newImage : item.newImage }}
            resizeMode={FastImage.resizeMode.contain}
          />
          :

          <FastImage
            style={[
              {
                ...styles.image,
                borderRadius: margin && marginEdges === 'CURVE' ? scale(10) : 0,
                width: '100%',
                height: undefined,
                aspectRatio: 1 / 1,
              },
            ]}
            onLoad={() => {
              setShowColor(false)
            }}
            source={{
              uri: screenType == 'vod' ? item?.squareArtwork?.document?.newImage ? item?.squareArtwork?.document?.newImage : item?.wideArtwork?.document?.newImage : item.newImage
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
      }
      {
        item.contentType == 'LIVE_STREAMING' && item.liveStatus == 'LIVE' &&
        <CustomButton
          butttonText={'Live'}
          inputStyle={{ position: 'absolute', borderRadius: 5, top: 8, right: 8, backgroundColor: 'red', height: moderateScale(28), width: moderateScale(50) }}
        />
      }
    </View>
  )

}
