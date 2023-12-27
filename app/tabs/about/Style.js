import { StyleSheet, Dimensions } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
const DEVICE_WIDTH = Dimensions.get('window').width;

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    slider: {
        width: "100%",
        height:moderateScale(140),
        marginBottom: '3%'
    },
    backgroundImage: {
        height: '100%',
        width: DEVICE_WIDTH,
    },
    button: {
        paddingHorizontal: '5%',
        paddingVertical: '7%',
        // borderWidth: 1,
        width: '100%',
        flexDirection: 'row',
        // flexWrap: 'wrap',
    },
    buttonItem: {
        flex: 1,
        height: 40,
        backgroundColor: '#fff',
        marginBottom: '5%',
        elevation: 5,
        width: "48%",
        // borderWidth: 1
    },
    btnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    btnTextContainer: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'

    },
    descriptionContainer: {
        flex: 1,
        paddingHorizontal: '5%',
        // marginTop: '-5%',
        marginBottom: 10,
        // borderWidth: 1
    },
    descriptionText: {
        letterSpacing: 1.1,
        fontSize: 14,
        color: '#484848',

    },
    customSlide: {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignSelf: 'center',
        // height: 150,
        marginTop: 0,

    },
    imgStyle: {
        flex: 1,
        width: '100%',
        height: undefined,
        aspectRatio: 1920 / 692,
    }

});