import { CHANGE_ENV, CHANGE_ORG } from "../actions/types";

const initialState = {
    orgId: 557,  //change you orgnization is HERE----
    env: 'DEV'
};

export default function activeOrgReducer(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case CHANGE_ORG:
            return {
                ...state,
                orgId: payload,
            };
        case CHANGE_ENV:
            return {
                ...state,
                env: payload
            }
        default:
            return {
                ...state,
            };
    }
}
