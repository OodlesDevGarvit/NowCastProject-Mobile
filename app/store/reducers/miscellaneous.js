import { SET_YEAR_STRING } from "../actions/types";

const initialState = {
    yr_String: null
};

export default function misc(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case SET_YEAR_STRING:
            return {
                ...state,
                yr_String: payload,
            };
        default:
            return {
                ...state,
            };
    }
}
