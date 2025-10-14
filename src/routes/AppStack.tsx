import React, { useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const { Navigator, Screen } = createStackNavigator();

import Login from '../pages/Login';
import EventsMap from '../pages/EventsMap';
//importing create event screens
import CreateEventLocation from '../pages/CreateEventLocation';
import CreateEventDetails from '../pages/CreateEventDetails';
import { AuthenticationContext, AuthenticationContextObject } from '../context/AuthenticationContext';
import { User } from '../types/User';

export default function Routes() {
    const [authenticatedUser, setAuthenticatedUser] = useState<User>();

    const authenticationContextObj: AuthenticationContextObject = {
        value: authenticatedUser as User,
        setValue: setAuthenticatedUser,
    };

    return (
        <AuthenticationContext.Provider value={authenticationContextObj}>
            <NavigationContainer>
                {/* <Navigator
                    screenOptions={{
                        headerShown: false,
                        cardStyle: { backgroundColor: '#F2F3F5' },
                    }}
                >
                    <Screen name="Login" component={Login} />

                    <Screen name="EventsMap" component={EventsMap} />
                </Navigator> */}

                {/* temporarily changing route to avoid login everytime */}
                <Navigator
                    initialRouteName="EventsMap"
                    screenOptions={{
                        headerShown: false,
                        cardStyle: { backgroundColor: '#F2F3F5' },
                    }}
                >
                    <Screen name="Login" component={Login} />
                    <Screen name="EventsMap" component={EventsMap} />
                    {/* create event flow */}
                    <Screen name="CreateEventLocation" component={CreateEventLocation} />
                    <Screen name="CreateEventDetails" component={CreateEventDetails} />
                </Navigator>
            </NavigationContainer>
        </AuthenticationContext.Provider>
    );
}
