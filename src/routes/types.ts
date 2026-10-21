import { LatLng } from 'react-native-maps';

export type RootStackParamList = {
    Login: undefined;
    EventsMap: undefined;
    AddEventLocation: undefined;
    AddEventForm: { position: LatLng };
};
