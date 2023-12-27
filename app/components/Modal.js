import React from 'react';
import {StyleSheet, View, Text, Button} from 'react-native';
import RNModal from 'react-native-modal';
import {moderateScale, moderateVerticalScale, scale} from 'react-native-size-matters';
import { useSelector } from 'react-redux';
export const Modal = ({isVisible = false, children,onBackButtonPress, ...props}) => {
  return (
    <RNModal
      isVisible={isVisible}
      animationInTiming={1000}
      animationOutTiming={600}
       backdropOpacity={0}

      onBackButtonPress={onBackButtonPress}
      {...props}>
      {children}
      {/* {title} */}
    </RNModal>
  );
};

const ModalContainer = ({children,...props}) => {
  const { mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
  return (
  <View style={{...styles.container,...props.additionalStyles, backgroundColor:theme=='DARK'? "#ffff":'rgba(26,26,29,1)' }}>{children}</View>
)};

const ModalHeader = ({title}) => (
  <View style={styles.header}>
    <Text numberOfLines={2} style={styles.text}>
      {title}
    </Text>
  </View>
);

const ModalBody = ({children}) => <View style={styles.body}>{children}</View>;

const ModalFooter = ({children}) => (
  <View style={styles.footer}>{children}</View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: scale(10),
    height: moderateVerticalScale(200),
    justifyContent: 'center',

  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical:moderateVerticalScale(5),
    marginBottom:moderateScale(-9),
    // borderColor:'red',
    // borderWidth:1
  },
  text: {
    textAlign: 'center',
    fontSize: scale(14),
    color: '#fff',
  },
  body: {
    justifyContent: 'center',
    paddingHorizontal: 15,
    alignItems: 'center',
    height:"45%",
    // borderColor:'red',
    // borderWidth:1
  },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    flexDirection: 'row',
    height:moderateVerticalScale(90),
    // borderColor:'red',
    // borderWidth:1
  },
});

Modal.Header = ModalHeader;
Modal.Container = ModalContainer;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
