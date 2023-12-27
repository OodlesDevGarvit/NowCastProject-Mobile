import { SET_OTP_ITEMS } from "../actions/types";

const initialState = {
    purchasedItems: []
}

export default purchasedItemsReducer = (state = initialState, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_OTP_ITEMS:
            return {
                ...state,
                purchasedItems: payload
            }
        default:
            return {
                ...state,
            };

    }
}