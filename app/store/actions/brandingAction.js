import { axiosInstance1 } from '../../constant/Auth';
import { GET_BRANDING, SET_ALERT } from './types';
import * as APIs from '../../constant/APIs';
import { store } from '../store';
import { Platform } from 'react-native';
import { DEVICE_TYPES } from '../../constant/StringConstant';

//get branding details--
export const getBranding = (callBack) => {
  const orgId= store.getState().activeOrgReducer.orgId;
  return async (dispatch) => {
    try {
      const res = await axiosInstance1.get(
        `${APIs.brandingWithout}?organizationId=${orgId}&deviceType=${Platform.OS == 'android' ? DEVICE_TYPES.MOBILE_ANDROID : DEVICE_TYPES.MOBILE_IOS}`
      );
      const data = res.data.data;

      const dataToDispatch = {
        ...data,
        mobileTheme: data?.mobileTheme?.toUpperCase(),
      };
      dispatch({ type: GET_BRANDING, payload: dataToDispatch });
    } catch (err) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: err.response.data.message ? err.response.data.message : "",
            showCancelButton: true,
            onCancelPressed: async () => {
              await dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
              callBack();
            },
          }
        }
      })
    }
  };
};
