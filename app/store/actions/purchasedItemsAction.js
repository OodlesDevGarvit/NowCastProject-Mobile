import { axiosInstance1 } from '../../constant/Auth';
import { SET_OTP_ITEMS } from './types';
import * as APIs from '../../constant/APIs';

//get purchased items--
export const getPurchasedItems = (token) => {
    return async (dispatch) => {
        let axiosConfig = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + `${token}`,
            },
        };
        try {
            const res = await axiosInstance1.get(`${APIs.userOTPItems}`, axiosConfig);
            const data = res.data.data;
            console.log('data of OTP', data)
            await dispatch({ type: SET_OTP_ITEMS, payload: data });
        } catch (err) {
            console.log('Error while getting OTP items daata', err);
        }
    };
};
