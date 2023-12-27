import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { DynamicThemeConstants } from "../../constant/ThemeConstant";
import DeviceInfo from "react-native-device-info";
import { useEffect } from "react";
import { OpenUrl } from "../../services/TabDesignsService";
import { NOWCAST_URL } from "../../constant/Auth";

export default function About({ route }) {
  const [version, setVersion] = useState("");

  useEffect(() => {
    setVersion(DeviceInfo.getVersion());
  }, []);
  const theme = route.params;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          theme == "DARK"
            ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
            : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
      }}
    >
      <TouchableWithoutFeedback>
        <View
          style={{
            ...Styles.item,
            backgroundColor:
              theme == "DARK"
                ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
                : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
            borderBottomColor:
              theme == "DARK"
                ? DynamicThemeConstants.DARK.BORDER_COLOR_PRIMARY
                : DynamicThemeConstants.LIGHT.BORDER_COLOR_PRIMARY,
          }}
        >
          <Text
            style={{
              ...Styles.text,
              color:
                theme == "DARK"
                  ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                  : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
            }}
          >
            Version
          </Text>
          <Text
            style={{
              ...Styles.text,
              color:
                theme == "DAR"
                  ? DynamicThemeConstants.DARK.TEXT_COLOR_SECONDARY
                  : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY,
            }}
          >
            {version}
          </Text>
        </View>
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback
        onPress={() => {
          // Notifications sections of the settings------------------
          OpenUrl(NOWCAST_URL.NowCast)
        }}
      >
        <View
          style={{
            ...Styles.item,
            backgroundColor:
              theme == "DARK"
                ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
                : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
            borderBottomColor:
              theme == "DARK"
                ? DynamicThemeConstants.DARK.BORDER_COLOR_PRIMARY
                : DynamicThemeConstants.LIGHT.BORDER_COLOR_PRIMARY,
          }}
        >
          <Text
            style={{
              ...Styles.text,
              color:
                theme == "DARK"
                  ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                  : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
            }}
          >
            NOWCAST
          </Text>
        </View>
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback
        onPress={() => {
          // Help section of the settings--------------------
        OpenUrl(NOWCAST_URL.TermsCondition)
        }}
      >
        <View
          style={{
            ...Styles.item,
            backgroundColor:
              theme == "DARK"
                ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
                : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
            borderBottomColor:
              theme == "DARK"
                ? DynamicThemeConstants.DARK.BORDER_COLOR_PRIMARY
                : DynamicThemeConstants.LIGHT.BORDER_COLOR_PRIMARY,
          }}
        >
          <Text
            style={{
              ...Styles.text,
              color:
                theme == "DARK"
                  ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                  : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
            }}
          >
            Terms of use{" "}
          </Text>
        </View>
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback
        onPress={() => {
          // Help section of the settings--------------------
          OpenUrl(NOWCAST_URL.Privacy)
        }}
      >
        <View
          style={{
            ...Styles.item,
            backgroundColor:
              theme == "DARK"
                ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
                : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
            borderBottomColor:
              theme == "DARK"
                ? DynamicThemeConstants.DARK.BORDER_COLOR_PRIMARY
                : DynamicThemeConstants.LIGHT.BORDER_COLOR_PRIMARY,
          }}
        >
          <Text
            style={{
              ...Styles.text,
              color:
                theme == "DARK"
                  ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                  : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
            }}
          >
            Privacy Policy{" "}
          </Text>
        </View>
      </TouchableWithoutFeedback>


      {/* <TouchableWithoutFeedback
        onPress={() => {
          // Help section of the settings--------------------
          alert("Coming soon");
        }}
      >
        <View
          style={{
            ...Styles.item,
            backgroundColor:
              theme == "DARK"
                ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
                : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
            borderBottomColor:
              theme == "DARK"
                ? DynamicThemeConstants.DARK.BORDER_COLOR_PRIMARY
                : DynamicThemeConstants.LIGHT.BORDER_COLOR_PRIMARY,
          }}
        >
          <Text
            style={{
              ...Styles.text,
              color:
                theme == "DARK"
                  ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                  : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
            }}
          >
            Copyrights
          </Text>
        </View>
      </TouchableWithoutFeedback> */}
    </View>
  );
}

const Styles = StyleSheet.create({
  item: {
    borderBottomWidth: 1,
    height: 70,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  text: {
    fontSize: 17,
    textAlignVertical: "center",
    paddingHorizontal: 15,
  },
});
