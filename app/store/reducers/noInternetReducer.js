import { SET_NOINTERNET_MODAL } from "../actions/types";

const initialState={
    noInternetModalVisible:null
}

export default noInternetReducer = (state = initialState,action)=>{
    const {type,payload} = action
    switch(type){
        case SET_NOINTERNET_MODAL:
            return {
                ...state,
                noInternetModalVisible:payload
            }
            default:
                return{
                    ...state,
                };

    }
}