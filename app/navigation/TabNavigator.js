import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AboutScreen from '../tabs/about/AboutTab';
import BlogTab from '../tabs/BlogTab';
import Welcome from '../tabs/welcome/Welcome';
import Events from '../tabs/Event';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GivingStackScreen from '../screens/Giving/GivingStackScreen';
import GetIcon from '../services/IconBasedOnId';
import AppLink from '../screens/Applink/AppLink';
import ThemeConstant from '../constant/ThemeConstant';
import { axiosInstance1 } from '../constant/Auth';
import * as API from '../constant/APIs';
import * as API_CONSTANT from '../constant/ApiConstant';
import { useSelector } from 'react-redux';
import Bible from '../screens/Bible/Bible';
// import EbookSeries from '../screens/EbookStore/EbookSeries';
import EbookDetail from '../screens/EbookStore/EbookDetail';

const Tab = createBottomTabNavigator();
const WelcomeStack = createStackNavigator();

export const WelcomeStackScreen = ({ route, navigation }) => {
  return (
    <WelcomeStack.Navigator screenOptions={{ headerShown: false }}>
      <WelcomeStack.Screen
        component={Welcome}
        name={'Welcome'}
        initialParams={{
          name: route.params.name,
          tabId: route.params.tabId
        }}
      />
      <WelcomeStack.Screen component={AppLink} name={'AppLink'} />
    </WelcomeStack.Navigator>
  );
};

export default function TabNavigator({ route, navigation }) {
  const { brandColor, mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const [TabInfo, setTabInfo] = useState([]);
  //setting tabs before rendering--
  useEffect(() => {
    AsyncStorage.getItem('@activeTabInfo').then(async (value) => {
      let tabs = JSON.parse(value);
      if (tabs !== null && tabs.length > 0) {
        setTabInfo(tabs);
      }
    });
    getAllTabsWithoutAuth();
  }, []);

  //getting all active tab list from API------
  const getAllTabsWithoutAuth = () => {
    axiosInstance1
      .get(
        `${API.getActiveTabList}?organizationId=${orgId}`
      )
      .then((res) => {
        const nameList = res.data.data;
        let arr = [];
        let obj = {};

        nameList.forEach((value) => {
          value[
            'newImg'
          ] = `${API.IMAGE_LOAD_URL}/${value.iconId}?height=100&width=100`;
          obj = {
            id: value.id,
            iconId: value.iconId,
            newImg: value.newImg,
            notes: value.notes,
            tabType: value.tabType,
            title: value.title,
          };

          arr.push(obj);
        });
        if (arr !== null && arr.length > 0) {
          setTabInfo(arr);
          // console.log('Active tab info:----:', arr)
          AsyncStorage.setItem('@activeTabInfo', JSON.stringify(arr));
        }
      })
      .catch((error) => {
        AsyncStorage.getItem('@activeTabInfo').then(async (value) => {
          let val = JSON.parse(value);
          setTabInfo(val);
        });
      });
  };


  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }} i>
      {
        TabInfo && TabInfo.length > 0 ?
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarIcon: ({ focused, color, size }) => {
                if (route.name) {
                  return <GetIcon
                    id={route.params.iconId}
                    width={22}
                    height={22}
                    fill={
                      focused ? (theme == 'DARK' ? '#fff' : brandColor) : 'gray'
                    }
                  />
                } else if (route.name === 'DefaultComponet') {
                  return null;
                }
              },
              cardStyle: {
                backgroundColor: 'transparent',
              },
              tabBarActiveTintColor: theme == 'DARK' ? '#fff' : '#000',
              tabBarInactiveTintColor: 'gray',
              tabBarLabelStyle: {
                fontSize: 12,
                position: 'relative',
                bottom: 6,
                fontFamily: ThemeConstant.FONT_FAMILY,
              },
              tabBarStyle: {
                backgroundColor: theme == 'DARK' ? '#000' : '#fff',
                borderTopWidth: 0,
                borderTopColor: theme == 'DARK' ? '#000' : '#fff',
                height: 55,
                paddingBottom: 0,
                paddingHorizontal: 10
              },
            })}
          // tabBarOptions={{
          //   activeTintColor: theme == 'DARK' ? '#fff' : '#000',
          //   inactiveTintColor: 'gray',
          //   labelStyle: {
          //     fontSize: 12,
          //     position: 'relative',
          //     bottom: 6,
          //     fontFamily: ThemeConstant.FONT_FAMILY,
          //   },
          //   style: {
          //     backgroundColor: theme == 'DARK' ? '#000' : '#fff',
          //     borderTopWidth: 0,
          //     borderTopColor: theme == 'DARK' ? '#000' : '#fff',
          //     height: 55,
          //     paddingBottom: 0,
          //     paddingHorizontal: 10
          //   },
          // }}
          >
            {TabInfo?.map((item) => {
              // console.log("loop", item);
              if (item.tabType == 'BUILD_YOUR_OWN') {
                return (
                  <Tab.Screen
                    name={item.title}
                    key={item.id}
                    initialParams={{
                      tabId: item.id,
                      name: item.title,
                      icons: item.newImg,
                      iconId: item.iconId,
                    }}
                    component={WelcomeStackScreen}
                    options={{
                      headerShown: false,
                    }}
                  />
                );
              }
              if (item.tabType == 'BLOG') {
                return (
                  <Tab.Screen
                    name={item.title}
                    key={item.id}
                    initialParams={{
                      tabId: item.id,
                      name: item.title,
                      icons: item.newImg,
                      iconId: item.iconId,
                    }}
                    component={BlogTab}
                  />
                );
              }
              if (item.tabType == 'ABOUT') {
                return (
                  <Tab.Screen
                    name={item.title}
                    key={item.id}
                    initialParams={{
                      tabId: item.id,
                      name: item.title,
                      icons: item.newImg,
                      iconId: item.iconId,
                    }}
                    component={AboutScreen}
                  />
                );
              }
              if (item.tabType == 'BIBLE') {
                return (
                  <Tab.Screen
                    name={item.title}
                    key={item.id}
                    initialParams={{
                      tabId: item.id,
                      name: item.title,
                      icons: item.newImg,
                      iconId: item.iconId,
                    }}
                    component={Bible}
                  />
                );
              }
              if (item.tabType == 'MUSIC') {
                return (
                  <Tab.Screen
                    name={item.title}
                    key={item.id}
                    initialParams={{
                      tabId: item.id,
                      name: item.title,
                      icons: item.newImg,
                      iconId: item.iconId,
                    }}
                    component={Welcome}
                  />
                );
              }
              if (item.tabType == 'EVENTS') {
                return (
                  <Tab.Screen
                    name={item.title}
                    key={item.id}
                    initialParams={{
                      tabId: item.id,
                      name: item.title,
                      icons: item.newImg,
                      iconId: item.iconId,
                    }}
                    component={Events}
                  />
                );
              }
              if (item.tabType == 'EBOOK') {
                return (
                  <Tab.Screen
                    name={item.title}
                    key={item.id}
                    initialParams={{
                      tabId: item.id,
                      name: item.title,
                      icons: item.newImg,
                      iconId: item.iconId,
                    }}
                    component={EbookDetail}
                  />
                );
              }

              if (item.tabType == 'GIVING') {
                return (
                  <Tab.Screen
                    options={{
                      headerShown: false,
                      unmountOnBlur: true
                    }}
                    name={item.title}
                    key={item.id}
                    initialParams={{
                      tabId: item.id,
                      name: item.title,
                      icons: item.newImg,
                      iconId: item.iconId,
                    }}
                    component={GivingStackScreen}
                  />
                );
              }
            })}
          </Tab.Navigator>
          :
          null
      }
    </SafeAreaView>
  );
}
