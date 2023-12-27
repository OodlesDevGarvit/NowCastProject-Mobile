import { openDatabase } from 'react-native-sqlite-storage';
import { store } from '../store/store';
//for bible--
export const bibleApi = 'https://api.scripture.api.bible/v1/bibles';
export const BIBLE_API_KEY = '2d6b6eeb82ef541cc2e771c5ecaf2635';
// export const BIBLE_API_KEY = '	8289c543e0c09432bb1d70d8a7c5b841';
// export const BIBLE_API_KEY  = '	88a3e34588027b22af254c32a11685be';
export const ASVID = '06125adad2d5898a-01';


//TODO:  The organization Id implementation has been shifted to "activeOrg.js"
// export const ORGANIZATION_ID = store.getState().activeOrgReducer.orgId;
export const firebase_senderId = '256218572662';
export const login = 'login';
export const logout = 'logout';
export const PUSH_NOTIFICATION = 'pushNotification/';
export const STATIC_HEADER_IMAGE_HEIGHT_WIDTH = 'height=216&width=600';
export const EVENT_BANNER_IMAGE_HEIGHT_WIDTH = 'height=216&width=600';
export const BANNER_IMAGE_HEIGHT_WIDTH = 'height=346&width=960';
export const WIDE_IMAGE_HEIGHT_WIDTH = 'height=540&width=960';
export const WIDE_IMAGE_HEIGHT_WIDTH_EVENT = 'height=340&width=646';
export const WIDE_IMAGE_GRID_HEIGHT_WIDTH = 'height=225&width=400';
export const SQUARE_IMAGE_HEIGHT_WIDTH = 'height=800&width=800';
export const SQUARE_IMAGE_ROW_HEIGHT_WIDTH = 'height=100&width=100';
export const SQUARE_IMAGE_HEIGHT_WIDTH_AUDIO = 'height=600&width=600';

//for welcome page layouts -
export const ROW_SQAURE = 'height=250&width=250';
export const ROW_WIDE = 'height=360&width=640';
export const GRID_SQUARE = 'height=600&width=600';
export const GRID_WIDE = 'height=225&width=400';
export const STACK_WIDE = 'height=540&width=960';
export const STACK_BANNER = 'height=692&width=1920';
export const EVENT_WIDE = 'height=360&width=640';

export const ORIGINAL_SQ = 'height=1024&width=1024';
export const ORIGINAL_BANNER = 'height=692&width=1920';
export const ORIGINAL_WIDE = 'height=1080&width=1920';


export const db = openDatabase({ name: 'NowCastMobileApp' });