import React from "react";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { StatusBar } from "expo-status-bar";
import Routes from "./src/routes/AppStack";

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar animated translucent style="dark" />
      <ActionSheetProvider>
        <Routes />
      </ActionSheetProvider>
    </>
  );
}
