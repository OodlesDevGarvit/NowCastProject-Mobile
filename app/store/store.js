import { createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
// import { composeWithDevTools } from "redux-devtools-extension";
import { composeWithDevTools } from '@redux-devtools/extension';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import rootReducer from "./reducers/index";

//The initial state of the store
const initlaState = {};
const middleware = [thunk];
// const persistConfig = {
//   key: 'root',
//   storage: AsyncStorage,
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(
  rootReducer,
  initlaState,
  composeWithDevTools(applyMiddleware(...middleware))
);
const persistor = persistStore(store);

export { store, persistor };