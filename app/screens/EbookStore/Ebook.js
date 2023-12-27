import React, { useRef, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  TextInput,
  StatusBar,
} from 'react-native';
import Pdf from 'react-native-pdf';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
var topBarIsHidden = true;
var bottomBarIsHidden = true;

export default Ebook = ({ navigation, route }) => {

  const [currentPageNo, setCurrentPageNo] = useState('');
  const [totalNoOfPages, setTotalNoOfPages] = useState('');
  const [continousPageView, setContinousPageView] = useState(false);
  const [changeViewModeIcon, setChangeViewModeIcon] = useState('files-o');
  const [modalVisible, setmodalVisible] = useState(false);
  const [PageNumber, setPageNumber] = useState(1);
  const [bounceValue, setBounceValue] = useState(new Animated.Value(0));
  const [bottomBounceValue, setBottomBounceValue] = useState(new Animated.Value(0));
  const pdfRef = useRef()

  const brandingData = useSelector((state) => state.brandingReducer);
  const {
    brandColor,
  } = brandingData.brandingData;

  const _toggleSubview = (values) => {
    var toValue = -150;
    if (topBarIsHidden) {
      toValue = 0;
    }
    Animated.spring(values, {
      toValue: toValue,
      velocity: 3,
      tension: 2,
      friction: 8,
    }).start();
    topBarIsHidden = !topBarIsHidden;
    _toggleSubviewBottom(bottomBounceValue);
  };
  const _toggleSubviewBottom = values => {
    var toValue = 100;
    if (bottomBarIsHidden) {
      toValue = 0;
    }
    Animated.spring(values, {
      toValue: toValue,
      velocity: 3,
      tension: 2,
      friction: 8,
    }).start();
    bottomBarIsHidden = !bottomBarIsHidden;
  };
  const changeViewMode = (page) => {
    console.log('code is here inside changeViewMode');

    if (!continousPageView) {
      if (currentPageNo == '') {
        setContinousPageView(true);
        setChangeViewModeIcon('file-o');
      } else {
        setContinousPageView(true);
        setChangeViewModeIcon('file-o');
        pdfRef.current.setPage(parseInt(currentPageNo));
      }
    }
    else {
      if (currentPageNo == '') {
        setContinousPageView(false);
        setChangeViewModeIcon('files-o');
      } else {
        setContinousPageView(false);
        setChangeViewModeIcon('files-o');
        pdfRef.current.setPage(parseInt(currentPageNo));
      }
    }
  };
  const setModalVisible = (visible) => {
    setmodalVisible(visible);
  }

  const handleInputChange = (val) => {
    if (/^[0-9]*$/.test(val)) {
      setPageNumber(val);
    }
    else {
      setPageNumber(val.split('.').join(''))
    }
  };
  // ~~~~~~~~~~~~~~~~~~~~
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: brandColor
      }}>

      <View
        style={{
          flex: 1,
          backgroundColor: '#fff'
        }}
      >
        <StatusBar animated={true} backgroundColor={brandColor} />
        {/* ~~~~~TOP BAR START~~~~~ */}
        <Animated.View
          style={{
            zIndex: 10,
            position: 'absolute',
            backgroundColor: brandColor,
            // backgroundColor: '#1e92b2',
            height: moderateScale(85),
            width: '100%',
            useNativeDriver: true,
            transform: [{ translateY: bounceValue }],
          }}
        >
          <View style={{
            width: "100%",
            flexDirection: 'row',
            marginLeft: moderateScale(15),
            marginTop: moderateScale(2)
          }}>
            {/* ~~~~~BACK BUTTON~~~~~ */}
            <LinearGradient
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              colors={['white', 'white']}
              style={{
                height: 35,
                width: 35,
                zIndex: 10,
                borderRadius: 10,
                borderColor: '#fff',
                marginRight: 15,
                justifyContent: 'center',
              }}
            >
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => navigation.goBack()}
              >
                <FontAwesome name="chevron-left" size={20} color={brandColor} />
              </TouchableOpacity>
            </LinearGradient>
            {/* ~~~~~~~~~~~~~END~~~~~~~~~~~~~~~~~ */}

            {/* ~~~~~CHANGE VIEW MODE~~~~~ */}
            <LinearGradient
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              colors={['white', 'white']}
              style={{
                height: 35,
                marginRight: 15,
                width: 35,
                zIndex: 10,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TouchableOpacity onPress={changeViewMode}>
                <FontAwesome
                  name={changeViewModeIcon}
                  size={20}
                  color={brandColor}
                />
              </TouchableOpacity>
            </LinearGradient>
            {/* ~~~~~~~~~~~~~END~~~~~~~~~~~~~~~~~ */}

            {/* ~~~~CURRENT PAGE NUMBER~~~~~ */}
            <LinearGradient
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              colors={['white', 'white']}
              style={{
                height: 35,
                width: 35,
                zIndex: 10,
                borderRadius: 10,
              }}
            >
              <TouchableOpacity
                style={{
                  height: 35,
                  width: 35,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setPageNumber(parseInt(currentPageNo, 10))
                  setModalVisible(!modalVisible);
                }}
              >
                <Text style={{ color: brandColor, fontWeight: 'bold' }}>
                  {currentPageNo}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
          {/* ~~~~~~~~~~~~~END~~~~~~~~~~~~~~~~~ */}
          <View style={{ marginTop: 5, marginLeft: moderateScale(16) }}>
            <Text numberOfLines={1} style={{ color: '#fff', fontSize: moderateScale(16), fontWeight: 'bold' }}>{route?.params?.ebookTitle}</Text>
            <Text numberOfLines={1} style={{ color: '#fff', fontSize: moderateScale(13) }}>{route?.params?.ebookSubtitle}</Text>
          </View>
        </Animated.View>
        {/* ~~~~~TOP BAR END~~~~~ */}


        <Pdf
          trustAllCerts={false}
          horizontal={true}
          source={{ uri: route?.params?.pdfPath }}
          ref={pdfRef}
          onLoadComplete={(numberOfPages, filePath) => {

            setTotalNoOfPages(`${numberOfPages}`.toString());
            console.log(`number of pages: ${numberOfPages}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            setCurrentPageNo(`${page}`.toString());
            console.log(`current page: ${page}`);
            setPageNumber(currentPageNo);
          }}
          onError={(error) => {
            console.log(error);
          }}
          onPressLink={(uri) => {
            console.log(`Link presse: ${uri}`);
          }}
          onPageSingleTap={() => {
            _toggleSubview(bounceValue);
          }}
          enablePaging={continousPageView}
          enableAnnotationRendering={true}
          style={{
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
          }} />
        {/* ~~~~~POP UP MODAL~~~~~ */}
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
                //   height: 300,
                paddingVertical: 15,
                borderRadius: 10,
                paddingHorizontal: 15,
              }}
            >
              <Text
                style={{
                  color: brandColor,
                  fontWeight: 'bold',
                  fontSize: 20,
                }}
              >
                Go to Page
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 15,
                  justifyContent: 'space-evenly',
                  alignItems: "center"
                }}
              >
                <View
                  style={{
                    height: 40,
                    width: '70%',
                    paddingLeft: 10,
                    paddingRight: 10,
                    backgroundColor: '#e1e1e1',
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <FontAwesome name="search" />
                  <TextInput
                    keyboardType="numeric"
                    placeholder="Type page number..."
                    placeholderTextColor="black"
                    value={PageNumber}
                    onChangeText={(val) => {
                      handleInputChange(val);
                    }}
                    style={{
                      opacity: 0.7,
                      marginLeft: 5,
                      width: '100%',
                      backgroundColor: 'transparent',
                    }}
                  />
                </View>
                <Text style={{ fontWeight: 'bold', marginLeft: 15 }}>
                  (1 - {totalNoOfPages})
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 15,
                  justifyContent: 'flex-end',
                }}
              >
                <TouchableOpacity
                  style={{
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
                  <Text style={{ color: brandColor, fontWeight: 'bold' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <LinearGradient
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 0 }}
                  colors={[brandColor, brandColor]}
                  style={{
                    width: moderateScale(70),
                    height: moderateScale(32),
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 15,
                    marginLeft: 15,
                    paddingVertical: 5,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      width: 70,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={(val) => {
                      if (PageNumber == '' || PageNumber > totalNoOfPages) {
                        setmodalVisible(!modalVisible);
                      }
                      else {
                        pdfRef.current.setPage(
                          parseInt(PageNumber, 10)
                        )
                        setModalVisible(!modalVisible);
                      }
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                      Go
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </View>
        </Modal>
        {/* ~~~~~END~~~~~ */}
      </View>
    </SafeAreaView>
  );
}







