import { BASE_URL_IMAGE } from './Auth';

export const tabById = '/tab/tabId';
export const tab = '/tab';
export const listDesign = '/listDesign';
export const listDesignId = '/listDesign/listDesignId';
export const forgotPassword = '/user/forgetPasswordLink';
export const linkId = '/link/linkId';
export const link = '/link';
export const catalog = '/catalog';
export const IMAGE_LOAD='/upload/load';
export const PNG_IMAGE_LOAD = '/upload/loadPng';
export const upload = '/upload';
export const imageUplaod= '/upload/image';
export const catalogId = '/catalog/catalogId';
export const catalogIdAuth = '/catalog';
export const mediaseries = '/mediaseries';
export const mediaseriesId = '/mediaseries/mediaseriesId';
export const MusicsInAlbum = '/album/MusicsInAlbum';
export const ListOfMusicInAlbum = '/album/listOfMusicInAlbum';
export const album = '/album';
export const albumId = '/album/albumId';
export const mediaItemId = '/mediaItem/mediaItemId';
export const mediaItem = '/mediaItem/';
export const createMediaItem = '/mediaItem/mediaItem';
export const createNote = '/note/createNote';
export const getAllNotesList = '/note/getAllNotesList';
export const note = '/note';
export const getAllActiveTabList = '/tab/getAllActiveTabList';
export const getActiveTabList = '/tab/getActiveTabList';
export const loginAPI =  '/user/login';
export const userLoginApi ='/user/loginUser';
export const signup = '/user/signup';
export const userRegister = '/contact/createUserWithUserLogin'
export const logoutAPI = '/user/logout';
export const rssFeed = '/rssFeed';
export const rssFeedId = '/rssFeed/rssFeed';
export const calendar = '/calendar'
export const calendarEvent = '/calendarEvent'
export const getAllCountryList = '/organization/getAllCountryList'

export const music = '/music'
export const musicWithoutAuth = '/music/musicId'


//posting app information 
export const appInfo = '/appInfo/saveAppInfo';

// for notification---------------------------------
export const notificationWithout = '/notification/withoutLogin';
export const notification = '/notification';
export const pushNotificationDeviceDetails = '/pushNotification/userDeviceDetails';
export const subscribe = '/pushNotification/subscribe';

//for the main button of the nofification page-----
export const mainNotificationWithoutLogin = '/notification/token/allowNotificationKey';
export const mainNotificationWithogin = '/notification/allowNotificationKey';
export const changeNotificationStateWithout = '/notification/token/notificationSate';
export const changeNotificationStateWith = '/notification/manageNotigication'
// export const
export const brandingWithout = '/branding/getBrandingInfo';
export const eventsById='/event'
export const inboxNotifications = '/notification/inboxNotifications'
export const inboxNotificationWithout = '/notification/inboxNotification'

//for evenRegistration----------------------------------------
// export const eventRegisterWithoutLogin = '/saveEventRegistrationWithoutAuth';
// export const eventRegisterWithLogin = '/saveEventRegistrationW';
 export const eventRegisteration= '/event';


//for subscription--------------------------------------------
export const subscription = '/subscription/subscriptionPlanList'

//to subscribe the plan---
export const subscribePlan = '/subscription/subscribePlan'
export const invoice = '/invoice'
//Giving api
export const GiveNow = 'giving/paymentWithoutLogin'
export const GiveNowLogin='giving/payment'
export const GiveNowWithoutLogin='giving/paymentWithoutLogin'
export const SaveGivingPaymentData='giving'
export const DownloadGivingReceipt = '/giving/getGivingReceipt'
//media count api
export const MediaCount='/mediaPlay';
export const MediaCountWithoutLogin='/mediaPlay/mediaPlayWithoutLogin';
export const SecretKeyGiving='usersubScription/secretKey'
export const allCards='usersubScription/mobileCardDetails'

export const SecretKeyWithoutLogin='usersubScription/secretKeyWithoutLogin'
export const AddUserCardWithoutLogin='usersubScription'
export const AddCardDetail='usersubScription/userCard'
export const AddCardDetailWithoutAuth='usersubScription'
export const Payment='giving/payment'
export const PaymentWithoutAuth='giving/paymentWithoutLogin'
export const MobileCardDetail='usersubScription/mobileCardDetails'
export const MobileCardDetailWithoutAuth='usersubScription/cardDetailsWithoutLogin'

//organization setting---
export const organizationSetting = '/organizationSetting/getAllOrganizationSetting';
export const organizationSettingNoAuth = '/organizationSetting/getOrganizationSetting';


//contactus feature api------
export const uploadDocument = '/upload/document'
export const contactuswithlogin = '/contactUs';
export const contactusWithoutLogin='/contactUs/admin-service/api/v1/contactUsWithoutLoginForMobile';
export const messageType = '/contactUs/getMessageTypeList'


//ebook feature api-------
export const ebookReaderListWithoutAuth = '/eBook/listOfEbooksReadersEbooks';
export const ebookReaderList = '/eBook/listOfEbooksEbookReader'
export const ebookWithoutAuth = '/eBook/mediaItemId';
export const ebookWithLogin = '/eBook';

//base 64 api for epub------
export const epubBase64 = 'upload/base64Document';


//to get user details 
export const user = '/user/';
export const userPlanDetails = '/user/userPlanDetails';
export const userOTPItems = '/user/oneTimePurchaseItem';

//to update contact

export const contact = '/contact'
export const uploadBase64='/upload/base64image';

//to get one time purchase status for a item of user ----
export const otpStatus = '/oneTimePurchase';

//goLiveRelated--
export const liveItemsList = '/mediaItem/getAllMediaItemList';
export const mediaSeriesList = '/mediaseries/getAllMediaSeriesList';

//LIVE STREAMING__
export const viewerCount = '/liveStreaming/viewerCount';
export const startStream=`/liveStreaming/startStreaming`;
export const stopStream=`/liveStreaming/stopStreaming`;
export const getBroadcastStatus = `/liveStreaming/broadCastStatus`;
export const getSocialAccounts = '/oauth2Login/getAppToken';
export const addFbAccounts='/liveStreaming/getFaceBookStreamUrl';
export const addYtAccount='/liveStreaming/getYouTubeStreamUrl';
export const socialMediaLiveStreaming = '/socialMediaLiveStreaming';
export const liveStreaming = '/liveStreaming';
export const getCountryData = 'organization/getAllCountryList';

//Device info --
export const deviceLogin = '/device/userDeviceInfo';


export const IMAGE_LOAD_URL = BASE_URL_IMAGE + IMAGE_LOAD;
export const PNG_IMAGE_LOAD_URL = BASE_URL_IMAGE + PNG_IMAGE_LOAD;

