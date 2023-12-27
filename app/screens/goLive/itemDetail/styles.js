import { Platform, StyleSheet } from "react-native";
import { moderateScale, moderateVerticalScale, scale } from "react-native-size-matters";
import ThemeConstant from "../../../constant/ThemeConstant";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#696969',
        position: 'relative',
    },
    cameraViewContainer: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: -1,
    },
    camera: {
        width: '100%',
        height: '100%'
    },
    overlay: {
        backgroundColor: 'rgba(26,26,29,0.8)',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
    },
    title: {
        color: '#fff',
        fontSize: scale(18),
        width: moderateScale(100)
    },
    dateTitle: {
        color: '#000',
        fontSize: scale(18),
    },
    dateSubtitle: {
        color: ThemeConstant.TEXT_COLOR_ALFA,
        fontSize: scale(12),
    },
    scrollViewStyle: {
        paddingHorizontal: moderateScale(18),
        paddingVertical: moderateVerticalScale(10),
        height: '100%'
    },
    dateBoxContainer: {
        borderWidth: 1,
        borderColor: '#d3d3d3',
        width: moderateScale(130),
        height: moderateVerticalScale(30)
    },
    dateBoxText: {
        color: '#696969',
        fontSize: scale(16)
    },
    dateBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: moderateScale(10),
    },
    timeBox: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: moderateVerticalScale(10)
    },
    formSectionContainer: {
        marginTop: moderateVerticalScale(15),
    },
    socialMediaSection: {
        marginTop: moderateVerticalScale(35),
        paddingBottom: moderateVerticalScale(80)
    },
    socialButton: {
        width: moderateScale(50),
        height: moderateVerticalScale(50),
        borderRadius: scale(50),
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: 'rgba(26,26,29,0.5)'
    },
    socialSection: {
        marginTop: moderateVerticalScale(10),
        justifyContent: 'space-between'
    },
    socialText: {
        color: "#fff",
        fontSize: scale(10),
    },
    btnCont: {
        borderWidth: 1,
        borderColor: '#696969',
        borderRadius: moderateVerticalScale(30),
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: moderateVerticalScale(4),
        width: moderateScale(90)
    },
    headerContainer: {
        width: '100%',
        height: moderateVerticalScale(50),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    iconSection: {
        flexDirection: 'row',
    },
    icon: {
        width: moderateScale(40),
        height: moderateScale(40),
        justifyContent: "center",
        alignItems: 'center',
        marginHorizontal: moderateScale(10)
    },
    line: {
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: scale(22),
        color: '#fff',
        fontWeight: 'bold'
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(26,26,29,0.7)',
        paddingHorizontal: scale(18),
    },
    modalView: {
        width: '100%',
        backgroundColor: "#fff",
        borderRadius: scale(10),
        paddingHorizontal: scale(20),
        paddingVertical: scale(10),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        paddingHorizontal: scale(30),
        paddingVertical: scale(10),
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    closeBtnContainer: {
        position: 'absolute',
        right: moderateScale(10),
        top: moderateScale(10)
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    socialCard: {
        borderBottomWidth: 1,
        borderColor: 'gray',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: moderateVerticalScale(10),
    },
    socialName: {
        color: '#fff',
        flex: 1,
        paddingHorizontal: 12,
        fontSize: scale(14),
        height: '100%',
        textAlignVertical: 'center'
    },
    btnContainer: {
        position: 'absolute',
        bottom: moderateVerticalScale(20),
        right: moderateScale(20),
        width: moderateScale(90),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: scale(6),
        paddingVertical: moderateVerticalScale(2)
    },
    btnText: {
        fontSize: scale(12),
        color: '#fff'
    },
    accountList: {
        position: 'absolute',
        top: moderateVerticalScale(30),
        right: 0,
        left: 0,
        backgroundColor: '#fff'
    },
    accountContainer: {
        borderWidth: 1,
        borderColor: 'red',
        height: moderateVerticalScale(40),
        backgroundColor: '#fff',
    },
    modalPagesHeader: {
        fontWeight: 'bold',
        fontSize: scale(16),
        marginBottom: moderateVerticalScale(5)
    },
    modalCardContainer: {
        borderBottomWidth: 1,
        borderColor: '#d3d3d3',
        flexDirection: 'row',
        height: moderateVerticalScale(50),
        alignItems: 'center',
        paddingRight: ThemeConstant.PADDING_SMALL
    },
    pageNameText: {
        flex: 1,
        marginRight: moderateScale(10),
        fontSize: scale(14),
    }


})