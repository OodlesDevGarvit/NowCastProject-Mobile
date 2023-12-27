import React,{useState,useEffect} from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import ThemeConstant from '../../constant/ThemeConstant';
import { DynamicThemeConstants } from '../../constant/ThemeConstant';
import { useSelector } from 'react-redux';
import { navigateItem } from '../../services/TabDesignsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width: deviceWidth } = Dimensions.get('window');

export default function InboxDetail({ navigation, route }) {
  const { brandColor, mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
  const { token } = useSelector(state => state.authReducer);
  const { item, getDate } = route.params;


  //fo View item button to navigation.navigate to the the specified media type--
  const navigateToItem = () => {
    navigateItem(item, token, navigation,item?.contentId);
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
      <View
        style={{
          ...Styles.container,
          paddingBottom: 10,
          backgroundColor:
            theme == 'DARK'
              ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
              : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
        }}
      >
        {item?.contentId && item?.wideArtwork['newImage'] ? (
          <View
            style={{
              width: deviceWidth,
              height: 220,
              backgroundColor: item?.wideArtwork?.document?.imageColur,
            }}
          >
            <Image
              style={Styles.img}
              source={{ uri: item.wideArtwork['newImage'] }}
              width={deviceWidth}
              height={220}
            />
          </View>
        ) : null}

        <View style={Styles.info}>
          <Text
            style={{
              color:
                theme == 'DARK'
                  ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                  : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY,
            }}
          >
            {item?.groupName}
          </Text>
          <Text
            style={{
              color:
                theme == 'DARK'
                  ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                  : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY,
            }}
          >
            {item?.notificationSentDate!==null && item?.notificationSentTime!==null ? getDate(item?.notificationSentDate, item?.notificationSentTime) : null}
          </Text>
        </View>

        <Text
          style={{
            ...Styles.description,
            color:
              theme == 'DARK'
                ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
          }}
        >
          {item?.text}
        </Text>

        {item?.contentId ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              ...Styles.button,
              backgroundColor:
                theme == 'DARK'
                  ? 'gray'
                  : ThemeConstant.BACKGROUND_COLOR_SELECTED,
            }}
            onPress={navigateToItem}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: ThemeConstant.TEXT_SIZE_LARGE,
                color:
                  theme == 'DARK'
                    ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                    : brandColor,
              }}
            >
              View Item
            </Text>
          </TouchableOpacity>
        ) : null}

        <Text
          style={{
            ...Styles.bottomText,
            color:
              theme == 'DARK'
                ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY,
          }}
        >
          {item?.description}
        </Text>
      </View>
    </View>
  );
}

const Styles = StyleSheet.create({
  container: {
    //
  },

  img: {
    // borderWidth: 1
    // marginBottom: 20
  },
  info: {
    // borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    paddingVertical: 10,
    marginTop: 20,
  },
  description: {
    // borderWidth: 1,
    fontSize: 17,
    color: ThemeConstant.TEXT_COLOR_SUBTEXTS,
    lineHeight: 20,
    margin: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 10,
    // marginTop: 10,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  bottomText: {
    fontSize: 17,
    color: ThemeConstant.TEXT_COLOR_SUBTEXTS,
    lineHeight: 20,
    marginHorizontal: 20,
    // marginTop: 30
  },
});
