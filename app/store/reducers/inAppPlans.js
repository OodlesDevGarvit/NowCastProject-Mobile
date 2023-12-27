import { SET_IOSCOMP, SET_ACCESS_MODAL_IOS, SET_SUB_PLAN_IDS, SET_ALL_PLANS_INAPP } from "../actions/types";

const initialState = {
    plans: []
};

export default function inAppPlansReducer(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case SET_ALL_PLANS_INAPP:
            return {
                ...state,
                plans: payload,
            };
        default:
            return {
                ...state,
            };
    }
}
