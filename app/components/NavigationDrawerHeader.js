import React from 'react';
import {View, Image, TouchableOpacity,StyleSheet} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'

const NavigationDrawerHeader = ({ navigationProps, color }) => {
  const toggleDrawer = () => {
    navigationProps.toggleDrawer();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleDrawer}>

        <MaterialIcon name="menu" color={color != undefined ? color : '#fff'} style={styles.imageStyle} size={26} />

      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  imageStyle: { width: 28, height: 28, marginLeft: 8, },
})
export default NavigationDrawerHeader;
