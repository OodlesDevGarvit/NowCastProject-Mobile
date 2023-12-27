import React, { useState, useEffect, useLayoutEffect } from 'react'
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native'
import { DynamicThemeConstants } from '../../constant/ThemeConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import RenderHtml from 'react-native-render-html';
import { useNavigation } from '@react-navigation/core';
import { WebView } from 'react-native-webview'
import { useSelector } from 'react-redux';

export default function BlogDetails({ navigation, route }) {
  const item = route.params;
  const { mobileTheme: theme } = useSelector((state) => state.brandingReducer.brandingData);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor:
          theme == 'DARK'
            ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
            : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
      }}
    >
      {/* <View style={styles.image}>
                <Image style={styles.img} source={{ uri: item.imageURL }} />
            </View> */}
      <View style={styles.textConatiner}>
        <Text
          style={{
            ...styles.title,
            color:
              theme == 'DARK'
                ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
          }}
        >
          {item.title}
        </Text>

        <Text
          style={{
            ...styles.date,
            color:
              theme == 'DARK'
                ? DynamicThemeConstants.DARK.TEXT_COLOR_SECONDARY
                : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY,
          }}
        >
          {item.date}
        </Text>

        {item.detailedDescription !== '' ? (
          <RenderHtml
            contentWidth={Dimensions.get('window').width}
            source={{
              html: item.detailedDescription,
            }}
            tagsStyles={{
              body: {
                color:
                  theme == 'DARK'
                    ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                    : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
              },
            }}
          />
        ) : (
          // <WebView
          //     scalesPageToFit={true}
          //     bounces={false}
          //     javaScriptEnabled
          //     style={{ height: 800, width: 400 }}
          //     source={{
          //         html: `
          //         <style>
          //         body:{
          //             font-size:48px
          //         }
          //         </style>
          //         ${item.detailedDescription}`,
          //     }}
          //     automaticallyAdjustContentInsets={false}
          // />
          <RenderHtml
            source={{
              html: item.description,
            }}
            tagsStyles={{
              body: {
                color:
                  theme == 'DARK'
                    ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                    : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                lineHeight: 25,
              },
            }}
            contentWidth={Dimensions.get('window').width}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    image: {
        // borderWidth: 1,
        // borderColor: 'red',
        height: 200,
        marginBottom: 30
    },
    img: {
        width: Dimensions.get('window').width,
        height: '100%'
    },
    textConatiner: {
        marginHorizontal: 20,
        // borderWidth: 1,
        // borderColor: 'red'
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 3,
        // borderWidth: 1,
        // borderColor: 'red'
    },
    date: {
        marginBottom: 15,
        // borderWidth: 1,
        // borderColor: 'red'
    },
    detail: {
        // borderWidth: 1,
        // borderColor: 'red',
        lineHeight: 23

    }

})
