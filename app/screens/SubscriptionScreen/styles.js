import { StyleSheet } from "react-native";
import { moderateVerticalScale, verticalScale, moderateScale, scale } from "react-native-size-matters";

export const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        height: 70,
    },
    mainContainer: { flex: 1, height: '100%' },
    headerText: {
        display: 'flex',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 1.2,
    },
    totalAmount: {
        marginHorizontal: 20,
        height: 150,
        marginTop: 15,
        borderRadius: 25,
        padding: 20,
        justifyContent: 'center',
    },
    amount: {
        fontSize: 30,
        marginBottom: 10,
    },
    amountText: {
        fontSize: 18,
    },
    allPlans: {
        paddingHorizontal: 20,
        width: '100%',
        height: 10,
    },

    // style for single card-----------
    card: {
        width: '100%',
        height: 100,
        borderRadius: 20,
        marginBottom: 20,
        flexDirection: 'row',
    },
    activePlan: {
        borderWidth: 1,
        marginTop: 10,
    },
    textInputName: {
        // height: 40,
        paddingVertical: 7,
        includeFontPadding: false,
        borderRadius: 5,
        fontSize: 18,
        paddingLeft: 10,
    },
    textHeading: {
        marginBottom: 5,
        fontSize: 16,
        color: '#696969',
    },
    logoutBtn: {
        height: 50,
        borderRadius: 25,
        fontSize: 18,
        paddingLeft: 10,
        marginHorizontal: 25,
        marginTop: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        color: '#000',
    },
    pencilIcon: {
        position: 'absolute',
        alignSelf: 'flex-end',
        right: 35,
        top: 35,
    },
    subscriptionTitle: {
        alignItems: "center",
        height: '30%',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'

    },
    subscriptionTitleText: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 30,
        //paddingLeft: 10,
        letterSpacing: 0,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 370,
    },
    containers: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // top: -100,
    },
    field: {
        width: 300,
        color: '#449aeb',
        borderColor: '#000000',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    textStyle: {
        color: 'white',
        textAlign: 'center',
    },
    button: {
        borderRadius: scale(5),
        padding: 13,
        elevation: 2,
    },
    button2: {
        borderRadius: 10,
        padding: 12,
        elevation: 2,
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    pencil: {
        position: 'absolute',
        right: 5,
        top: 35,
    },
    pencilMail: {
        // borderWidth:1,
        // borderColor:'red',
        position: 'absolute',
        right: 25,
        top: 35,
    },
    pencilLogo: {
        alignSelf: 'flex-end',
        position: 'absolute',
        bottom: 5,
        right: -15,
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
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        textAlign: 'center',
        height: '100%',
        textAlignVertical: 'center',
        width: '100%',
        color: 'black',
        fontSize: 18,
        padding: 20,
    },
    loaderContainer: {
        height: moderateVerticalScale(100),
        position: 'absolute',
        top: 0,
        height: '85%',
        zIndex: 5,
        alignSelf: 'center',
        justifyContent: 'center',
        marginBottom: moderateVerticalScale(10)
    },
    //select-dropdown-list libray
    dropdown1DropdownStyle: {
        backgroundColor: '#EFEFEF',
        borderRadius: 8,
        // marginTop: verticalScale(-20),
    },
    dropdown1RowTxtStyle: {
        textAlign: 'left',
        fontSize: 14,

    },
    dropdown1BtnStyle: {
        paddingLeft: moderateScale(15),
        borderWidth: scale(1),
        borderRadius: scale(5),
        borderColor: '#dadae8',
        width: '100%',
        height: moderateScale(40),
    },
    dropdown1BtnTxtStyle: {
        color: '#000',
        textAlign: 'left',
        fontSize: 18
    },
    iconContainer: {
        position: 'absolute',
        right: moderateScale(10),
        zIndex: 2,
    },
});