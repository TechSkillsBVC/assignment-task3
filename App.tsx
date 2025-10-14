// Application entry. Mounts the stack defined in src/routes.

import React from "react";
import { StatusBar } from "expo-status-bar";
import AppRoutes from "./src/routes";

export default function App() {
    const Routes = AppRoutes();
    return (
        <>
            {Routes.element}
            <StatusBar style="auto" />
        </>
    );
}
