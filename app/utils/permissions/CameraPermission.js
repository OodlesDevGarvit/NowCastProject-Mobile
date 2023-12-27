import { PermissionsAndroid } from "react-native";

export const cameraPermission = async () => {
    return await PermissionsAndroid.requestMultiple(
        [
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ],
        {
            title: "Camera And Microphone Permission",
            message: "Streaming App needs access to your camera ",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
        }
    );
};
