
import { GET_IS_ADMIN, GET_USER_CARDS, GET_USER_DETAILS, GET_USER_SUBSCRIPTION_DATA, LOGIN_FAILED, LOGIN_SUCCESS, LOGOUT, SET_LIVE_ENABLED, UPDATE_ERROR_TEXT, UPDATE_IS_ADMIN, UPDATE_TOKEN, UPDATE_USER_CARDS, UPDATE_USER_DETAILS, BIBLE_TYPES } from '../actions/types';

const initialState = {
    selectedVersion: '06125adad2d5898a-01',
    selectedVersionAbb: 'ASV',
    currentBookName: 'Genesis',
    currentBookId: 'GEN',
    currentChapterId: 'GEN.1',
    activeBookIndex: 0,
    activeIndex: 1
};

export default function bibleReducer(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case BIBLE_TYPES.SET_SELECTED_BIBLE:
            return {
                ...state,
                selectedVersion: payload
            };
        case BIBLE_TYPES.SET_SELECTED_ABB:
            return {
                ...state,
                selectedVersionAbb: payload
            }
        case BIBLE_TYPES.SET_CURRENT_BOOKNAME:
            return {
                ...state,
                currentBookName: payload
            }
        case BIBLE_TYPES.SET_CURRENT_BOOKID:
            return {
                ...state,
                currentBookId: payload
            }
        case BIBLE_TYPES.SET_CURRENT_CHAPTER_ID:
            return {
                ...state,
                currentChapterId: payload
            }
        case BIBLE_TYPES.SET_ACTIVE_INDEX:
            return {
                ...state,
                activeBookIndex: payload
            }
        case BIBLE_TYPES.SET_ACTIVE_INDEX_CH:
            return {
                ...state,
                activeIndex: payload
            }
    }
    return state;
}
