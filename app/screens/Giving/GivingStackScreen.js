import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { View } from 'react-native';
import GivingCollectData from './GivingCollectData'
import NavigationDrawerHeader from '../../components/NavigationDrawerHeader';
import ThemeConstant from '../../constant/ThemeConstant'
import { useSelector } from 'react-redux';


const GivingStack = createStackNavigator()

export default function GivingStackScreen({ navigation }) {
  const { brandColor, mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme == 'DARK' ? '#000' : '#fff' }}>
      <GivingStack.Navigator screenOptions={{ headerShown: false }}>
        <GivingStack.Screen
          name="GivingCollectData"
          component={GivingCollectData}
          options={({ navigation, route }) => ({
            title: "GIVING", //Set Header Title
            headerLeft: () => (
              <NavigationDrawerHeader navigationProps={navigation} />
            ),
            headerStyle: {
              backgroundColor: brandColor, //Set Header color
            },

            headerTintColor: ThemeConstant.TEXT_COLOR_WHITE, //Set Header text color
          })}
        />
      </GivingStack.Navigator>
    </View>
  );
}
