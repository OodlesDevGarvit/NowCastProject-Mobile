import messaging from '@react-native-firebase/messaging';
import { GET_REMOTE_MESSAGE, GET_ISLAUCHEDFROMNOTIFICATION } from './types';

//get branding details--
export const getRemoteMessage = () => {
  return async (dispatch) => {
    try {
      const res = await messaging().getInitialNotification();
      if (res !== null) {
        dispatch({ type: GET_REMOTE_MESSAGE, payload: res });
        dispatch({ type: GET_ISLAUCHEDFROMNOTIFICATION, payload: true });
      } else {
        dispatch({ type: GET_ISLAUCHEDFROMNOTIFICATION, payload: false });
        dispatch({ type: GET_REMOTE_MESSAGE, payload: {} });
      }
    } catch (err) {
      console.log('Error while getting remote notification status daata');
    }
  };
};

//get branding details--
export const clearRemoteMessage = () => {
  return async (dispatch) => {

    dispatch({ type: GET_REMOTE_MESSAGE, payload: {} });
    dispatch({ type: GET_ISLAUCHEDFROMNOTIFICATION, payload: false });
  };
};
