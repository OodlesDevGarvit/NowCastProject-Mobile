import { UPDATE_CAST_URL,UPDATE_CAST_CLIENT } from "../actions/types";

const initialState = {
    castUrl: null,
    client:null
};

export default function castReducer(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case UPDATE_CAST_URL:
            return {
                ...state,
                castUrl: payload,
            };
        case UPDATE_CAST_CLIENT:
            return{
                ...state,
                client:payload
            }
        default:
            return {
                ...state,
            };
    }
}
