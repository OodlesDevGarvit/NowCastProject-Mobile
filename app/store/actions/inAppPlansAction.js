import { axiosInstance1 } from '../../constant/Auth';
import { GET_BRANDING, SET_ALERT, SET_ALL_PLANS_INAPP } from './types';
import * as APIs from '../../constant/APIs';
import * as API_CONSTANT from '../../constant/ApiConstant';
import { store } from '../store';
import { getSubscriptions } from 'react-native-iap';

//get branding details--
export const setAllPlansInApp = () => {
    return async (dispatch) => {
        try {
            let array = []
            const allPlans = await createSubIdsArrayForIOS(dispatch);
            const products = await getSubscriptions({ skus: allPlans });
            await products.forEach(product => array.push(product.productId));
            dispatch({ type: SET_ALL_PLANS_INAPP, payload: array });
        } catch (err) {
            console.log('Error while setting all plans initially');
        }
    };
};


const createSubIdsArrayForIOS = async (dispatch) => {
    const orgId = store.getState().activeOrgReducer.orgId;
    let array = [];
    try {
        const res = await axiosInstance1.get(`${APIs.subscription}?organizationId=${orgId}`);
        let data2 = res.data.data;
        data2.map((item) => array.push(item.id));
        let updatedArray = array.map((item) => item.length === 1 ? '0' + item : item);
        return updatedArray;
    }
    catch (err) {
        dispatch({
            type: SET_ALERT, payload: {
                setShowAlert: true,
                data: {
                    message: 'Could not fetch plans',
                    showCancelButton: true,
                    onCancelPressed: () => {
                        dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                    },
                }
            }
        }
        )

        return [];
    }
}
