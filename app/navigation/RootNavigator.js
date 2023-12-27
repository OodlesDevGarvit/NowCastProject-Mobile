import React from 'react';
import { Platform, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { heightper } from '../utils/heightWidthRatio';
import { HeaderBackButton, CardStyleInterpolators } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

//IMPORTING SCREEN---

import { VideoOnDemand, VideoPlayer, AudioPlayer, MediaItem, VideoSeries, SubscriptionDetails, NotLoggedInSubscriptionDetails, GoLiveDetail, EbookItem } from '../screens'
import Auth from './Auth';
import DrawerNavigator from './DrawerNavigator';
import AppLink from '../screens/Applink/AppLink';
import BlogDetails from '../screens/BlogDetails/BlogDetail';
import CardForm from '../screens/Giving/CardForm';
import GivingCollectData from '../screens/Giving/GivingCollectData';
import ThankYouScreen from '../screens/Giving/ThankYou';
import Calendar from '../screens/Calander/Calendar';
import RssFeed from '../screens/RssFeed/RssFeed';
import EventDetail from '../screens/EventDetail/EventDetail';
import { useSelector } from 'react-redux';
import GivingStackScreen from '../screens/Giving/GivingStackScreen';
import NoteStackScreen from '../screens/Notes/NoteStackScreen';
import contactUsFea from '../screens/ContactUsDrawer/contactUsFeature';
import Bible from '../screens/Bible/Bible';
import QuerySent from '../screens/ContactUsDrawer/QuerySent';
import RegisterForm from '../screens/EventRegistration/RegisterForm';
import RegisterSuccess from '../screens/EventRegistration/EventRegisterSuccess';
import Ebook from '../screens/EbookStore/Ebook';
import EbookDetail from '../screens/EbookStore/EbookDetail';
import Epub from '../screens/EbookStore/Epub';
import AlbumDetail from '../screens/AlbumDetail/AlbumDetail';
import Checkout from '../screens/Checkout/Checkout';
import LinkItem from '../screens/Applink/LinkItem';
import RssFeedItem from '../screens/RssFeed/RssFeedItem';
import Downloads from '../screens/Downloads/Downloads'


const RootNavigator = ({ navigation, route }) => {
  const { brandColor, mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );

  const Stack = createStackNavigator();

  return (
    <Stack.Navigator
       initialRouteName="DrawerNavigator"
      detachInactiveScreens={false}
      // mode="modal"

      screenOptions={{
        presentation: "modal",
        headerBackTitleVisible: false,
        animationEnabled: false,
        cardStyle: {
          backgroundColor: 'transparent',
          opacity: 1,
        },
        headerStatusBarHeight: Platform.OS == 'android' ? 0 : undefined,
        headerStyle: {
          shadowRadius: 0,
          shadowColor: 'transparent',
          elevation: 0,
          shadowOffset: {
            height: 0,
          },
        },
        headerBackTitle: null,

      }}
    >
      {/* Auth Navigator which includer Login Signup will come once */}
      <Stack.Screen
        name="Auth"
        component={Auth}
        options={{
          headerShown: false,
          headerStatusBarHeight: Platform.OS == 'android' ? 0 : undefined,
        }}
      />

      {/* Navigation Drawer as a landing page */}
      <Stack.Screen
        name="DrawerNavigator"
         component={DrawerNavigator}
        // Hiding header for Navigation Drawer as we will use our custom header
        options={{ headerShown: false, animationEnabled: true, cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid }}
      />
      <Stack.Screen
        name="VideoOnDemand"
        component={VideoOnDemand}
        options={({ route }) => ({
          title: route.params.name,
          headerTintColor: 'white',
          title: route.params.title,
          headerStatusBarHeight: Platform.OS == 'android' ? 0 : undefined,
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
          headerTitleStyle: {
            textTransform: 'uppercase',
          },
        })}
      />
      <Stack.Screen
        name="VideoSeries"
        component={VideoSeries}
        options={({ route }) => ({
          cardStyle: {
            backgroundColor: 'transparent',
            opacity: 1,
          },
          headerStatusBarHeight: Platform.OS == 'android' ? 0 : undefined,
          headerTintColor: 'white',
          title: route?.params?.title,
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
          headerTitleStyle: {
            textTransform: 'uppercase',
          },
        })}
      />
      <Stack.Screen
        name="MediaItem"
        component={MediaItem}
        options={{
          headerShown: false
        }}
      />

      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayer}
        options={({ route }) => ({
          headerShown: false, animationEnabled: true, cardStyleInterpolator: CardStyleInterpolators.forNoAnimation
        })}
      />
      <Stack.Screen
        name="AppLink"
        component={AppLink}
        options={({ route }) => ({
          headerTintColor: 'white',
          headerStatusBarHeight: Platform.OS == 'android' ? 0 : undefined,
          title: null,
          headerTitleStyle: {
            textTransform: 'uppercase',
          },
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
        })}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetail}
        options={({ route }) => ({
          title: 'EVENT DETAIL',
          headerStatusBarHeight: Platform.OS == 'android' ? 0 : undefined,
          cardStyle: {
            backgroundColor: 'transparent',
            opacity: 1,
          },
          headerTintColor: 'white',
          title: route.params.title,
          headerTitleStyle: {
            textTransform: 'uppercase',
          },
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
        })}
      />

      <Stack.Screen
        name="RegisterForm"
        component={RegisterForm}
        options={({ route }) => ({
          cardStyle: {
            backgroundColor: 'transparent',
            opacity: 1,
          },
          headerStatusBarHeight: Platform.OS == 'android' ? 0 : undefined,
          headerTintColor: 'white',
          title: 'EVENT FORM',
          headerTitleStyle: {
            textTransform: 'uppercase',
          },
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
        })}
      />
      <Stack.Screen
        name="RegisterSuccess"
        component={RegisterSuccess}
        options={({ route }) => ({
          cardStyle: {
            backgroundColor: 'transparent',
            opacity: 1,
          },
          headerTintColor: 'white',
          title: '',
          headerTitleStyle: {
            textTransform: 'uppercase',
          },
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
        })}
      />

      <Stack.Screen
        name="BlogDetail"
        component={BlogDetails}
        options={({ navigation, route }) => ({
          cardStyle: {
            backgroundColor: 'transparent',
            opacity: 1,
          },
          headerTintColor: 'white',
          title: route.params.title,
          headerTitleStyle: {
            textTransform: 'uppercase',
          },
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
        })}
      />
      <Stack.Screen
        name="AudioPlayer"
        component={AudioPlayer}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SubscriptionDetails"
        component={SubscriptionDetails}
        options={({ navigation, route }) => ({
          title: 'Details',
          headerTintColor: 'white',
          headerTitleStyle: {
            textTransform: 'uppercase',
          },
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
          cardStyle: {
            backgroundColor: 'transparent',
            opacity: 1,
          },
          // headerLeft: () => {
          //   return (
          //     <HeaderBackButton
          //       tintColor={'#fff'}
          //       onPress={() => {
          //         navigation.pop();
          //       }}
          //     />
          //   );
          // },
        })}
      />

      <Stack.Screen
        name="NotLoggedInSubscriptionDetails"
        component={NotLoggedInSubscriptionDetails}
        options={({ navigation, route }) => ({
          title: null,
          // headerTintColor: 'white',
          headerTitleStyle: {
            textTransform: 'uppercase',
          },
          headerStyle: {
            backgroundColor: '#fff',
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
        })}
      />

      <Stack.Screen
        name="CardForm"
        component={CardForm}
        options={({ navigation, route }) => ({
          cardStyle: {
            backgroundColor: 'transparent',
            opacity: 1,
          },
          // title: route.params.title,
          title: 'Card Form',
          headerTintColor: 'white',
          headerTitleStyle: {
            textTransform: 'uppercase',
          },
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
        })}
      />
      <Stack.Screen
        name="GivingCollectData"
        component={GivingCollectData}
        options={({ navigation, route }) => ({
          title: route.params.title,
          headerTintColor: 'white',
          headerTitleStyle: {
            textTransform: 'uppercase',
          },
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
        })}
      />
      <Stack.Screen
        name="ThankYouScreen"
        component={ThankYouScreen}
        options={({ navigation, route }) => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="Calendar"
        component={Calendar}
        options={({ navigation, route }) => ({
          title: route.params.title,
          headerTintColor: 'white',
          headerTitleStyle: {
            textTransform: 'uppercase',
          },
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
          headerBackTitle: null,
        })}
      />
      <Stack.Screen
        name="RssFeed"
        component={RssFeed}
        options={({ navigation, route }) => ({
          title: null,
          headerTintColor: 'white',
          headerTitleStyle: {
            textTransform: 'uppercase',
          },
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
        })}
      />
      <Stack.Screen
        name="NoteStackScreen"
        component={NoteStackScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ContactUsStackScreen"
        component={contactUsFea}
        options={{
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
          headerTitle: 'Contact Us',
          headerTintColor: '#fff',
        }}
      />

      <Stack.Screen
        name="DownloadsStackScreen"
        component={Downloads}
        options={{
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
          headerTitle: 'Downloads',
          headerTintColor: '#fff',
        }}
      />

      <Stack.Screen
        name="QuerySent"
        component={QuerySent}
        options={{
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
          headerTitle: '',
          headerTintColor: '#fff',
        }}
      />

      <Stack.Screen
        name="Bible"
        component={Bible}
        options={{
          headerStyle: {
            backgroundColor: theme == 'DARK' ? '#000' : '#fff',
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
          headerTintColor: theme == 'DARK' ? '#fff' : '#000',
        }}
      />
      <Stack.Screen
        name="Ebook"
        component={Ebook}
        options={{
          headerShown: false, animationEnabled: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
        }}
      />
      <Stack.Screen
        name="Epub"
        component={Epub}
        options={{
          headerShown: false, animationEnabled: true, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
        }}
      />
      <Stack.Screen
        name="EbookDetail"
        component={EbookDetail}
        options={({ route }) => ({
          title: null,
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
          headerTintColor: '#fff',
        })}
      />
      <Stack.Screen
        name="EbookItem"
        component={EbookItem}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="GivingStackScreen"
        component={GivingStackScreen}
        options={{
          title: 'DONATE',
          headerTintColor: 'white',
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
        }}
      />
      <Stack.Screen
        name="AlbumDetail"
        component={AlbumDetail}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="Checkout"
        component={Checkout}
        options={{
          title: 'PAYMENT',
          headerTintColor: 'white',
          headerStyle: {
            backgroundColor: brandColor,
            shadowRadius: 0,
            shadowColor: 'transparent',
            elevation: 0,
            shadowOffset: {
              height: 0,
            },
          },
        }}
      />
      <Stack.Screen
        name="LinkItem"
        component={LinkItem}
        options={{
          title: 'Link',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="RssFeedItem"
        component={RssFeedItem}
        options={{
          title: 'RssFeed',
          headerShown: true,
        }}
      />

    </Stack.Navigator>
  );
};

export default RootNavigator;
