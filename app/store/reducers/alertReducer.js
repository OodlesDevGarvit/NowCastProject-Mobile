import { SET_ALERT } from "../actions/types";

const initlaState = {
    showAlert: false,
    data: {}
}

const alertReducer = (state = initlaState, action) => {
    const { type, payload } = action;
    switch (type) {
        case SET_ALERT:
            return {
                ...state,
                showAlert: payload.setShowAlert,
                data: payload.data
            }
        default:
            return {
                ...state
            }
    }
}

export default alertReducer;