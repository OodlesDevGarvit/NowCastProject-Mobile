import { PermissionsAndroid } from "react-native";


//getting storage permission---------------------
export const gettingPermissions = async () => {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
                title: "Storage Permission",
                message:
                    "NowCast Wants to Access Your Storage",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            // console.log("You can Read Storage");
        } else {
            // console.log("Permission denied to read External Storage");
        }
    } catch (err) {
        // console.warn(err);
    }
}