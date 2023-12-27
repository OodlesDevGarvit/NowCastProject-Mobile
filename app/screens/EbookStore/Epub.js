import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Modal,
  TextInput,
  Dimensions,
  Text,
  useWindowDimensions,
  StatusBar,
  StyleSheet,
  Switch,
  Platform,
  FlatList,
  BackHandler
} from 'react-native';

import { Reader, ReaderProvider, useReader } from '@epubjs-react-native/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFileSystem } from '@epubjs-react-native/file-system';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useIsFocused } from '@react-navigation/native';
import OptionIcon from 'react-native-vector-icons/SimpleLineIcons'
import { useSelector, useDispatch } from 'react-redux';
import { moderateScale } from 'react-native-size-matters';
import { light, dark, sepia } from '../../theme';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SelectDropdown from 'react-native-select-dropdown';
import Slider from '@react-native-community/slider';
// import Orientation from 'react-native-orientation';
import Orientation from 'react-native-orientation-locker';

import Share from 'react-native-share';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { SET_EPUB_THEME, SET_EPUB_FONTFACE, SET_EPUB_FONTSIZE, RESET_EPUB } from '../../store/actions/types';
// import base64 from './base64';


const AllThemes = ['light', 'dark', 'sepia']

// fontfaces for only android
const FontFaces = ['monospace', 'serif', 'sans-serif-medium']

// fontface for only ios
const FontFaces2 = ['monospace', 'serif', 'Avenir-Oblique', 'Arial', 'AlNile-Bold']

const FontFace = Platform.select({
  ios: FontFaces2,
  android: FontFaces
})


const Inner = ({ route, navigation, path, title, ebookItemId, isEnabled, setIsEnabled, toggleSwitch }) => {
  const {
    search,
    progress,
    goNext,
    goPrevious,
    isLoading,
    goToLocation,
    changeTheme,
    theme,
    totalLocations,
    changeFontSize,
    changeFontFamily,
    getLocations,
    getCurrentLocation,
    atStart,
    atEnd,
    searchResults,
  } = useReader();
  const dispatch = useDispatch();
  const { width, height } = useWindowDimensions();

  const [bounceValue, setBounceValue] = useState(new Animated.Value(0));
  const [bottomBounceValue, setBottomBounceValue] = useState(new Animated.Value(0));
  const [pageNumber, setPageNumber] = useState(0)
  const [modalVisible, setmodalVisible] = useState(false);
  const [settingModalVisible, setSettingModalVisible] = useState(false);
  const [menuModal, setMenuModal] = useState(false);
  const [searchModal, setSearchModal] = useState(false);
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [term, setTerm] = useState('')
  const [isEnabled2, setIsEnabled2] = useState(false);
  const [chapters, setChapters] = useState([]);
  const toggleSwitch2 = () => setIsEnabled2(previousState => !previousState);
  const [barIsHidden, setBarIsHidden] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [slideCompletionValue, setSlideCompletionValue] = useState(0);
  const [sliderProgress, setSliderProgress] = useState(0)



  const brandingData = useSelector((state) => state.brandingReducer);
  const {
    brandColor,
    subdomain: subDomain,
  } = brandingData.brandingData;
  const { fontFace, colorMode, fontSize } = useSelector((state) => state.epubReducer);

  //  //on hardware button press -
  //  useEffect(() => {
  //   BackHandler.addEventListener('hardwareBackPress', _backHandler);
  //   return () => {
  //     BackHandler.removeEventListener('hardwareBackPress', _backHandler);
  //   };
  // }, []);

  // function _backHandler() {
  //   navigation.goBack();
  //   return true;
  // }


  //TOP BAR CONTROLS------------
  const _toggleSubview = useCallback(
    (values) => {
      var toValue = -150;
      if (barIsHidden) {
        toValue = 0;
      }
      Animated.timing(values, {
        toValue: toValue,
        duration: 1,
        useNativeDriver: true
      }).start();
      setBarIsHidden(!barIsHidden);
    },
    [barIsHidden],
  )

  const _toggleSubviewBottom = useCallback(
    (values) => {
      var toValue = 100;
      if (barIsHidden) {
        toValue = 0;
      }
      Animated.timing(values, {
        toValue: toValue,
        duration: 1,
        useNativeDriver: true
      }).start();
      setBarIsHidden(!barIsHidden);
    },
    [barIsHidden],
  )
  // TOP BAR CONTROLS ENDS----------

  useEffect(() => {
    let value = colorMode == 'light' || colorMode == '' ? light : (colorMode == 'dark' ? dark : sepia)
    changeTheme(value)
  })
  // control orientaion------
  useEffect(() => {
    return () => {
      Orientation.lockToPortrait();
    }
  }, [navigation]);

  //FUNCTION TO SHARE BOOK-------
  // const shareBook = () => {
  //   //called on press of share button---------------------------------
  //   const shareOptions = {
  //     //   message: 'Share your notes',
  //     message: `${title}\nhttps://${subDomain}/program?id=${ebookItemId}`,
  //   };

  //   try {
  //     const ShareResponse = Share.open(shareOptions);
  //     // console.log('share response is  :>> ', ShareResponse);
  //   } catch (error) {
  //     // console.log('Error =====>', error);
  //   }
  // };
  //FUNCTION TO SHARE BOOK END-------

  const setModalVisible = (visible) => {
    setmodalVisible(visible);
  }

  return (
    // PORTRAIT VIEW START-----------------------------
    <View style={{
      flex: 1,
      backgroundColor: colorMode == 'light' ? '#fff' : (colorMode == 'dark' ? '#333' : (colorMode == 'sepia' ? '#e8dcb8' : '#fff')),
    }}>


      {/* VIEW ON CLICK NEXT AND PREVIOUS PAGE START------------------------- */}
      {barIsHidden == true &&
        <>
          <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 100, zIndex: 1 }}>
            <TouchableOpacity style={{ width: '100%', height: '100%' }} onPress={() => { goPrevious(); }} />
          </View>
          <View style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 100, zIndex: 1 }}>
            <TouchableOpacity style={{ width: '100%', height: '100%' }} onPress={() => { goNext(); }} />
          </View>
        </>
      }

      {/* VIEW ON CLICK NEXT AND PREVIOUS PAGE END------------------------- */}


      {/* ~~~~~TOP ANIMATED VIEW START~~~~~------------------------- */}
      <Animated.View
        style={{
          zIndex: 10,
          position: 'absolute',
          backgroundColor: brandColor,
          // backgroundColor: '#1e92b2',
          height: moderateScale(70),
          width: '100%',
          useNativeDriver: true,
          transform: [{ translateY: bounceValue }],
          // borderWidth:1,borderColor:"yellow",
        }}
      >
        {/* UPPER CONTROLS VIEW START ------------------------- */}
        <View style={{
          // borderWidth: 1, borderColor: "yellow",
          // height:moderateScale(40),
          width: "100%",
          justifyContent: "space-between",
          flexDirection: 'row',
          marginTop: moderateScale(5),
        }}>

          {/* BACK ARROW BUTTON------------------------- */}
          {/* <View> */}
          <View
            style={{
              // borderWidth: 1, borderColor: "yellow",
              height: moderateScale(30),
              width: moderateScale(50),
              zIndex: 10,
              // marginRight: 15,
              justifyContent: 'center',
            }}
          >
            <TouchableOpacity
              style={{ marginLeft: 15 }}
              onPress={() => { navigation.goBack(); SystemNavigationBar.navigationShow(); StatusBar.setHidden(false) }}
            >
              <AntDesign name="arrowleft" size={25} color="white" />
            </TouchableOpacity>
          </View>
          {/* </View> */}
          {/* BACK ARROW BUTTON END------------------------- */}
          <View style={{
            flex: 1,
            height: moderateScale(30),
            marginTop: Platform.OS == 'android' ? moderateScale(2) : moderateScale(6),
            paddingRight: moderateScale(2)
          }}>
            <Text numberOfLines={1} style={{ fontSize: moderateScale(18), fontWeight: 'bold', marginLeft: moderateScale(18), color: '#fff' }}>{title}</Text>
          </View>
          {/* HEADER OPTIONS BUTTONS START------------------------- */}
          <View style={{
            flexDirection: "row",
            height: moderateScale(30),
          }}>

            {/* SEARCH BUTTON------------------------- */}
            {/* <View
            style={{
              height: 40,
              width: 40,
              zIndex: 10,
              borderRadius: 10,
              // marginRight: moderateScale(5),
              justifyContent: 'center',
            }}
          >
            <TouchableOpacity
              style={{ marginLeft: 10 }}
              onPress={() => setSearchModal(true)}
            >
              <Ionicons name="search-sharp" size={23} color="white" />
            </TouchableOpacity>
          </View> */}
            {/* SEARCH BUTTON END-------------------------*/}

            {/* MENU BUTTOM FOR ALL CHAPTERS------------------------- */}
            <View
              style={{
                zIndex: 10,
                borderRadius: 10,
                marginRight: moderateScale(5),
                justifyContent: 'center',
              }}
            >
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => setMenuModal(true)}
              >
                <MaterialIcons name="menu" size={25} color="white" />
              </TouchableOpacity>
            </View>
            {/* MENU BUTTOM FOR ALL CHAPTERS END-------------------------*/}


            {/* ~~~~~Setting button~~~~~ -------------------------*/}
            <View
              style={{
                zIndex: 10,
                borderRadius: 10,
                marginRight: moderateScale(7),
                justifyContent: 'center',
              }}
            >
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => setSettingModalVisible(true)}
              >
                <MaterialIcons
                  name={'settings'}
                  size={25}
                  color="white"
                />
              </TouchableOpacity>
            </View>
            {/* SETTING BUTTON END------------------------- */}


            {/* OPTIONS BUTTON START------------------------- */}
            {/* <View
              style={{
                // height: 40,
                // width: 40,
                zIndex: 10,
                borderRadius: 10,
                marginRight: moderateScale(8),
                justifyContent: 'center',
              }}
            >
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => setOptionModalVisible(true)}
              >
                <OptionIcon
                  name="options-vertical"
                  size={20}
                  color={'#fff'}
                />
              </TouchableOpacity>
            </View> */}
            {/* OPTIONS MODAL END------------------------- */}

          </View>
          {/* HEADER OPTIONS BUTTONS END------------------------- */}
        </View>
        {/* UPPER CONTROLS VIEW START END-------------------------  */}
      </Animated.View>
      {/* ~~~~~TOP ANIMATES VIEW END~~~~~------------------------- */}


      {/* BOTTOM ANIMATED VIEW START-------------------------T */}
      <Animated.View
        style={{
          zIndex: 10,
          bottom: Platform.OS === 'ios' ? moderateScale(-25) : moderateScale(-10),
          // flexDirection: 'row',
          position: 'absolute',
          backgroundColor: brandColor,
          // backgroundColor: '#1e92b2',
          height: moderateScale(75),
          marginBottom: Platform.OS === 'ios' ? moderateScale(15) : 0,
          width: '100%',
          useNativeDriver: true,
          transform: [{ translateY: bottomBounceValue }],
        }}
      >
        <View
          style={{
            height: '45%',
            width: '100%',
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <View style={{
            justifyContent: "center",
            alignItems: "center",
            width: '30%',
          }}>
            {pageNumber <= 0 ? null
              :
              <Text style={styles.pageNumberText}>{pageNumber} of {totalLocations} </Text>
            }
          </View>
          {/* <View style={{ marginLeft: moderateScale(180) }}>
            <TouchableOpacity onPress={() => {
              console.log('orientation button pressed from portrait view ');
              if (isLandscape == false) {
                if (Platform.OS == 'ios') {
                  Orientation.lockToLandscapeRight();
                  setIsLandscape(true)
                } else {
                  Orientation.lockToLandscape();
                  setIsLandscape(true)
                }
              }
              else {
                Orientation.lockToPortrait();
                setIsLandscape(false)
              }
            }}>
              <MaterialCommunityIcons name={'phone-rotate-landscape'} size={20} color={'#fff'}
              />
            </TouchableOpacity>
          </View> */}
        </View>
        <View style={{ alignItems: "center" }}>
          <Slider
            style={{ width: Platform.OS == 'ios' ? '85%' : '95%', height: moderateScale(19) }}
            minimumValue={0}
            maximumValue={totalLocations}
            disabled={true}
            onValueChange={(value) => { setPageNumber(parseInt(value)) }}
            onSlidingComplete={sliderValue => {
              setSlideCompletionValue(sliderValue);
              setPageNumber(parseInt(sliderValue))
              goToLocation(pageNumber)
            }}
            tapToSeek={true}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="#fff"
            thumbTintColor='#fff'
            value={pageNumber}
          />
        </View>
      </Animated.View>
      {/* BOTTOM ANIMATED VIEW END------------------------- */}


      {/* READER VIEW START------------------------- */}

      <View style={{
        flex: 1,
        marginTop: atStart == true ? Platform.OS == 'ios' ? moderateScale(20) : moderateScale(40) : isEnabled2 ? moderateScale(100) : moderateScale(20),
        alignItems: 'center',
      }}>
        <Reader
          src={path}
          // width={moderateScale(345)}
          height={isEnabled2 ? moderateScale(500) : Platform.OS === 'ios' ? height - moderateScale(100) : height - moderateScale(isEnabled ? 5 : 40)}
          width={Dimensions.get('window').width * .9}
          renderOpeningBookComponent={() => {
            return (
              <View></View>
            )
          }}
          fileSystem={useFileSystem}
          onBeginning={() => {
            changeFontFamily(fontFace)
            console.log('font family is on beginning', fontFace);

            changeFontSize(`${fontSize}px`);
            console.log('on begiining called and font size is', fontSize);
          }}
          enableSwipe={true}
          onSwipeLeft={() => {
            if (barIsHidden == false) {
              _toggleSubview(bounceValue);
              _toggleSubviewBottom(bottomBounceValue)
            } else {
              goNext();
            }
          }}
          onSwipeRight={() => {
            if (barIsHidden == false) {
              _toggleSubview(bounceValue);
              _toggleSubviewBottom(bottomBounceValue)
            } else {
              goPrevious();
            }

            // setSliderValue(pageNumber);
            // setSliderProgress(pageNumber)
          }}
          enableSelection={true}

          onNavigationLoaded={(toc) => {
            console.log('toc is >>>', toc);
            setChapters(toc.toc)

          }}
          onLocationChange={(totalLocations, currentLocation, progress, cfi) => {
            setPageNumber(currentLocation.start.location);
          }}

          onPress={() => {
            _toggleSubview(bounceValue);
            _toggleSubviewBottom(bottomBounceValue)
          }}
        />
      </View>

      {/* READER VIEW END------------------------- */}


      {/* MODAL  SETTING  START------------------------- */}
      <View>
        <Modal
          animationType='none'
          transparent={true}
          visible={settingModalVisible}
          onRequestClose={() => {
            setSettingModalVisible(!settingModalVisible);
          }}
        >
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setSettingModalVisible(false)}>

            <View
              style={{
                height: Platform.OS === 'ios' ? moderateScale(350) : moderateScale(480),
                width: moderateScale(268),
                left: moderateScale(89),
                borderRadius: moderateScale(5),
                marginTop: Platform.OS === 'ios' ? moderateScale(80) : moderateScale(35),
                backgroundColor: '#303030'

              }}
            >
              <TouchableOpacity activeOpacity={1}>
                <Text style={{ textAlign: 'center', color: '#1e92b2', fontWeight: 'bold', marginTop: moderateScale(9), fontSize: moderateScale(14) }}>SETTINGS</Text>
                <Text style={{ textAlign: 'center', color: '#1e92b2', fontWeight: 'bold', marginBottom: moderateScale(8), fontSize: moderateScale(14) }}>EPUB BOOK</Text>
                {/* color:#1e92b2 */}

                {/* THEME SETTING START */}
                <View
                  style={{
                    ...styles.settingModalButtonView
                  }}>
                  <Text style={{ ...styles.topTextSettingModal }}>  COLOR MODE  </Text>
                  <SelectDropdown
                    data={AllThemes}
                    onSelect={(selectedItem, index) => {
                      let value = selectedItem == 'light' ? light : (selectedItem == 'dark' ? dark : sepia)
                      dispatch({ type: SET_EPUB_THEME, payload: selectedItem })
                      // setThemes(selectedItem)
                      changeTheme(value);
                    }}
                    defaultButtonText={colorMode == 'light' || colorMode == '' ? 'Light' : (colorMode == 'dark' ? 'Dark' : 'Sepia')}
                    buttonTextAfterSelection={() => {
                      return colorMode == 'light' || colorMode == '' ? 'Light' : (colorMode == 'dark' ? 'Dark' : 'Sepia');
                    }}
                    rowTextForSelection={(item, index) => {
                      return item;
                    }}
                    buttonStyle={styles.dropdown1BtnStyle}
                    buttonTextStyle={{
                      ...styles.dropdown1BtnTxtStyle,
                      textTransform: 'capitalize',
                    }}
                    renderDropdownIcon={(isOpened) => {
                      return (
                        <FontAwesome
                          name={isOpened ? 'chevron-up' : 'chevron-down'}
                          color={'#ffffff'}
                          size={15}
                        />
                      );
                    }}
                    dropdownIconPosition={'right'}
                    dropdownStyle={{ ...styles.dropdown1DropdownStyle, width: '35%', }}
                    rowTextStyle={{
                      ...styles.dropdown1RowTxtStyle,
                      textTransform: 'capitalize',
                    }}
                    rowStyle={{ ...styles.dropdown1RowStyle }}
                    selectedRowStyle={{
                      // backgroundColor: '#1e92b2',
                      backgroundColor: colorMode == '' ? '#424242' : brandColor
                    }}
                  />
                </View>
                {/* THEME SETTING  END */}

                {/* FONT FAMILY CHANGE START*/}
                <View
                  style={{
                    ...styles.settingModalButtonView
                  }}>
                  <Text style={{ ...styles.topTextSettingModal }}>  FONT FACE  </Text>
                  <SelectDropdown
                    data={FontFace}
                    onSelect={(selectedItem, index) => {
                      // let value = selectedItem == 'monospace' ? 'monospace' : (selectedItem == 'serif' ? 'serif' : 'sans-serif-medium' )
                      console.log('seleted item for font face is', selectedItem);
                      dispatch({ type: SET_EPUB_FONTFACE, payload: selectedItem })
                      changeFontFamily(selectedItem)
                      // console.log('value when font family is changes',value);

                      console.log('fontface value is after we slect and option from dropdown', fontFace);
                    }}
                    defaultButtonText={fontFace}
                    buttonTextAfterSelection={() => {
                      return fontFace;
                    }}
                    rowTextForSelection={(item, index) => {
                      return item;
                    }}
                    buttonStyle={styles.dropdown1BtnStyle}
                    buttonTextStyle={{
                      ...styles.dropdown1BtnTxtStyle,
                      textTransform: 'capitalize',
                    }}
                    renderDropdownIcon={(isOpened) => {
                      return (
                        <FontAwesome
                          name={isOpened ? 'chevron-up' : 'chevron-down'}
                          color={'#ffffff'}
                          size={15}
                        />
                      );
                    }}
                    dropdownIconPosition={'right'}
                    dropdownStyle={{ ...styles.dropdown1DropdownStyle, width: '37%', }}
                    rowTextStyle={{
                      ...styles.dropdown1RowTxtStyle,
                      textTransform: 'capitalize',
                    }}
                    rowStyle={{ ...styles.dropdown1RowStyle }}
                    selectedRowStyle={{
                      // backgroundColor: '#1e92b2',
                      backgroundColor: brandColor
                    }}
                  />
                </View>
                {/* FONT FAMILY CHANGE END*/}

                {/* FULL SCREEN MODE */}
                {Platform.OS === 'android' &&
                  <View
                    style={{
                      ...styles.settingModalButtonView
                    }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ textAlign: "left", color: "#ffffff", fontSize: moderateScale(15), fontWeight: Platform.OS == 'ios' ? 'normal' : "800" }}>  Full-screen mode </Text>
                      <Switch
                        style={{
                          alignItems: "center", marginRight: Platform.OS == 'ios' ? moderateScale(5) : null,
                          transform: Platform.OS == 'ios' ? [{ scaleX: moderateScale(1, -1) }, {
                            scaleY:
                              moderateScale(1, -1)
                          }] : [{ scaleX: moderateScale(1, 1) }, {
                            scaleY:
                              moderateScale(1, 1)
                          }]
                        }}
                        trackColor={{ false: "#767577", true: '#1e92b2' }}
                        thumbColor={isEnabled ? brandColor : "#fff"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={(isEnabled) => { toggleSwitch(isEnabled) }}
                        value={isEnabled}
                      />
                    </View>
                    {/* <Text style={{ textAlign: "left", color: "#ffffff", fontSize: 13, left: moderateScale(9), marginTop: moderateScale(-4) }} >Hides status bar</Text> */}

                  </View>
                }
                {/* FULL SCREEN MODE  END----*/}


                {/* PAGE MARGIN START--------  */}
                <View
                  style={{
                    ...styles.settingModalButtonView
                  }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ textAlign: "left", color: "#ffffff", fontSize: moderateScale(15), fontWeight: Platform.OS == 'ios' ? 'normal' : "800" }}>  Page margins </Text>
                    <Switch
                      style={{
                        alignItems: "center", marginRight: Platform.OS == 'ios' ? moderateScale(5) : null,
                        transform: Platform.OS == 'ios' ? [{ scaleX: moderateScale(1, -1) }, {
                          scaleY:
                            moderateScale(1, -1)
                        }] : [{ scaleX: moderateScale(1, 1) }, {
                          scaleY:
                            moderateScale(1, 1)
                        }]
                      }}
                      trackColor={{ false: "#767577", true: '#1e92b2' }}
                      thumbColor={isEnabled2 ? brandColor : "#fff"}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={toggleSwitch2}
                      value={isEnabled2}
                    />
                  </View>

                </View>
                {/* PAGE MARGIN ENDS--------- */}

                {/* FONTSIZE SETTING START */}
                <View
                  style={{
                    ...styles.settingModalButtonView
                  }}>
                  <Text style={{ ...styles.topTextSettingModal }}>  FONT SIZE  </Text>

                  <View style={{
                    flexDirection: "row",
                    marginTop: moderateScale(2),
                    marginHorizontal: moderateScale(15),
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <TouchableOpacity
                      onPress={() => {
                        dispatch({ type: SET_EPUB_FONTSIZE, payload: fontSize - 2 })
                        changeFontSize(`${fontSize}px`)
                      }}
                      style={{ ...styles.fontSizeSign }}>
                      <FontAwesome name="minus" size={12} color="white"
                      />
                    </TouchableOpacity>
                    <Text style={{ color: '#ffffff', fontSize: moderateScale(15), fontWeight: "900" }}>{fontSize}</Text>
                    <TouchableOpacity style={{ ...styles.fontSizeSign }}
                      onPress={() => {
                        dispatch({ type: SET_EPUB_FONTSIZE, payload: fontSize + 2 })
                        changeFontSize(`${fontSize}px`)
                      }}
                    >
                      <FontAwesome name="plus" size={12} color="white"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {/* FONTSIZE SETTING END */}


                {/* SCALLING START */}
                {Platform.OS === 'android' &&
                  <View
                    style={{
                      ...styles.settingModalButtonView
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        setmodalVisible(true)
                      }}
                    >
                      <Text style={{ textAlign: "left", color: "#ffffff", fontSize: moderateScale(15), fontWeight: Platform.OS == 'ios' ? 'normal' : "800" }}>  Scaling</Text>
                    </TouchableOpacity>
                  </View>
                }
                {/* SCALLING  END */}
                <TouchableOpacity
                  onPress={() => {
                    dispatch({ type: RESET_EPUB });
                    console.log('reset epub called>>>', fontSize, fontFace, colorMode);
                    changeFontFamily('sans-serif-medium');
                    changeFontSize(`${fontSize}px`)
                    setIsEnabled(false);
                    setIsEnabled2(false);
                    StatusBar.setHidden(false)
                    SystemNavigationBar.navigationShow();
                    setSettingModalVisible(false);
                  }}
                >
                  <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold', marginTop: moderateScale(15), marginBottom: moderateScale(10), fontSize: moderateScale(15) }}>RESET SETTINGS</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

          </TouchableOpacity>
        </Modal>
      </View>

      {/* MODAL  SETTING END------------------------- */}


      {/* MODAL TABLE OF CONTENTS START-------------------------*/}
      <Modal
        animationType="fade"
        visible={menuModal}
        onRequestClose={() => {
          setMenuModal(!menuModal);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
          }}
        >
          {/* BACK ARROW START */}
          <View style={{
            flexDirection: 'row',
            height: Platform.OS == 'ios' ? moderateScale(77) : moderateScale(47),
            backgroundColor: brandColor,
            // backgroundColor: '#1e92b2',
            width: "100%"
          }}>
            {/* <View style={{ marginTop: moderateScale(15), marginLeft: moderateScale(10), flexDirection: 'row', }}> */}
            <View
              style={{
                height: 40,
                width: 40,
                zIndex: 10,
                justifyContent: 'center',
                marginLeft: moderateScale(5),
                marginTop: Platform.OS == 'ios' ? moderateScale(29) : moderateScale(4),
              }}
            >
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => setMenuModal(false)}
              >
                <AntDesign name="arrowleft" size={25} color="white" />
              </TouchableOpacity>
            </View>
            {/* <AntDesign name="arrowleft" size={25} color="white" onPress={() => setMenuModal(false)} /> */}
            <Text style={{
              color: "#ffffff", marginLeft: moderateScale(20),
              fontSize: moderateScale(17), marginTop: Platform.OS == 'ios' ? moderateScale(39) : moderateScale(11),
              fontWeight: "bold",
            }}>
              TABLE OF CONTENTS
            </Text>
            {/* </View> */}
            {/* BACK ARROW END */}
          </View>
          <View style={{ flex: 2, backgroundColor: '#303030', height: '100%' }}>
            <FlatList
              data={chapters}
              keyExtractor={item => item.id}
              contentContainerStyle={{
                paddingBottom: moderateScale(10)
              }}
              renderItem={({ item }) => {
                // const [first, last] = item.href.split('.')
                // console.log('first are>>', first);
                // console.log('last are', last);

                // const [tag, pageNumber] = last.split('p')
                // console.log('pagenumber', pageNumber);

                return (
                  <TouchableOpacity onPress={() => {
                    setMenuModal(false); goToLocation(item.href);
                    //  setSliderValue(pageNumber); setSliderProgress(pageNumber);
                  }}>
                    <View style={{ height: moderateScale(50), borderRadius: 5, backgroundColor: "grey", marginTop: moderateScale(10), marginHorizontal: moderateScale(15), }}>
                      <View style={{ justifyContent: 'center', height: '100%', marginHorizontal: moderateScale(15) }}>
                        <Text numberOfLines={2} style={{ color: '#fff', fontSize: moderateScale(17), }}>{item.label.trim()}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )

              }

              }
            />
          </View>
          {/* BACK ARROW BUTTON END */}
        </View>
      </Modal>
      {/* MODAL TABLE OF CONTENTS END-------------------------   */}


      {/* SEARCH BUTTON MODAL START------------------------- */}
      <Modal
        animationType="fade"
        visible={searchModal}
        onRequestClose={() => {
          setSearchModal(false);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
          }}
        >
          {/* BACK ARROW START */}
          <View style={{
            flexDirection: 'row',
            height: Platform.OS == 'ios' ? moderateScale(100) : moderateScale(50),
            backgroundColor: brandColor,
            // backgroundColor: '#1e92b2',
            width: "100%",
          }}>
            <View
              style={{
                height: 40,
                width: 40,
                zIndex: 10,
                marginRight: 15,
                justifyContent: 'center',
                marginLeft: moderateScale(5),
                marginTop: Platform.OS == 'ios' ? moderateScale(45) : moderateScale(4),
              }}
            >
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => setSearchModal(false)}
              >
                <AntDesign name="arrowleft" size={25} color="white" />
              </TouchableOpacity>
            </View>
            {/* <AntDesign name="arrowleft" size={25} color="white" style={{ marginTop: moderateScale(15), marginLeft: moderateScale(15) }} onPress={() => setSearchModal(false)} /> */}
            <TextInput
              cursorColor={'orange'}
              style={{ height: '100%', width: '50%', marginLeft: 30, fontSize: moderateScale(22), alignItems: "center", color: "#fff" }}
              placeholder='Text search'
              placeholderTextColor={'#fff'}
              onChangeText={(text) => setTerm(text)}
              onSubmitEditing={() => { search(term); }}
            />
          </View>
          {/* BACK ARROW END */}

          <View style={{ flex: 2, backgroundColor: '#303030', height: '100%' }}>
            <FlatList
              data={searchResults}
              renderItem={({ item }) => (
                (term !== ''
                  ?
                  <View style={{ height: 35, borderRadius: 5, backgroundColor: "grey", marginTop: moderateScale(10), marginHorizontal: moderateScale(15) }}>
                    <TouchableOpacity style={{ marginLeft: 10, justifyContent: 'center' }} onPress={() => { setSearchModal(false); goToLocation(item.cfi); setTerm(''); search('') }}>
                      <Text numberOfLines={1} style={{ color: '#fff', fontSize: moderateScale(15) }}>{item.excerpt}</Text>
                    </TouchableOpacity>
                  </View>
                  : null)
              )}
            />
          </View>
        </View>
      </Modal>
      {/* SEARCH BUTTON END------------------------- */}


      {/* OPTIONS MODAL START */}
      {/* <Modal animationType="none" transparent={true} visible={optionModalVisible}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            setOptionModalVisible(false);
          }}
        >
          <View
            style={{
              flex: 1,
            }}
            onPress={() => {
              setOptionModalVisible(false);
            }}
          >
            <View style={styles.Options}>
              <TouchableOpacity
                style={styles.optionContainer}
                onPress={() => {
                  if (Platform.OS == 'ios') {
                    shareBook();
                  } else {
                    shareBook();
                    setOptionModalVisible(false)
                  }

                }}
              >
                <Text style={styles.text}>Share file</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal> */}
      {/* OPTIONS MODAL END */}


      {/* SCALING MODAL START------------------------- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',

          }}
        >
          <View
            style={{
              width: Dimensions.get('window').width * 0.8,
              backgroundColor: '#fff',
              height: moderateScale(165),
              paddingVertical: 15,
              borderRadius: 10,
              paddingHorizontal: 15,
            }}
          >
            <Text style={{ fontSize: moderateScale(17), fontWeight: '800' }}>
              When reading EPUB books you can zoom in on an image with a gesture. Pinch or spread your fingers to zoom.
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 15,
                justifyContent: 'flex-end',
              }}
            >
              <TouchableOpacity
                style={{
                  // borderColor: '#1e92b2',
                  borderColor: brandColor,
                  borderWidth: 2,
                  borderRadius: 15,
                  justifyContent: "center",
                  alignItems: "center",
                  width: moderateScale(70),
                  height: moderateScale(32),
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
              >
                <Text style={{ color: '#000', fontWeight: 'bold' }}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* SCALING MODAL END------------------------- */}

    </View>

    // PORTRAIT VIEW END-------------------------------
    // )


  );
}

const Epub = ({ route, navigation }) => {
  const brandingData = useSelector((state) => state.brandingReducer);
  const isFocused = useIsFocused();
  const {
    brandColor,
  } = brandingData.brandingData;
  const colorMode = useSelector(state => state.epubReducer)
  const [isEnabled, setIsEnabled] = useState(false);


  const toggleSwitch = (value) => {
    console.log('is enable', value);
    if (value) {
      SystemNavigationBar.navigationHide()
      StatusBar.setHidden(true)
    } else {
      SystemNavigationBar.navigationShow()
      StatusBar.setHidden(false)

    }
    setIsEnabled(value)
  }
  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: Platform.OS === 'ios' ? brandColor : colorMode == 'light' ? '#fff' : (colorMode == 'dark' ? '#333' : (colorMode == 'sepia' ? '#e8dcb8' : '#fff'))
    }}>
      <StatusBar backgroundColor={brandColor} />
      <ReaderProvider>
        <Inner route={route} navigation={navigation} path={route?.params?.path} title={route.params?.ebookTitle} subTitle={route.params?.ebookSubtitle}
          ebookItemId={route.params?.ebookItemId}
          isEnabled={isEnabled} setIsEnabled={setIsEnabled}
          toggleSwitch={toggleSwitch}
        />
      </ReaderProvider>
    </SafeAreaView>

  )
}


export default Epub;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  options: {
    width: '80%',
    marginLeft: 25,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 5
  },
  button: {
    borderColor: "black",
    borderWidth: 1,
    padding: 3
  },
  backArrow: {
    position: 'absolute',
    top: 10,
    left: 0,
    width: 40,
    height: 30,
  },

  //select-dropdown-list styles start-------
  dropdown1DropdownStyle: {
    backgroundColor: '#424242',
    left: 150,
    // marginTop: verticalScale(-30),
  },
  dropdown1RowTxtStyle: {
    textAlign: 'left',
    color: "#fff",
    fontSize: moderateScale(16)
  },
  dropdown1BtnStyle: {
    paddingLeft: moderateScale(15),
    width: '99%',
    height: moderateScale(25),
    backgroundColor: "#424242",

  },
  dropdown1BtnTxtStyle: {
    color: '#fff',
    textAlign: 'left',
    fontSize: moderateScale(15)
  },
  dropdown1RowStyle: {
    backgroundColor: '#424242',
    borderBottomColor: '#424242'
  },

  //select-dropdown-list styles end-------

  iconContainer: {
    position: 'absolute',
    right: moderateScale(10),
    zIndex: 2,
  },

  settingModalButtonView: {
    borderWidth: 1,
    borderRadius: moderateScale(5),
    borderColor: "#282828",
    justifyContent: "center",
    marginHorizontal: moderateScale(9),
    backgroundColor: '#424242',
    height: moderateScale(63),
  },

  fontSizeSign: {
    backgroundColor: '#303030',
    borderColor: "#fff",
    borderRadius: 13,
    borderWidth: 2,
    height: moderateScale(18),
    width: moderateScale(18),
    justifyContent: "center",
    alignItems: "center"
  },

  topTextSettingModal: {
    textAlign: "left",
    color: "#9e9e9e",
    fontSize: moderateScale(13),
    fontWeight: "bold"
  },

  pageNumberText: {
    color: '#fff',
    fontSize: moderateScale(17),
    marginTop: moderateScale(5),
    fontWeight: "900"
  },

  // OPTIONS MODAL STYLES START------
  Options: {
    backgroundColor: '#303030',
    alignSelf: 'flex-end',
    width: "35%",
    height: moderateScale(70),
    marginHorizontal: moderateScale(10),
    marginVertical: moderateScale(5),
    marginTop: Platform.OS == 'ios' ? moderateScale(40) : null,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    borderRadius: 3

  },
  optionContainer: {
    flex: 1,
    marginTop: moderateScale(10)
  },
  text: {
    fontSize: moderateScale(16),
    flex: 1,
    color: "#fff",
    padding: 15

  },
  // OPTIONS MODAL STYLES END------

});