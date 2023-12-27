import React, { useState, useEffect } from 'react';
import {StyleSheet, View, Modal, ActivityIndicator} from 'react-native';
import ThemeConstant, { DynamicThemeConstants } from '../constant/ThemeConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux';


const Loader = (props) => {
  const {mobileTheme: theme } = useSelector((state) => state.brandingReducer.brandingData);
  const {loading, ...attributes} = props;
  const navigation = useNavigation();



  return (
    <Modal
      transparent={true}
      animationType={'none'}
      visible={loading}
      onRequestClose={() => {
        navigation.goBack()
      }}
      >
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator
            animating={true}
            color={props.color?props.color:'gray'} _
            size="large"
            style={styles.activityIndicator}
          />
        </View>
      </View>
    </Modal>
  );
};

export default Loader;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
  },
  activityIndicatorWrapper: {
    backgroundColor: 'transparent',
    height: 100,
    width: 100,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  activityIndicator: {
    alignItems: 'center',
    height: 80,
  },
});
