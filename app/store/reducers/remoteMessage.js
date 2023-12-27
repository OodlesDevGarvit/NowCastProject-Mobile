import {
  GET_ISLAUCHEDFROMNOTIFICATION,
  GET_REMOTE_MESSAGE,
} from '../actions/types';

const initialState = {
    fromNotification: false,
    remoteMessage: {},
};

export default function remoteReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case GET_ISLAUCHEDFROMNOTIFICATION:
      return {
        ...state,
        fromNotification: payload,
      };
    case GET_REMOTE_MESSAGE:
      return {
        ...state,
        remoteMessage: payload,
      };
  }
  return state;
}
