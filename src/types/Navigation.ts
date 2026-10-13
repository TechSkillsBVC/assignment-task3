import { LatLng } from 'react-native-maps';

export type AppStackParamList = {
    Login: undefined;
    EventsMap: undefined;
    SelectLocation: undefined;
    EventForm: { position: LatLng };
};
