import VersionCheck from "react-native-version-check";
import { Linking, Platform,Alert } from "react-native";
import { SET_ALERT } from "../store/actions/types";
import RNExitApp from "react-native-exit-app";


export const checkUpdateNeeded = async (minAppVerison, dispatch) => {

    if (minAppVerison) {
        let current = await VersionCheck.getCurrentVersion();
        const result = compareVersions(minAppVerison, current);
        const updateNeeded = await VersionCheck.needUpdate();

        if (result > 0) {
            if (Platform.OS === 'android' && minAppVerison) {
                dispatch({
                    type: SET_ALERT, payload: {
                        setShowAlert: true,
                        data: {
                            title: 'Update Alert',
                            message: "Update to the latest version to continue using the application",
                            confirmText: 'Update',
                            showCancelButton: true,
                            showConfirmButton: true,
                            onCancelPressed: async () => {
                                RNExitApp.exitApp();
                            },
                            onConfirmPressed: async () => {
                                await Linking.openURL(updateNeeded.storeUrl);
                                RNExitApp.exitApp();
                            },
                        }
                    }
                })
            } else if (Platform.OS == 'ios' && minAppVerison) {
                Alert.alert(
                    'Update',
                    'Update to the latest version to continue using the application',
                    [
                        {
                            text: 'Update',
                            onPress: async () => {
                                await Linking.openURL(updateNeeded.storeUrl);
                                RNExitApp.exitApp();
                            }
                        },

                        {
                            text: 'Cancel',
                            onPress: () => {
                                RNExitApp.exitApp();
                            }
                        }
                    ]
                )
            }
        }
    }

}

function compareVersions(version1, version2) {
    console.log('version1: ' + version1)
    console.log('version2: ' + version2)
    return version1.localeCompare(version2, undefined, { numeric: true });
}
