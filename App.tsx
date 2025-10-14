import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import EventsMap from "./src/pages/EventsMap";
import CreateEvent from "./src/pages/CreateEvent";

const { Navigator, Screen } = createStackNavigator();

export default function AppStack() {
  return (
    <NavigationContainer>
      <Navigator screenOptions={{ headerShown: false }}>
        <Screen name="EventsMap" component={EventsMap} />
        <Screen name="CreateEvent" component={CreateEvent} />
      </Navigator>
    </NavigationContainer>
  );
}
