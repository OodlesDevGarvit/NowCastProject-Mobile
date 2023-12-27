import React, { Component, useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native'
import {
    moderateScale,
    moderateVerticalScale,
    scale,

} from 'react-native-size-matters';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';
import ThemeConstant from '../constant/ThemeConstant';

export default function Dropdown({
  data,
  value,
  // onSelectSubject
  setSubject,
}) {
  const [showOptions, setShowOptions] = useState(false);
  const brandingData = useSelector((state) => state.brandingReducer);
  const {
    shortAppTitle: appName,
    mobileTheme: theme,
    logoId,
    brandColor,
  } = brandingData.brandingData;

  // const onSelectedSubject = (val)=> {
  //     setShowOptions(false)
  //     onSelectSubject(val)
  // }

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.5}
        style={Styles.chooseOption}
        onPress={() => {
          setShowOptions(!showOptions);
        }}
      >
        <Text>{!!value ? value : `Choose an Option`}</Text>
        <FontAwesome
          style={{
            marginRight: 5,
            transform: [{ rotate: showOptions ? '180deg' : '0deg' }],
          }}
          name={'arrow-down'}
        />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showOptions}
        onRequestClose={() => {
          setShowOptions(false);
        }}
      >
        <View style={Styles.centeredView}>
          {showOptions && (
            <View style={{ ...Styles.modalOption }}>
              {data.map((item, i) => {
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    key={String(i)}
                    onPress={() => {
                      setSubject(item.value);
                      setShowOptions(false);
                    }}
                    style={{
                      ...Styles.item,
                      backgroundColor:
                        item.value == value ? brandColor : 'white',
                      borderBottomWidth: i == data.length - 1 ? 0 : 0.5,
                    }}
                  >
                    <Text>{item.value}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const Styles = StyleSheet.create({
  chooseOption: {
    color: '#000',
    padding: 8,
    borderWidth: scale(1),
    borderRadius: scale(5),
    borderColor: '#dadae8',
    height: moderateScale(40),
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  modalOption: {
    height: '28%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: scale(20),
    overflow: 'hidden',
    position: 'absolute',
    bottom: 10
  },
  centeredView: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#00000099',
    position: 'relative',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: '#f7f8fa',
    borderWidth: 0.5,
  },
});