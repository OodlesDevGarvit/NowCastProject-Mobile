
import {RFPercentage} from 'react-native-responsive-fontsize';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Dimensions, PixelRatio, } from 'react-native';



const {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT
} = Dimensions.get('window');
export const SCREEN_HEIGHTN = Math.round(
    Dimensions.get('window').height,
  );
export const SCREEN_WIDTHN = Math.round(Dimensions.get('window').width);
const scale = SCREEN_WIDTH / 320;
const widthBaseScale = SCREEN_WIDTH / 375;
const heightBaseScale = SCREEN_HEIGHT / 812;
export function normalize(size, based = 'width') {
    const newSize = (based === 'height') ?
        size * heightBaseScale : size * widthBaseScale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
}
//for width  pixel
export const widthPixel = (size) => {
    return normalize(size, 'width');
};
//for height  pixel
export const heightPixel = (size) => {
    return normalize(size, 'height');
};
//for font  pixel
export const fontPixel = (size) => {
    return heightPixel(size);
};
//for Margin and Padding vertical pixel
export const pixelSizeVertical = (size) => {
    return heightPixel(size);
};
//for Margin and Padding horizontal pixel
export const pixelSizeHorizontal = (size) => {
    return widthPixel(size);
};
export const STATUS_BAR_HEIGHT = getStatusBarHeight();
const baseSize = 8;
export const Percentage = (value) => {
  return RFPercentage(value / baseSize);
};