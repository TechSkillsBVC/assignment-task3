// App navigation stack: Map ? EventForm

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MapScreen from "../pages/MapScreen";
import EventFormScreen from "../pages/EventFormScreen";

export type RootStackParamList = {
    Map: undefined;
    EventForm: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppRoutes() {
    return {
        // Separate container makes testing easier.
        // If you already wrap NavigationContainer in App.tsx, export only the stack.
        element: (
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="Map" component={MapScreen} options={{ title: "Map" }} />
                    <Stack.Screen name="EventForm" component={EventFormScreen} options={{ title: "Create Event" }} />
                </Stack.Navigator>
            </NavigationContainer>
        ),
    };
}
