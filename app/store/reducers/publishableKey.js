import { SET_PUBLISHED_KEY } from "../actions/types";

const initialState = {
    key: null
}

export default publishableKey = (state = initialState, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_PUBLISHED_KEY:
            return {
                ...state,
                key: payload
            }
        default:
            return {
                ...state,
            };

    }
}