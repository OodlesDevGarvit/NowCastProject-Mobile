import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { TouchableOpacity } from 'react-native-gesture-handler';
import LogIcon from 'react-native-vector-icons/AntDesign';
import ThemeConstant, {
  DynamicThemeConstants,
} from '../constant/ThemeConstant';
import AccountCircle from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/actions/authAction';
import { moderateScale, moderateVerticalScale, scale } from 'react-native-size-matters';
import { OpenUrl } from '../services/TabDesignsService';
import { NOWCAST_URL } from '../constant/Auth';
import ArrowIcon from 'react-native-vector-icons/EvilIcons';
import CIcon from 'react-native-vector-icons/AntDesign'
import { SET_ALERT } from '../store/actions/types';
import { UTILS } from '../utils/utils';

const CustomSidebarMenu = (props) => {
  const dispatch = useDispatch();
  const { mobileTheme: theme, logoId } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
  const { token, isAuthenticated, user } = useSelector(state => state.authReducer)
  const { basicInfo: { firstName, lastName } = { firstName: null, lastName: null }, logo } = user ?? {};
  const { yr_String } = useSelector((state) => state.misc)

  let LastName = lastName == null || " " ? " " : lastName
  let fullName = firstName + ' ' + LastName
  let count = fullName.length
  let finalName = count > 20 ? fullName.slice(0, 20) + '...' : fullName

  //navigating to detailed page------
  const handleDetailsPageNavigation = async () => {

    if (isAuthenticated) {
      props.navigation.navigate('SubscriptionDetails');
    } else {
      props.navigation.navigate('NotLoggedInSubscriptionDetails');
    }

    await props.navigation.closeDrawer()

  };

  //to handle logout button-
  const _handleLogout = async () => {
    await dispatch(logoutUser(token))
    await props.navigation.replace('DrawerNavigator')
  }


  return (
    <SafeAreaView
      style={{
        ...stylesSidebar.sideMenuContainer,
        backgroundColor:
          theme == 'DARK'
            ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
            : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
        position: 'relative'
      }}
    >
      <View
        style={{
          ...stylesSidebar.profileHeader,
          alignItems: 'center',
          backgroundColor:
            theme == 'DARK'
              ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
              : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
        }}
      >
        <View
          style={{
            ...stylesSidebar.profileHeaderPicCircle,
            backgroundColor:
              theme == 'DARK'
                ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
                : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
            justifyContent: 'center',
            alignItems: 'center',
            left: 5
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              handleDetailsPageNavigation();
            }}
          >
            {!isAuthenticated || logo == null ? (
              <AccountCircle
                name="account-circle"
                size={60}
                style={{
                  color:
                    theme == 'DARK'
                      ? DynamicThemeConstants.DARK.ICON_COLOR_WHITE
                      : DynamicThemeConstants.LIGHT.ICON_COLOR_BLACK,
                }}
              />
            ) : (
              <Image
                source={{ uri: logo.path }}
                style={{
                  width: 59,
                  height: 59,
                  borderRadius: 30,
                  marginTop: 10,
                }}
              />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => {
            isAuthenticated
              ? handleDetailsPageNavigation()
              : (props.navigation.navigate('Auth', { screen: 'LoginScreen' }),
                props.navigation.closeDrawer());
          }}
        >
          <View
            style={{
              ...stylesSidebar.profileHeaderText,
              color:
                theme == 'DARK'
                  ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                  : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY,
            }}
          >
            {isAuthenticated ? (
              <Text
                style={{ ...stylesSidebar.profileHeaderText }}
                onPress={handleDetailsPageNavigation}
              >
                {finalName}
              </Text>
            ) : (
              <Text
                style={{
                  ...stylesSidebar.profileHeaderText,
                }}
                onPress={() => { }}
              >
                Sign in or Sign up
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* line between top and bottom section of the drawer nav */}
      <View style={stylesSidebar.profileHeaderLine} />

      <DrawerContentScrollView
        contentContainerStyle={{ paddingTop: 0 }}
        {...props}
        style={{
          backgroundColor:
            theme == 'DARK'
              ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
              : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
        }}
      >
        <DrawerItemList {...props} />

        {isAuthenticated ? (
          <DrawerItem
            label={({ color }) => (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <LogIcon
                  name="logout"
                  size={22}
                  style={{
                    color: ThemeConstant.ICON_COLOR_SECONDARY,
                    height: 25,
                    width: 45,
                    marginRight: 15,
                    textAlign: 'center',
                    textAlignVertical: 'center'
                  }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    color: 'gray',
                  }}
                >
                  {'Logout'}
                </Text>
              </View>
            )}
            onPress={() => {
              props.navigation.toggleDrawer();
              dispatch({
                type: SET_ALERT, payload: {
                  setShowAlert: true,
                  data: {
                    message: 'Are you sure you want to Log out?',
                    showCancelButton: true,
                    onCancelPressed: () => {
                      dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                    },
                    showConfirmButton: true,
                    confirmText: 'Confirm',
                    onConfirmPressed: () => {
                      dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                      _handleLogout();
                    }
                  }

                }
              }
              )
            }}
          />
        )
          : null}
      </DrawerContentScrollView>

      <TouchableOpacity activeOpacity={0.8} onPress={() => { OpenUrl(`${NOWCAST_URL.NowCast}`) }}>
        <View style={stylesSidebar.bottomCont}>
          <View >
            <Image
              style={{
                height: moderateScale(18),
                aspectRatio: 1920 / 380
              }}
              source={UTILS.DRAWER_LOGO_SUPERADMIN}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
              <CIcon name={"copyright"} color={"#b5b5b5"} size={7} style={{ marginTop: scale(1) }} />
              <Text includeFontPadding={true} style={{ marginLeft: scale(3), color: '#b5b5b5', fontSize: scale(8) }}>{yr_String}</Text>
            </View>
          </View>
          <ArrowIcon name={"chevron-right"} color={"#d3d3d3"} size={40} />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CustomSidebarMenu;

const stylesSidebar = StyleSheet.create({
  sideMenuContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 10,
    color: 'white',
  },
  profileHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 1,
    textAlign: 'center',
  },
  profileHeaderPicCircle: {
    width: 68,
    height: 60,
    borderRadius: 60 / 2,
    color: 'white',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeaderText: {
    color: '#656565',
    alignSelf: 'flex-start',
    paddingHorizontal: moderateScale(4),
    fontFamily: ThemeConstant.FONT_FAMILY,
    fontSize: 16,
  },
  profileHeaderLine: {
    height: 1,
    marginHorizontal: 0,
    backgroundColor: '#e2e2e2',
    marginTop: 15,
  },
  bottomCont: {
    width: '100%',
    marginBottom: moderateVerticalScale(20),
    paddingLeft: moderateScale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: moderateScale(8),
  }
});
