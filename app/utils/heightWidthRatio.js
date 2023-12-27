/**
 * Dynamically height width for compoennts
 * Takes val of component
 *  667 - avg height of mobile
 *  375 - avg width of mobile
 */
 import {
    Dimensions, PixelRatio
  } from 'react-native';
 const { width, height } = Dimensions.get('window');
// import { heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen"
// import { getPixelSizeForLayoutSize } from 'react-native/Libraries/Utilities/PixelRatio';

const widthtper = (number) => {
    let givenWidth=typeof number==='number'?number:parseFloat(number);

    return PixelRatio.roundToNearestPixel((width*givenWidth)/100)
}

const heightper = (number) => {
    let givenHeight=typeof number==='number'?number:parseFloat(number);

    return PixelRatio.roundToNearestPixel((height*givenHeight)/100)
}
 export {widthtper,heightper};