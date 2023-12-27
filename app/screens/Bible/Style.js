import { StyleSheet, Dimensions, Platform } from 'react-native';
import { moderateScale, moderateVerticalScale } from 'react-native-size-matters';
import ThemeConstant from '../../constant/ThemeConstant';
const width = Dimensions.get('window').width;

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        position: 'relative'
    },
    mainContainer: {
        paddingTop: ThemeConstant.PADDING_EXTRA_LARGE,
        paddingHorizontal: ThemeConstant.PADDING_EXTRA_MEDIUM_LARGE,
    },
    textStyle: {
        fontSize: 16,
        textAlign: 'justify',
        lineHeight: 27,
        fontWeight: '300',
        letterSpacing: .7,
        // fontFamily: 'proxima_nova',
        // color: 'rgba(0,0,0,0.8)',
    },
    itemText: {
        color: 'rgb(0,0,0)',
        fontSize: 24,
        marginTop: 25,
        marginHorizontal: 15,
        fontWeight: 'bold',
    },
    bottomHeader: {
        width: width / 1.20,
        height: 45,
        borderRadius: 22,
        backgroundColor: 'rgb(255,255,255)',
        position: 'absolute',
        justifyContent: 'center',
        alignSelf: 'center'
    },
    buttons: {
        paddingVertical: ThemeConstant.PADDING_LARGE,
        marginHorizontal: ThemeConstant.MARGIN_LARGE,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    itemInActive: {
        fontSize: 18,
        color: ThemeConstant.TEXT_COLOR_SUBTEXTS
    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 7,
        marginHorizontal: 5,
    },
    readingText: {
        marginHorizontal: 15
    },
    playButtonStyle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgb(255,255,255)',
        position: 'absolute',
        bottom: 25,
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        shadowColor: Platform.OS === 'ios' ? '#E5E5E5' : '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 4,
    },
    headerIcon: {
        padding: 15,
        marginTop: Platform.OS == 'ios' ? moderateScale(30) : 10
    },
    headerHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#350F481E',
    },
    headingStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 15,
    },
    subHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 45,
    },
    itemSepStyle: {
        marginTop: 12,
        borderTopWidth: 2,
        borderTopColor: '#350F481E',
    },
    tabText: {
        fontSize: 14,
        color: '#000000',
        fontWeight: 'bold',
        marginRight: ThemeConstant.MARGIN_NORMAL,
        fontFamily: ThemeConstant.FONT_FAMILY
    },
    itemDay: {
        marginTop: 15,
        marginLeft: 15,
        fontSize: 18,
        color: 'black',
        fontWeight: '400',
    },
    dateStyle: {
        marginLeft: 15,
        fontSize: 22,
        color: '#000000',
        fontWeight: 'bold',
    },
    imageStyle: {
        width: 15,
        height: 12,
        resizeMode: 'stretch',
    },
    marginLeftStyle: {
        marginLeft: 7,
    },
    number: {
        fontSize: 11,
        color: ThemeConstant.TEXT_COLOR_SUBTEXTS,
    },
    activityIndicator: {
        position: 'absolute',
        alignSelf: "center",
        top: "50%",
        zIndex: 1
    }
});