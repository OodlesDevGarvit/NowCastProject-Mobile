import { SET_IOSCOMP, SET_ACCESS_MODAL_IOS, SET_SUB_PLAN_IDS } from "../actions/types";

const initialState = {
    isVisiblePaid: null,
    isVisibleAccess: null,
    subscriptionPlanIds: []
};

export default function iosCompRedaucer(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case SET_IOSCOMP:
            return {
                ...state,
                isVisiblePaid: payload,
            };
        case SET_ACCESS_MODAL_IOS:
            return {
                ...state,
                isVisibleAccess: payload
            };
        case SET_SUB_PLAN_IDS:
            return {
                ...state,
                subscriptionPlanIds: payload
            }

        default:
            return {
                ...state,
            };
    }
}
