import { SET_EPUB_THEME, SET_EPUB_FONTFACE, SET_EPUB_FONTSIZE, RESET_EPUB } from "../actions/types";

const initialState = {
    fontFace: '',
    fontSize: 16,
    colorMode: ''
};

export default function epubReducer(state = initialState, action) {
    const { type, payload } = action
    switch (type) {

        case SET_EPUB_FONTFACE:
            return {
                ...state,
                fontFace: payload
            }
        case SET_EPUB_FONTSIZE:
            return {
                ...state,
                fontSize: payload
            }
        case SET_EPUB_THEME:
            return {
                ...state,
                colorMode: payload,
            };
        case RESET_EPUB:
            return {
                ...state,
                fontFace: '',
                fontSize: 16,
                colorMode: ''
            };
        default:
            return {
                ...state,
            };
    }
}