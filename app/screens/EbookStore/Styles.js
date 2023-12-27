import { StyleSheet } from "react-native";
import { moderateScale, scale,moderateVerticalScale } from "react-native-size-matters";
import ThemeConstant from "../../constant/ThemeConstant";
import { widthtper, heightper } from "../../utils/heightWidthRatio";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    height: heightper(22),
    width: widthtper('100%'),
  },
  bannerImageBackground: {
    width: moderateScale(260),
    aspectRatio: 396/612,
    alignSelf: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    resizeMode: 'contain',
  },
  iconStyle: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 17,
    top: 10,
  },
  iconView: {
    borderWidth: 4,
    width: 59,
    height: 59,
    borderRadius: 59,
    alignSelf: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 25,
    backgroundColor: '#000',
    opacity: 0.8,
    elevation: 5,
  },
  iconViewShare: {
    borderWidth: 2.7,
    borderColor: 'gray',
    width: 36,
    height: 36,
    borderRadius: 36,
    alignSelf: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    left: 0,
    top: 5,
    opacity: 0.5,
  },
  detailsContainer: {
    paddingHorizontal: ThemeConstant.PADDING_EXTRA_LARGE,
  },
  titleTextContainer: {
    marginBottom: ThemeConstant.MARGIN_TINNY - 9,
  },
  titleText: {
    fontSize: ThemeConstant.TEXT_SIZE_EXTRA_lARGE_MEDIUM_1,
    fontWeight: 'bold',
    fontFamily: ThemeConstant.FONT_FAMILY,
  },
  subtitleContainer: {
    marginBottom: ThemeConstant.MARGIN_TINNY - 4,
  },
  subtitleText: {
    fontSize: ThemeConstant.TEXT_SIZE_LARGE,
    letterSpacing: 0,
    marginTop:Platform.OS == 'ios' ?  1 : 0.5,
    fontFamily: ThemeConstant.FONT_FAMILY,
  },
  dateTextContainer: {
    marginBottom: ThemeConstant.MARGIN_GENERIC,
    flexDirection: 'row',
  },
  dateText: {
    fontSize: ThemeConstant.TEXT_SIZE_MEDIUM_2,
    color: ThemeConstant.TEXT_COLOR_SUBTEXTS,
    lineHeight: 22,
    marginRight: ThemeConstant.MARGIN_SMALL,
    fontFamily: ThemeConstant.FONT_FAMILY,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: ThemeConstant.MARGIN_NORMAL,
    marginBottom: ThemeConstant.MARGIN_EXTRA_LARGE,
    marginLeft: moderateScale(13),
  },
  individualButtonOuterContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: moderateScale(2),
  },
  individualButtonInnerContainer: {
    borderRadius: moderateScale(20),
    padding: moderateScale(1),
    backgroundColor: ThemeConstant.BACKGROUND_COLOR_ALPHA,
    width: moderateScale(35),
    height: moderateScale(35),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: moderateScale(15),
  },

  descriptionTextContainer: {
    paddingHorizontal: ThemeConstant.PADDING_EXTRA_LARGE,
    marginTop: ThemeConstant.MARGIN_NORMAL
  },
  btnContainer: {
    marginHorizontal: ThemeConstant.MARGIN_EXTRA_LARGE,
    borderRadius: 30,
    marginBottom: moderateScale(-7) ,
    backgroundColor: ThemeConstant.BACKGROUND_COLOR_ALPHA,
    marginTop: ThemeConstant.MARGIN_EXTRA_LARGE,
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 30,
  },
  topHeaderStyle: {
    height: 60,
  },
  iconContainer: {
    width: 50,
    height: '100%',
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readMoreStyle: {
    width: '25%',
    fontWeight: 'bold',
  },

  //styling for alert modal in media item
  centeredView: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000099',
    width: '90%',
    height: '30%',
    borderRadius: scale(10)

  },
  modal2View: {
    margin: 20,
    marginBottom: 5,
    width: '95%',
    // height: 200,
    backgroundColor: '#d3d3d3',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
  },

  //latest modal styles
  textColorWhite: {
    fontSize:scale(16)
  },
  btnn: {
    borderRadius: 6,
    height: "52%",
    width: "43%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth:.8,
  borderColor:"#ffff"
  },
  btnTextModal: {
    fontWeight: "bold"
  },

  //payment overlay modal----------
  mainModalView: {
    backgroundColor: 'white',
    borderRadius:moderateScale(10),
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    height: moderateScale(375),
    position: 'absolute',
    bottom: 0,
  },
  info: {
    fontSize: scale(14),
    fontFamily: ThemeConstant.FONT_FAMILY,
    fontWeight: 'bold',
  },
  loaderContainer: {
    height: moderateVerticalScale(50),
    position: 'absolute',
    top: 0,
    height: '85%',
    zIndex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    // marginBottom: moderateVerticalScale(10),
  }

});