import { StyleSheet } from "react-native";
import { moderateVerticalScale, scale } from "react-native-size-matters";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        paddingHorizontal: 10,
        marginTop: moderateVerticalScale(10),
        borderBottomWidth: 1.4,
        borderBottomColor: '#f7f8fa',
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: {
        fontSize: scale(18),
        fontWeight: '600',
    }
})