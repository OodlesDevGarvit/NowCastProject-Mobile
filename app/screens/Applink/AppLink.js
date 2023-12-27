import React, { useState } from 'react';
import { StatusBar, View } from 'react-native';
import { WebView } from 'react-native-webview';
import Loader from '../../components/Loader';

const AppLink = ({ route }) => {
  const [loading, setLoading] = useState(true);

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={loading} />
      <StatusBar translucent={false} showHideTransition={true} />
      {
        route.params.pathUr && route.params.pathUr != null &&
        <WebView
          source={{ uri: route.params.pathUr }}
          onLoad={() => {
            setLoading(false);
          }}
        />
      }
    </View>
  );
};
export default AppLink;
