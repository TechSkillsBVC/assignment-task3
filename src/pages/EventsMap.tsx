import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, {
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { RectButton } from 'react-native-gesture-handler';
import { WebView } from 'react-native-webview';
import { useIsFocused } from '@react-navigation/native';

import { AuthenticationContext } from '../context/AuthenticationContext';
import * as api from '../services/api';
import {
    getFromCache,
    setInCache,
} from '../services/caching';


interface EventItem {
    id: string;
    name: string;
    description: string;
    dateTime: string;
    imageUrl?: string;
    organizerId: string;

    position: {
        latitude: number;
        longitude: number;
    };

    volunteersNeeded: number;
    volunteersIds: string[];
}


export default function EventsMap(
    props: StackScreenProps<any>
) {
    const { navigation } = props;

    const authenticationContext = useContext(
        AuthenticationContext
    );

    const [events, setEvents] = useState<EventItem[]>([]);

    const isFocused = useIsFocused();


    // Load events from server or cache
    useEffect(() => {
        let isActive = true;

        const loadEvents = async () => {
            try {
                console.log('Loading events from server...');

                const response = await api.getEvents();

                const allEvents: EventItem[] =
                    Array.isArray(response.data)
                        ? response.data
                        : [];

                await setInCache('events', allEvents);

                const futureEvents = allEvents.filter(
                    event =>
                        new Date(event.dateTime).getTime() >
                        Date.now()
                );

                if (isActive) {
                    setEvents(futureEvents);
                }

                console.log(
                    'Future events loaded:',
                    futureEvents.length
                );

            } catch (error) {
                console.warn('Server error:', error);

                try {
                    const cachedEvents =
                        await getFromCache<EventItem[]>('events');

                    const futureEvents = cachedEvents.filter(
                        event =>
                            new Date(event.dateTime).getTime() >
                            Date.now()
                    );

                    if (isActive) {
                        setEvents(futureEvents);
                    }

                } catch (cacheError) {
                    console.warn('Cache error:', cacheError);

                    if (isActive) {
                        setEvents([]);
                    }
                }
            }
        };

        if (isFocused) {
            loadEvents();
        }

        return () => {
            isActive = false;
        };

    }, [isFocused]);


    // Prepare OpenStreetMap HTML
    const mapHtml = useMemo(() => {

        const eventData = JSON.stringify(events)
            .replace(/</g, '\\u003c');

        return `
<!DOCTYPE html>
<html>

<head>

    <meta name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <link
        id="leaflet-css"
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />

    <style>

        html,
        body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }

        #map {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: block;
            background: #edeae2;
            overflow: hidden;
        }

        body {
            background: #edeae2;
        }

    </style>

</head>

<body>

    <div id="map"></div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

    <script>

    (function () {

        // Send diagnostics to React Native
        function report(message) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(message);
            }
        }


        // JavaScript error diagnostics
        window.onerror = function (message, source, line) {
            report(
                'JAVASCRIPT ERROR: ' +
                message +
                ' line: ' +
                line
            );
        };


        // Check Leaflet CSS
        const cssLink = document.getElementById('leaflet-css');

        if (cssLink) {

            cssLink.addEventListener('load', function () {
                report('LEAFLET_CSS_LOADED');
            });

            cssLink.addEventListener('error', function () {
                report('LEAFLET_CSS_ERROR');
            });

            setTimeout(function () {

                report(
                    'LEAFLET_CSS_STATE: ' +
                    (cssLink.sheet ? 'loaded' : 'missing')
                );

            }, 1500);
        }


        // Check Leaflet JavaScript
        if (typeof L === 'undefined') {
            report('LEAFLET_JS_NOT_AVAILABLE');
            return;
        }

        report('LEAFLET_JS_LOADED');


        try {

            const events = ${eventData};


            // Create map
            const map = L.map('map', {
                zoomControl: true
            }).setView(
                [51.0447, -114.0719],
                12
            );


            // OpenStreetMap tile layer
            const tileLayer = L.tileLayer(
    'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_5018_1_d287f0a9cfc6a645bd3ba475',
    {
        maxZoom: 20,
        attribution:
            '&copy; OpenStreetMap contributors &copy; CARTO'
    }
);


            tileLayer.on('tileload', function () {
                report('OSM_TILE_LOADED');
            });

            tileLayer.on('tileerror', function () {
                report('OSM_TILE_ERROR');
            });


            tileLayer.addTo(map);


            // Add event markers
            const coordinates = [];

            events.forEach(function (event) {

                const latitude = Number(
                    event.position.latitude
                );

                const longitude = Number(
                    event.position.longitude
                );


                if (
                    !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude)
                ) {
                    report('INVALID_EVENT_COORDINATES');
                    return;
                }


                const point = [
                    latitude,
                    longitude
                ];

                coordinates.push(point);


                const marker = L.circleMarker(point, {
                    radius: 9,
                    color: '#031A62',
                    fillColor: '#00A3FF',
                    fillOpacity: 1,
                    weight: 2
                }).addTo(map);


                marker.bindPopup(
                    '<strong>' +
                    String(event.name || 'Event') +
                    '</strong>'
                );

            });


            // Fit map to event locations
            if (coordinates.length === 1) {

                map.setView(
                    coordinates[0],
                    14
                );

            } else if (coordinates.length > 1) {

                map.fitBounds(
                    coordinates,
                    {
                        padding: [40, 40],
                        maxZoom: 14
                    }
                );

            }


            // Fix WebView map dimensions
            setTimeout(function () {

                const mapElement =
                    document.getElementById('map');

                const width =
                    window.innerWidth ||
                    document.documentElement.clientWidth ||
                    360;

                const height =
                    document.documentElement.clientHeight ||
                    window.innerHeight ||
                    827;


                mapElement.style.position = 'fixed';
                mapElement.style.top = '0';
                mapElement.style.left = '0';

                mapElement.style.width =
                    width + 'px';

                mapElement.style.height =
                    height + 'px';

                mapElement.style.display = 'block';


                map.invalidateSize(true);


                const rect =
                    mapElement.getBoundingClientRect();


                report(
                    'MAP_VIEW_SIZE: ' +
                    Math.round(rect.width) +
                    'x' +
                    Math.round(rect.height)
                );

            }, 1000);


            report('MAP_INITIALIZED');


        } catch (error) {

            report(
                'MAP_INIT_ERROR: ' +
                error.message
            );

        }

    })();

    </script>

</body>
</html>
`;

    }, [events]);


    // Navigate to create event
    const handleNavigateToCreateEvent = () => {
        navigation.navigate('CreateEvent');
    };


    // Logout
    const handleLogout = async () => {

        await AsyncStorage.multiRemove([
            'userInfo',
            'accessToken'
        ]);

        authenticationContext?.setValue(undefined);

        navigation.navigate('Login');

    };


    return (

        <View style={styles.container}>

            <WebView
                originWhitelist={['*']}

                source={{
                    html: mapHtml,
                    baseUrl: 'https://www.openstreetmap.org/',
                }}

                javaScriptEnabled={true}
                domStorageEnabled={true}

                scrollEnabled={false}
                bounces={false}

                onMessage={({ nativeEvent }) => {
                    console.log(
                        'MAP DIAGNOSTIC:',
                        nativeEvent.data
                    );
                }}

                onError={({ nativeEvent }) => {
                    console.log(
                        'WEBVIEW ERROR:',
                        nativeEvent
                    );
                }}

                onHttpError={({ nativeEvent }) => {
                    console.log(
                        'HTTP ERROR:',
                        nativeEvent.statusCode,
                        nativeEvent.url
                    );
                }}

                onLoadStart={() => {
                    console.log('WEBVIEW LOAD STARTED');
                }}

                onLoadEnd={() => {
                    console.log('WEBVIEW LOAD COMPLETED');
                }}

                style={styles.mapStyle}
            />


            {/* Event counter and Create button */}

            <View style={styles.footer}>

                <Text style={styles.footerText}>
                    {events.length}{' '}

                    {events.length === 1
                        ? 'event found'
                        : 'events found'}
                </Text>


                <RectButton
                    style={[
                        styles.smallButton,
                        {
                            backgroundColor: '#00A3FF'
                        }
                    ]}

                    onPress={handleNavigateToCreateEvent}
                >

                    <Feather
                        name="plus"
                        size={20}
                        color="#FFF"
                    />

                </RectButton>

            </View>


            {/* Logout button */}

            <RectButton
                style={[
                    styles.logoutButton,
                    styles.smallButton,
                    {
                        backgroundColor: '#4D6F80'
                    }
                ]}

                onPress={handleLogout}
            >

                <Feather
                    name="log-out"
                    size={20}
                    color="#FFF"
                />

            </RectButton>

        </View>

    );

}



// Styles
const styles = StyleSheet.create({

    container: {
        ...StyleSheet.absoluteFillObject,

        flex: 1,

        justifyContent: 'flex-end',

        alignItems: 'stretch',

        backgroundColor: '#edeae2',
    },


    mapStyle: {
        ...StyleSheet.absoluteFillObject,

        width: '100%',
        height: '100%',
    },


    logoutButton: {
        position: 'absolute',

        top: 70,
        right: 24,

        elevation: 3,
    },


    footer: {
        position: 'absolute',

        left: 24,
        right: 24,
        bottom: 40,

        backgroundColor: '#FFF',

        borderRadius: 16,

        height: 56,

        paddingLeft: 24,

        flexDirection: 'row',

        justifyContent: 'space-between',

        alignItems: 'center',

        elevation: 3,
    },


    footerText: {
        fontFamily: 'Nunito_700Bold',
        color: '#8fa7b3',
    },


    smallButton: {
        width: 56,
        height: 56,

        borderRadius: 16,

        justifyContent: 'center',
        alignItems: 'center',
    },

});