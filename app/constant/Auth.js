import axios from 'axios';
import { DEVICE_TYPES } from './StringConstant';
import { Platform } from 'react-native';

const URLS = {
  DEV_ADMIN: "https://dev.nowcast.cc/admin-service/api/v1",
  DEV_AUTH: "https://dev.nowcast.cc/authentication-service/api/v1",
  DEV_IMAGE: 'https://dev.nowcast.cc/image-service/api/v1',
  PROD_IMAGE: 'https://dashboard.nowcast.cc/image-service/api/v1',
  PROD_ADMIN: "https://dashboard.nowcast.cc/admin-service/api/v1",
  PROD_AUTH: "https://dashboard.nowcast.cc/authentication-service/api/v1"
}

//TODO:CHNEGE THIS VALUE TO SWITCH BETWEEN DEV AND PROD 
const ENV = "DEV" // Possible value are "DEV" and "PROD"

export const BASE_URL = ENV == "DEV" ? URLS.DEV_ADMIN : URLS.PROD_ADMIN;
export const BASE_URL_AUTH = ENV == "DEV" ? URLS.DEV_AUTH : URLS.PROD_AUTH;
export const BASE_URL_IMAGE = ENV == "DEV" ? URLS.DEV_IMAGE : URLS.PROD_IMAGE;

export const NOWCAST_URL = {
  NowCast: 'https://www.nowcast.cc/',
  TermsCondition: 'https://www.nowcast.cc/terms-of-conditions',
  Privacy: 'https://www.nowcast.cc/privacy-policy'
}

export const axiosInstance1 = axios.create({
  baseURL: BASE_URL,
  timeout: 100000,
  headers: {
    Authorization: null,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'deviceType': Platform.OS == 'android' ? DEVICE_TYPES.MOBILE_ANDROID : DEVICE_TYPES.MOBILE_IOS
  },
});

export const axiosInstanceAuth = axios.create({
  baseURL: BASE_URL_AUTH,
  timeout: 100000,
  headers: {
    Authorization: null,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'deviceType': Platform.OS == 'android' ? DEVICE_TYPES.MOBILE_ANDROID : DEVICE_TYPES.MOBILE_IOS
  },
});


