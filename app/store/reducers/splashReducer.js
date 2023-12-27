
import { SET_FETCHED, SET_SPLASH, SET_SPLASH_URL } from '../actions/types';

const initialState = {
    isVisible: true,
    url: null,
    fetched: false
};

export default function splashReducer(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case SET_SPLASH:
            return {
                ...state,
                isVisible: payload
            };
        case SET_SPLASH_URL:
            return {
            ...state,
                url: payload
            }
        case SET_FETCHED:
            return {
                ...state,
                fetched: payload
            }
        default:
            return {
                ...state,
            };
    }
}

