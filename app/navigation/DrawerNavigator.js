import React, { useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import FastImage from 'react-native-fast-image';
import { moderateScale, moderateVerticalScale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { CastButton, useRemoteMediaClient } from 'react-native-google-cast';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { getStatusBarHeight } from 'react-native-status-bar-height';

//IMPORTNG SREEN,CONSTANTS--
import CustomSidebarMenu from '../components/CustomSidebarMenu';
import NavigationDrawerHeader from '../components/NavigationDrawerHeader';
import { handleCast } from '../services/ChromeCast';
import { UPDATE_CAST_CLIENT } from '../store/actions/types';
import { GoLiveStack, NotesStack, ContactUsStack, SettingStack, InboxStack } from '../screens';
import TabNavigator from './TabNavigator';
import { DynamicThemeConstants } from '../constant/ThemeConstant';
import * as API from '../constant/APIs';
import { STATUS_BAR_HEIGHT } from '../constant/Theme';
import DownloadsStackScreen from '../screens/Downloads/downloadsStack';


const getHeaderTitle = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? '';

  switch (routeName) {
    case routeName:
      return routeName;

    case 'WELCOME':
      return 'WELCOME';
  }
};
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const TabNavigatorStack = ({ navigation, route }) => {

  const dispatch = useDispatch();
  const { brandColor, mobileTheme: theme } = useSelector((state) => state.brandingReducer.brandingData);
  const client = useRemoteMediaClient();

  useEffect(() => {
    // console.log('client is changed>>>>', client)
    dispatch({ type: UPDATE_CAST_CLIENT, payload: client })
  }, [client])


  return (
    <Stack.Navigator
      initialRouteName="TabNavigator"
      screenOptions={{ headerMode: 'float', animationEnabled: false }}
    >
      <Stack.Screen
        name="TabNavigator"
        component={TabNavigator}
        options={({ route }) => ({
          title: getHeaderTitle(route), //Set Header Title
          headerStatusBarHeight: Platform.OS == 'android' ? 0 : undefined,
          headerLeft: () => (
            <NavigationDrawerHeader
              navigationProps={navigation}
              color={
                getHeaderTitle(route)
                  .toUpperCase()
                  .includes('BIBLE')
                  ? theme == 'DARK' ? '#fff' : '#000'
                  : '#fff'
              }
            />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleCast}>
              <CastButton style={{ width: 25, height: 24, tintColor: '#fff' }} />
            </TouchableOpacity>
          ),
          headerRightContainerStyle: {
            marginRight: moderateScale(15)
          },
          headerStyle: {
            backgroundColor: getHeaderTitle(route)
              .toUpperCase()
              .includes('BIBLE')
              ? theme == 'DARK' ? '#000' : '#fff'
              : brandColor, //Set Header color
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
          headerTintColor: getHeaderTitle(route)
            .toUpperCase()
            .includes('BIBLE')
            ? theme == 'DARK' ? '#fff' : '#000'
            : '#fff', //Set Header text color
          cardStyle: {
            backgroundColor: 'transparent',
            opacity: 1,
          },
        })}
      />
    </Stack.Navigator>
  );
};

const DrawerNavigator = ({ navigation, route }) => {

  const brandingData = useSelector((state) => state.brandingReducer);
  const {
    brandColor,
    shortAppTitle: appName,
    mobileTheme: theme,
    logoId,
  } = brandingData.brandingData;
  const { isAdmin, isAuthenticated, liveEnabled } = useSelector(state => state.authReducer);

  return (
    <Drawer.Navigator
      drawerContentOptions={{
        activeTintColor: '#808080',
        color: '#010433',
        itemStyle: { marginVertical: 2, color: '#656565' },
        labelStyle: {
          color: '#656565',
          fontSize: 14,
        },
      }}
      screenOptions={{
        headerShown: false,
        unmountOnBlur: true
      }}
      drawerContent={(props) => <CustomSidebarMenu {...props} />}
    >
      <Drawer.Screen //Homescreen and default first screen after login---
        name="TabNavigatorStack"
        component={TabNavigatorStack}
        title={TabNavigatorStack}
        options={{
          unmountOnBlur: false,
          drawerLabel: ({ focused, size, color }) => (
            <View style={Styles.container}>
              <FastImage
                source={{ uri: `${API.PNG_IMAGE_LOAD_URL}/${logoId}` }}
                style={Styles.Icon}
                resizeMode={FastImage.resizeMode.contain}
              />
              <Text
                style={{
                  ...Styles.text,
                  flex: 1,
                  color: focused
                    ? theme == 'DARK'
                      ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                      : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                    : 'gray',
                }}
              >
                {appName}
              </Text>
            </View>
          ),
        }}
      />

      <Drawer.Screen //Inbox Screen stack -----------------------------
        name="Inbox"
        component={InboxStack}
        options={{
          drawerLabel: ({ focused, size, color }) => (
            <View style={Styles.container}>
              <Icon
                name="inbox"
                size={22}
                style={{
                  color: focused
                    ? theme == 'DARK'
                      ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                      : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                    : 'gray',
                  ...Styles.Icon,
                }}
              />
              <Text
                style={{
                  ...Styles.text,
                  color: focused
                    ? theme == 'DARK'
                      ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                      : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                    : 'gray',
                }}
              >
                Inbox
              </Text>
            </View>
          ),
        }}
      />

      {
        isAuthenticated && isAdmin && liveEnabled &&
        <Drawer.Screen  //GO LIVE DRAWER SECTION
          name="goLiveStack"
          component={GoLiveStack}
          options={{
            drawerLabel: ({ focused, size, color }) => (
              <View style={Styles.container}>
                <Icon
                  name="video"
                  size={22}
                  style={{
                    color: focused
                      ? theme == 'DARK'
                        ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                        : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                      : 'gray',
                    ...Styles.Icon,
                  }}
                />
                <Text
                  style={{
                    ...Styles.text,
                    color: focused
                      ? theme == 'DARK'
                        ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                        : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                      : 'gray',
                  }}
                >
                  Go Live
                </Text>
              </View>
            ),
          }}
        />
      }


      {/* UNCOMMENT THE BELOW CODE TO BRING BACK NOTES IN DRAWER */}

      <Drawer.Screen //Notes stack  Screen---------------------------------
        name="NotesScreen"
        component={NotesStack}
        options={{
          drawerLabel: ({ focused, size, color }) => (
            <View style={Styles.container}>
              <Icon
                name="file-text"
                size={22}
                style={{
                  color: focused
                    ? theme == 'DARK'
                      ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                      : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                    : 'gray',
                  ...Styles.Icon,
                }}
              />
              <Text
                style={{
                  ...Styles.text,
                  color: focused
                    ? theme == 'DARK'
                      ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                      : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                    : 'gray',
                }}
              >
                Notes
              </Text>
            </View>
          ),
        }}
      />

      <Drawer.Screen //Contact us feature Stack stack -----------------------------
        name="Contact Us"
        component={ContactUsStack}
        options={{
          drawerLabel: ({ focused, size, color }) => (
            <View style={Styles.container}>
              <AntDesign
                name="contacts"
                size={22}
                style={{
                  color: focused
                    ? theme == 'DARK'
                      ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                      : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                    : 'gray',
                  ...Styles.Icon,
                }}
              />
              <Text
                style={{
                  ...Styles.text,
                  color: focused
                    ? theme == 'DARK'
                      ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                      : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                    : 'gray',
                }}
              >
                Contact Us
              </Text>
            </View>
          ),
        }}
      />

      <Drawer.Screen //Contact us feature Stack stack -----------------------------
        name="Downloads"
        component={DownloadsStackScreen}
        options={{
          drawerLabel: ({ focused, size, color }) => (
            <View style={Styles.container}>
              <AntDesign
                name="download"
                size={22}
                style={{
                  color: focused
                    ? theme == 'DARK'
                      ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                      : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                    : 'gray',
                  ...Styles.Icon,
                }}
              />
              <Text
                style={{
                  ...Styles.text,
                  color: focused
                    ? theme == 'DARK'
                      ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                      : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                    : 'gray',
                }}
              >
                Downloads
              </Text>
            </View>
          ),
        }}
      />


      <Drawer.Screen //Settings stack  Screen  -------------------------------
        name="Settings"
        component={SettingStack}
        options={{
          drawerLabel: ({ focused, size, color }) => (
            <View style={Styles.container}>
              <Icon
                name="settings"
                size={22}
                style={{
                  color: focused
                    ? theme == 'DARK'
                      ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                      : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                    : 'gray',
                  ...Styles.Icon,
                }}
              />
              <Text
                style={{
                  ...Styles.text,
                  color: focused
                    ? theme == 'DARK'
                      ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                      : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                    : 'gray',
                }}
              >
                Settings
              </Text>
            </View>
          ),
        }}
      />
    </Drawer.Navigator>
  );
};
export default DrawerNavigator;

const Styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  Icon: {
    height: 25,
    width: 45,
    marginRight: 15,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  text: {
    fontSize: 18,
  },
});
