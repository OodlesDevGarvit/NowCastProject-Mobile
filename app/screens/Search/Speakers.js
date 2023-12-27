import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const speakers = [
  {
    id: 1,
    name: 'AnGala Portorreal',
    noOfVideos: 1,
  },
];

export default function Speakers({ navigation, route }) {
  const [speaker, setSpeakers] = useState(speakers);
  const theme = route.params;
  // console.log(theme)

  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          theme == 'DARK'
            ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
            : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
      }}
    >
      <View
        style={{
          ...Styles.container,
          borderTopColor: theme == 'DARK' ? null : '#D3D3D3',
        }}
      >
        <FlatList
          data={speaker}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('ContentOfSpeaker', { item, theme });
              }}
            >
              <View style={Styles.speaker}>
                <Text
                  style={{
                    fontSize: 18,
                    color:
                      theme == 'DARK'
                        ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                        : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                  }}
                >
                  {item.name}
                </Text>
                <View
                  style={{
                    backgroundColor: '#000',
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff' }}>{item.noOfVideos}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
}

const Styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#d3d3d3',
    flex: 1,
    marginHorizontal: 15,
    marginTop: 5,
  },
  speaker: {
    // borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d3d3d3',
    height: 70,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
});
