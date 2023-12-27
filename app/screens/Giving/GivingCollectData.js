import React, { PureComponent, useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  TextInput,
  StatusBar,
  FlatList,
  Platform,
  useWindowDimensions,
  Linking,
  Image
} from 'react-native';
import ThemeConstant from '../../constant/ThemeConstant';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomButton from '../../components/CustomButton';
import { moderateScale, moderateVerticalScale, scale, } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { SET_ALERT } from '../../store/actions/types';
import FastImage from 'react-native-fast-image';
import * as APIs from '../../constant/APIs';

const LINK = 'https://testdev1.nowcast.cc/giving';
let frequency = [
  {
    title: 'One-Time',
  },
  {
    title: 'Weekly',
  },
  {
    title: 'Monthly',
  },
  {
    title: 'Annually',
  },
];

const GivingCollectData = ({ navigation, route }) => {
  const dispatch = useDispatch()
  const fromItem = route.params?.fromItem;
  const mediaItemId = route.params?.mediaItemId;
  const { brandColor, shortAppTitle: appName, mobileTheme: theme, givingUrl, givingAppearanceArtworkId } = useSelector((state) => state.brandingReducer.brandingData);

  const [amount, setAmount] = useState(0);
  const [amountColor, setAmountColor] = useState(false);
  const [isSelectedTitle, setIsSelectedTitle] = useState('One-Time');

  const moveNextBtn = (fromItem, mediaItemId) => {
    if (amount == '' || amount < 1) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Amount should be atleast $1',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
    } else {
      return navigation.navigate('CardForm', {
        amount: amount,
        fromItem: fromItem == true ? true : false,
        mediaItemId: mediaItemId
      });
    }
  };

  const handleInputChange = (text) => {
    if (/^[0-9]*$/.test(text)) {
      setAmount(text);
      setAmountColor(true)
    }
  };

  const goToSafari = () => {
    if (givingUrl == null || givingUrl == undefined) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: "Giving is not enabled.",
            showConfirmButton: true,
            confirmText: 'Ok',
            onConfirmPressed: async () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            }
          }

        }
      }
      )
    } else {
      Linking.openURL(givingUrl)
    }
  };

  return (
    <>
      {
        Platform.OS == 'android' ?
          <KeyboardAwareScrollView style={{ flex: 1, backgroundColor: theme == 'DARK' ? '#000' : '#fff' }}>
            <View style={[styles.container, { backgroundColor: theme == 'DARK' ? '#000' : '#fff' }]}>
              <StatusBar
                translucent={false}
                backgroundColor={brandColor} />
              <View style={{ marginTop: moderateVerticalScale(60) }}>
                <Text
                  style={{
                    fontSize: scale(28),
                    textAlign: 'center',
                    fontFamily: ThemeConstant.FONT_FAMILY,
                    fontWeight: 'bold',
                    marginBottom: moderateVerticalScale(20),
                    color: theme == 'DARK' ? '#fff' : '#000'
                  }}
                >
                  {appName}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: moderateVerticalScale(100),
                }}
              >
                <Text style={[styles.superscript, { color: theme == 'DARK' ? '#fff' : '#000' }]}>$</Text>
                <TextInput
                  style={{
                    ...styles.amount,
                    opacity: amountColor ? 1.0 : 0.8,
                    color: theme == 'DARK' ? '#fff' : '#000'
                  }}
                  value={amount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={'gray'}
                  onChangeText={(text) => {
                    handleInputChange(text);
                  }}
                />
              </View>
              {false ? (
                <View>
                  <Text
                    style={{ fontSize: 15, opacity: 0.5, marginBottom: moderateVerticalScale(5) }}
                  >
                    Frequency
                  </Text>
                  <View style={styles.frequencyPlan}>
                    <FlatList
                      horizontal={true}
                      scrollEnabled={true}
                      showsHorizontalScrollIndicator={false}
                      data={frequency}
                      keyExtractor={(item) => item.title}
                      renderItem={({ item, index, separators }) => (
                        <TouchableOpacity
                          key={item.title}
                          activeOpacity={
                            isSelectedTitle === item.title ? 0.5 : 1
                          }
                        >
                          <View
                            style={{
                              paddingHorizontal: moderateScale(20),
                              borderRadius: scale(35),
                              paddingVertical: moderateScale(10),
                              borderWidth:
                                item.title == isSelectedTitle
                                  ? scale(1)
                                  : null,
                              borderColor:
                                item.title == isSelectedTitle
                                  ? '#448ee4'
                                  : null,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: scale(18),
                                fontFamily: ThemeConstant.FONT_FAMILY,
                                color:
                                  item.title == isSelectedTitle
                                    ? '#448ee4'
                                    : 'gray',
                              }}
                            >
                              {item.title}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              ) : null}

              {/* button component */}
              <View style={{ width: '100%', paddingHorizontal: moderateScale(24) }}>
                <CustomButton
                  butttonText={'Next'}
                  onPress={() => {
                    moveNextBtn(fromItem, mediaItemId);
                    setTimeout(() => {
                      setAmount('')
                    }, 1000);
                  }}
                  inputStyle={{
                    backgroundColor: brandColor,
                    borderRadius: scale(24),
                    marginTop: moderateVerticalScale(150),
                  }}
                />
              </View>
            </View>
          </KeyboardAwareScrollView>
          :
          <View style={{ flex: 1, justifyContent: 'center' }}>
            {/* BACKGROUND BLUR IMAGE AND DARK */}
            <View style={styles.backgroundContainer}>
              {
                givingAppearanceArtworkId ?
                  <Image
                    source={{ uri: `${APIs.IMAGE_LOAD_URL}/${givingAppearanceArtworkId}` }}
                    style={{
                      flex: 1,
                      backgroundColor: ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR

                    }}
                    blurRadius={3}
                  />
                  :
                  <Image
                    source={require('../../assets/DEFAULT_SQ.png')}
                    style={{
                      flex: 1,
                      backgroundColor: ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR

                    }}
                    blurRadius={3}
                  />

              }

            </View>

            {/* BACKGROUND OVERLAY */}
            <View style={styles.backgroundOverlay} />

            {/* CONTAINS IMAGE TITLE AND OTHER INFO */}
            <TouchableOpacity activeOpacity={0.8} onPress={goToSafari}>
              <View style={styles.mainContainer}>
                <View style={styles.imageContainer}>
                  {
                    givingAppearanceArtworkId ?
                      <FastImage
                        source={{ uri: `${APIs.IMAGE_LOAD_URL}/${givingAppearanceArtworkId}` }}
                        style={styles.img}
                        resizeMode={FastImage.resizeMode.contain}
                      />
                      :
                      <FastImage
                        source={require('../../assets/DEFAULT_SQ.png')}
                        style={styles.img}
                        resizeMode={FastImage.resizeMode.contain}
                      />
                  }
                </View>
                <Text style={styles.artist}>{'Click here to Donate'}</Text>
              </View>
            </TouchableOpacity>
            {goToSafari()}
          </View>
      }
    </>

  );
}
export default GivingCollectData;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instruction: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  token: {
    height: 20,
  },
  amount: {
    borderBottomWidth: 2,
    borderBottomColor: 'gray',
    paddingHorizontal: '5%',
    fontSize: 90,
    paddingTop: -40,
    paddingVertical: -12,
  },
  superscript: {
    fontSize: 25,
    // color: "#656565",
    color: 'black',
    fontWeight: 'bold',
    left: 20,
    alignItems: 'center',
    marginVertical: 20,
  },
  frequencyPlan: {
    width: '95%',
    borderColor: 'gray',
    borderWidth: scale(1),
    borderRadius: scale(35),
    overflow: 'hidden',
  },
  btn: {
    backgroundColor: '#2c6fbb',
    paddingHorizontal: 138,
    paddingVertical: 8,
    borderRadius: 23,
  },
  //STYLE FOR BACKGROUD_
  backgroundContainer: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  mainContainer: {
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  imageContainer: {
    elevation: 10,
    width: '100%',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  img: {
    aspectRatio: 1 / 1,
    borderRadius: 10,
    width: '100%',
  },
  title: {
    fontSize: 16,
    alignSelf: 'center',
    color: '#fff',
  },
  artist: {
    fontSize: scale(16),
    alignSelf: 'center',
    justifyContent: 'center',
    color: '#c0c0c0',
    fontWeight: 'bold'
  },

});
