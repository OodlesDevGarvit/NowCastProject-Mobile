
import { GET_IS_ADMIN, GET_USER_CARDS, GET_USER_DETAILS, GET_USER_GIVING_CARDS, GET_USER_SUBSCRIPTION_DATA, LOGIN_FAILED, LOGIN_SUCCESS, LOGOUT, SET_IS_PAYMENT_DONE, SET_LIVE_ENABLED, UPDATE_ERROR_TEXT, UPDATE_ISPAYMENTDONE, UPDATE_IS_ADMIN, UPDATE_TOKEN, UPDATE_USER_CARDS, UPDATE_USER_DETAILS } from '../actions/types';

const initialState = {
  token: null,
  user: null,
  subscription: {
    id: 0,
    name: null,
    duration: null
  },
  userId: null,
  isAuthenticated: false,
  errorText: null,
  isAdmin: false,
  liveEnabled: false,
  userCards: [],
  userGivingCards: [],
  isPaymentDone: false

};

export default function authReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        token: payload.token,
        user: payload.userDetails,
        userId: payload.userDetails.id,
        isAuthenticated: true,
      };
    case SET_IS_PAYMENT_DONE:
      return {
        ...state,
        isPaymentDone: payload
      }
    case LOGIN_FAILED:
      return {
        ...state,
        errorText: payload || 'Please check your email or password'
      };
    case UPDATE_ERROR_TEXT:
      return {
        ...state,
        errorText: null
      };
    case UPDATE_TOKEN:
      return {
        ...state,
        token: payload
      };
    case UPDATE_ISPAYMENTDONE:
      return {
        ...state,
        isPaymentDone: payload
      };
    case LOGOUT:
      return {
        ...state,
        token: null,
        user: null,
        userId: null,
        isAuthenticated: false,
        isAdmin: false,
        userCards: [],
        userGivingCard: [],
        subscription: {
          id: 0,
          name: null,
          duration: null
        },
      };
    case GET_USER_DETAILS:
      return {
        ...state,
        user: payload
      };
    case UPDATE_USER_DETAILS:
      return {
        ...state,
        user: payload
      };
    case GET_IS_ADMIN:
      return {
        ...state,
        isAdmin: payload
      };
    case GET_USER_CARDS:
      return {
        ...state,
        userCards: payload
      };
    case GET_USER_GIVING_CARDS:
      return {
        ...state,
        userGivingCards: payload
      };
    case GET_USER_SUBSCRIPTION_DATA:
      return {
        ...state,
        subscription: {
          id: payload.id,
          name: payload.name,
          duration: payload.duration
        }
      };
    case SET_LIVE_ENABLED:
      return {
        ...state,
        liveEnabled: payload
      };
  }
  return state;
}
