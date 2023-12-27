import ThemeConstant from '../../constant/ThemeConstant';
import { GET_BRANDING, STORE_DOWNLOADS } from '../actions/types';

const initialState = {
  brandingData: {
    brandColor: ThemeConstant.PRIMARY_COLOR,
    shortAppTitle: '',
    organizationName:'',
    organizationUrl:'',
    website:'',
    theme: 'LIGHT',
    subDomain:''
  },
  downloads : []
};

export default function brandingReducer(state = initialState, action) {
  // console.log('branding reducer action is---',action);
  
  const { type, payload } = action;
  switch (type) {
    case GET_BRANDING:
      return {
        ...state,
        brandingData: payload,
      };
      case STORE_DOWNLOADS:
        return{
            ...state,
            downloads : [...state.downloads,...action.payload]
        }

    default:
      return {
        ...state,
      };
  }
}
