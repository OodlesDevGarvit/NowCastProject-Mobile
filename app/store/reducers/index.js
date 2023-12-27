import { combineReducers } from "redux";
import authReducer from './auth';
import brandingReducer from './branding';
import remoteReducer from "./remoteMessage";
import castReducer from "./castUrl";
import epubReducer from "./epubSettings";
import splashReducer from "./splashReducer";
import persistReducer from 'redux-persist/es/persistReducer';
import AsyncStorage from "@react-native-async-storage/async-storage";
import bibleReducer from "./bible";
import iosCompReducer from "./iosCompReducer";
import noInternetReducer from "./noInternetReducer";
import alertReducer from "./alertReducer";
import activeOrgReducer from "./activeOrg";
import publishableKey from "./publishableKey";
import misc from "./miscellaneous";
import purchasedItemsReducer from "./purchasedItemsReducer";
import inAppPlansReducer from "./inAppPlans";



const brandingPersistConfig = {
  key: 'branding',
  storage: AsyncStorage,
}
const remotePersistConfig={
  key: 'remote',
  storage: AsyncStorage,
}
const authPersist={
  key:'auth',
  storage:AsyncStorage,
}
const castPersist={
  key:'cast',
  storage:AsyncStorage,
}
const epubPersist={
  key:'epub',
  storage:AsyncStorage
}
const biblePersist = {
  key: 'bible',
  storage: AsyncStorage,
}
const activeOrgPersist = {
  key: 'activeOrg',
  storage: AsyncStorage,
}

const miscPersist = {
  key: 'misc',
  storage: AsyncStorage,
}

const purchasedItemsReducerPersist = {
  key: 'purchasedItems',
  storage: AsyncStorage,
}

const inAppPlansReducerPersist = {
  key: 'inAppPlans',
  storage: AsyncStorage,
}

export default combineReducers({
  authReducer:persistReducer(authPersist,authReducer),
  brandingReducer:persistReducer(brandingPersistConfig, brandingReducer),
  remoteReducer:persistReducer(remotePersistConfig, remoteReducer),
  castReducer:persistReducer(castPersist,castReducer),
  epubReducer: persistReducer(epubPersist, epubReducer),
  bibleReducer: persistReducer(biblePersist, bibleReducer),
  splashReducer,
  iosCompReducer,
  noInternetReducer,
  alertReducer,
  publishableKey,
  activeOrgReducer: persistReducer(activeOrgPersist, activeOrgReducer),
  misc: persistReducer(miscPersist, misc),
  purchasedItemsReducer: persistReducer(purchasedItemsReducerPersist, purchasedItemsReducer),
  inAppPlansReducer:persistReducer(inAppPlansReducerPersist,inAppPlansReducer)
});