import { Dimensions, StatusBar, StyleSheet } from "react-native";
const { width, height } = Dimensions.get('window');
import { scale, moderateScale, moderateVerticalScale } from "react-native-size-matters";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    camera: {
        height: '100%',
        width: '100%'
    },
    controlContainer: {
        width: '100%',
        position: 'absolute',
        top: moderateVerticalScale(30),
        flexDirection: 'row',
        zIndex: 2,
        justifyContent: 'space-between',
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(10)

    },
    conrolsContainerRight: {
        flexDirection: 'row'
    },
    btnsContainer: {
        // borderWidth: 1,
        // borderColor: 'red'
    },
    liveBtnContainer: {
        backgroundColor: 'red',
        minWidth: moderateScale(50),
        height: scale(30),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: scale(5),
        marginHorizontal: moderateScale(10)
    },
    liveText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    btn: {
        padding: scale(5),
    },
    orgName: {
        fontSize: scale(14),
        color: '#696969',
        fontWeight: 'bold',
        marginLeft: moderateScale(5)
    },
    playIconContainer: {
        position: 'absolute',
        bottom: moderateVerticalScale(25),
        left: 0,
        right: 0,
        zIndex: 2,
        height: moderateVerticalScale(60),
        alignItems: 'center',
    },
    profileContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: moderateVerticalScale(40)
    },
    profilePic: {
        width: 59,
        height: 59,
        borderRadius: 30,
        marginTop: 10,
    }
})