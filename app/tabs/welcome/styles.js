import {StyleSheet, Dimensions} from 'react-native';
import { heightper,widthtper } from '../../utils/heightWidthRatio';
const { width, height } = Dimensions.get('window');


export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
  },
  mainview: {
    width: widthtper("51.1%"),
    paddingLeft: widthtper(0.2),
    paddingBottom: widthtper(1),
    marginRight: widthtper(-0.1),
  },
  slider: { backgroundColor: "green", height: 150 },
  content1: {
    width: "100%",
    height: 6,
    marginBottom: 10,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  squareImg: {
    marginRight: widthtper(1),
    width: widthtper("50%"),
    height: heightper("22%"),
    marginTop: heightper(-0.1),
  },
  content2: {
    width: "100%",
    height: 100,
    marginTop: 10,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  contentText: { color: "#fff" },
  buttons: {
    zIndex: 1,
    height: 15,
    marginTop: -25,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  button: {
    margin: 1,
    width: 15,
    height: 15,
    opacity: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSelected: {
    opacity: 0.8,
    color: "white",
  },
  customImage: {
    // width: '100%',
    flex: 1,
    aspectRatio: 1.8,
    resizeMode: "cover",
  },
  activityIndicator: {
    // borderWidth: 1,
    // borderColor: "red",
    zIndex: 1,
    position: "absolute",
    width: width,
    height: height,
  },
});