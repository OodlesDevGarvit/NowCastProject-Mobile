import {StyleSheet, Dimensions, Platform} from 'react-native';
import { moderateScale, moderateVerticalScale } from 'react-native-size-matters';
import ThemeConstant from '../../constant/ThemeConstant';
export default StyleSheet.create({
  row: {
    // flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  card: {
    backgroundColor: '#fff',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  image: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  details: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    height: moderateVerticalScale(40),
  },
  title: {
    fontWeight: 'bold',
    fontSize: 17,
    color: 'rgba(0,0,0,0.75)',
    fontFamily: ThemeConstant.FONT_FAMILY,
  },
  description: {
    fontSize: 14,
    marginTop:Platform.OS=='ios'? null : moderateVerticalScale(-4),
    marginBottom:moderateScale(3),
    color: ThemeConstant.TEXT_COLOR_SUBTEXTS,
    fontFamily: ThemeConstant.FONT_FAMILY,
  },

  subViewFlatlist: {
    flex: 1 / 2,
  },
});