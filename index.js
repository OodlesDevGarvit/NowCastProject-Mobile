import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { AppRegistry, LogBox, Platform, StatusBar } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { store, persistor } from './app/store/store';
import { SplashScreenModal } from './app/screens/splashScreen/SplashScreen';
import { NativeBaseProvider } from 'native-base'
import Immersive from 'react-native-immersive';

const AppWrapper = () => {
    useEffect(() => {
        LogBox.ignoreAllLogs();
        console.warn = () => { };
        console.error = () => { };
        if (Platform.OS == 'android') {
            Immersive.setImmersive(true)
        } else {
            StatusBar.setHidden(true);
        }
    }, []);

    return (
        <NativeBaseProvider>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <SplashScreenModal />
                    <App />
                </PersistGate>
            </Provider>
        </NativeBaseProvider>
    );
};

AppRegistry.registerComponent(appName, () => AppWrapper);
