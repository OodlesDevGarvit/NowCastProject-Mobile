import React from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DynamicThemeConstants } from "../constant/ThemeConstant";
import ThemeConstant from "../constant/ThemeConstant";
export default function MediumTextInput({ onChangeText, value, keyboardType, onSubmitEditing}) {
  const navigation = useNavigation();
  const deviceWidth = Dimensions.get("window").width;
  return (
      <View style={{ padding: 10, width:deviceWidth/2 }}>
        <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          value={value}
          placeholder=""
          keyboardType={keyboardType}
          onSubmitEditing={onSubmitEditing}
        />
      </View>
  );
}
const styles = StyleSheet.create({
  input: {
    height: 40,
    width: "100%",
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 3,
    fontFamily: ThemeConstant.FONT_FAMILY,
    borderColor: "#D6D5DF",
  },
});
