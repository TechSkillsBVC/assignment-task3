import React, { useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';

const { Navigator, Screen } = createStackNavigator<RootStackParamList>();

import Login from '../pages/Login';
import EventsMap from '../pages/EventsMap';
import AddEventLocation from '../pages/AddEventLocation';
import AddEventForm from '../pages/AddEventForm';
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
                <Navigator
                    screenOptions={{
                        headerShown: false,
                        cardStyle: { backgroundColor: '#F2F3F5' },
                    }}
                >
                    <Screen name="Login" component={Login} />

                    <Screen name="EventsMap" component={EventsMap} />
                    <Screen name="AddEventLocation" component={AddEventLocation} />
                    <Screen name="AddEventForm" component={AddEventForm} />
                </Navigator>
            </NavigationContainer>
        </AuthenticationContext.Provider>
    );
}
