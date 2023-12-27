import { Platform } from "react-native"
import { store } from "../store/store";


export const filterContentForIOS = (list) => {
    const { isPaymentDone, subscription: { id } } = store.getState().authReducer;
    const { purchasedItems } = store.getState().purchasedItemsReducer;
    const { plans } = store.getState().inAppPlansReducer;
    let arr = [];
    if (Platform.OS == 'android') return list;
    list.map((item, index) => {
        if (item?.mediaAccessType == "PAID") {
            if (item?.subscriptionPlanIds?.includes(id) && isPaymentDone) {
                arr.push(item);
            } else if (checkIfItemAvailable(item, purchasedItems)) {
                arr.push(item);
            } else if (item?.subscriptionPlanIds.length > 0 && checkIfAnySubscriptionIdExistsOnApple(item?.subscriptionPlanIds, plans)) {
                arr.push(item);
            }
        } else {
            arr.push(item)
        }
    })

    return arr;

}

const checkIfAnySubscriptionIdExistsOnApple = (allIds, appleIds) => {
    for (let i = 0; i < allIds.length; i++) {
        for (let j = 0; j < appleIds.length; j++) {
            if (allIds[i] == appleIds[j]) {
                return true
            }
        }
    }
    return false;
}


const checkIfItemAvailable = (item, list) => {
    const isItemAvailable = list.some(i => i.id === item.id && (i.contentType === item?.contentType || i.contentType === item?.itemType || i.contentType == item?.type));
    return isItemAvailable;
}