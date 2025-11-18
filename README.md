# Volunteam App

## Setting up the fake API (json-server)

Update the file `src/services/api.ts`.

Before running your 'json-server', get your computer's IP address and update your baseURL to `http://your_ip_address_here:3333` and then run:

```
npx json-server --watch db.json --port 3333 --host your_ip_address_here -m ./node_modules/json-server-auth
```

To access your server online without running json-server locally, you can set your baseURL to:

```
https://my-json-server.typicode.com/<your-github-username>/<your-github-repo>
```

To use `my-json-server`, make sure your `db.json` is located at the repo root.

## Setting up the image upload API

Update the file `src/services/imageApi.ts`.

You can use any hosting service of your preference. In this case, we will use ImgBB API: https://api.imgbb.com/.
Sign up for free at https://imgbb.com/signup, get your API key and add it to the .env file in your root folder.

To run the app in your local environment, you will need to set the IMGBB_API_KEY when starting the app using:

```
IMGBB_API_KEY="insert_your_api_key_here" npx expo start
```

When creating your app build or publishing, import your secret values to EAS running:

```
eas secret:push
```



# Voluntam - Volunteer Event Management App

## 📱 Project Overview
A React Native mobile application for managing volunteer events in Calgary. Users can view events on a map, create new events, volunteer for events, and share event details.

## 🎓 Course Information
- **Course:** SODV2453 - Mobile Development
- **Institution:** Bow Valley College
- **Assignment:** Task 3 - Event Creation Feature

---

##  Features Implemented

### Task 1: Authentication
- ✅ User login with email and password
- ✅ JWT token-based authentication
- ✅ Secure session management with AsyncStorage

### Task 2: Events Map Display
- ✅ Display all future events on Google Maps
- ✅ Color-coded markers (Orange: Available, Blue: Volunteered, Grey: Full)
- ✅ Filter past events automatically
- ✅ Event details screen with location, date, time, and description
- ✅ "Fit Map" button to zoom to all events
- ✅ Pull-to-refresh to update events

### Task 3: Event Creation (Current)
- ✅ **Location Selection:** Interactive map to choose event location
- ✅ **Event Form:** Name, description, date, time, volunteers needed
- ✅ **Camera Permission:** Proactive permission checking with status display
- ✅ **Gallery Permission:** Proactive permission checking with status display
- ✅ **Image Upload:** Upload photos to ImgBB cloud storage
- ✅ **Image Preview:** Display thumbnail, file name, and file size after upload
- ✅ **Dual Save Options:**
  - "Save" button: Saves event and stays on form for editing
  - "Next" button: Saves event and navigates back to map
- ✅ **Form Validation:** All required fields must be filled
- ✅ **Auto-refresh:** Map automatically updates with new events

### Bonus Features
- ✅ **Volunteer for Events:** Users can register as volunteers
- ✅ **Share Events:** Native share dialog to share event details
- ✅ **Contact Organizer:** Call/SMS buttons for volunteered events
- ✅ **Offline Caching:** Events cached for offline viewing
- ✅ **Settings Access:** Direct link to app settings for denied permissions

---

##  Technology Stack

### Core Technologies
- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type-safe JavaScript

### Navigation
- **React Navigation** - Stack and tab navigation

### Maps & Location
- **React Native Maps** - Google Maps integration
- **Expo Location** - Device location services

### Image Handling
- **Expo Image Picker** - Camera and gallery access
- **ImgBB API** - Cloud image storage

### Data Management
- **Axios** - HTTP client for API calls
- **AsyncStorage** - Local data persistence
- **JSON Server Auth** - Mock REST API with authentication

### UI Components
- **React Native Gesture Handler** - Touch interactions
- **DateTimePicker** - Native date/time pickers

---

##  Prerequisites

Before running this project, ensure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** (for Android emulator) or **Xcode** (for iOS simulator)
- **Git**

---

## Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd assignment-task3
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Keys

Create `src/config/keys.ts`:
```typescript
export default {
    GOOGLE_MAPS_API_KEY: 'your_google_maps_api_key',
    IMGBB_API_KEY: 'your_imgbb_api_key',
};
```

**Get API Keys:**
- Google Maps: https://console.cloud.google.com/
- ImgBB: https://api.imgbb.com/

### 4. Update API Base URL

Edit `src/services/api.ts`:
```typescript
baseURL: 'http://YOUR_LOCAL_IP:3333'
```

Replace `YOUR_LOCAL_IP` with your computer's IP address.

---

## 🎮 Running the Application

### Start Backend Server
```bash
npx json-server-auth db.json --port 3333 --host YOUR_LOCAL_IP
```

### Start Expo Development Server
```bash
npm start
```

### Run on Android Emulator
```bash
npm run android
```

### Run on iOS Simulator (Mac only)
```bash
npm run ios
```

---

## 👤 Test Credentials

Use these credentials to login:

```
Email: ulla.ulriksen@example.com
Password: password
```

---

## Project Structure

```
assignment-task3/
├── src/
│   ├── config/
│   │   └── keys.ts              # API keys (gitignored)
│   ├── context/
│   │   └── AuthenticationContext.tsx
│   ├── images/
│   │   ├── map-marker.png       # Orange marker (available)
│   │   ├── map-marker-blue.png  # Blue marker (volunteered)
│   │   └── map-marker-grey.png  # Grey marker (full)
│   ├── pages/
│   │   ├── Login.tsx            # Authentication screen
│   │   ├── EventsMap.tsx        # Main map with events
│   │   ├── EventDetails.tsx     # Event details screen
│   │   ├── SelectLocation.tsx   # Location picker screen
│   │   └── CreateEvent.tsx      # Event creation form
│   ├── routes/
│   │   └── AppStack.tsx         # Navigation configuration
│   ├── services/
│   │   └── api.ts               # API service layer
│   └── types/
│       ├── Event.ts             # Event type definitions
│       └── User.ts              # User type definitions
├── db.json                      # Mock database
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

---

## 🎯 Key Implementation Details

### Permission Handling
The app proactively checks camera and gallery permissions on component mount and displays the status with visual indicators:
- ✅ Green checkmark: Permission granted
- ❌ Red X: Permission denied
- ❓ Grey question: Not yet requested

If permissions are denied, a "Open Settings" button appears to guide users.

### Image Upload Flow
1. User selects image from gallery or takes photo with camera
2. Image uploads to ImgBB cloud storage
3. Thumbnail preview appears with file name and size
4. Image URL is stored with event data
5. Fallback placeholder used if upload fails

### Event Filtering
Events are automatically filtered to show only future events based on the current date/time. Past events are excluded from the map display.

### Cache Management
Events are cached in AsyncStorage for offline access. Pull-to-refresh clears the cache and fetches fresh data from the API.

---

##  Known Issues

1. **JWT Decode Warning:** Console shows JWT decode error on initial load (does not affect functionality)
2. **Date Display:** Event dates may show incorrect year due to timezone conversion (cosmetic only)
3. **Emulator Performance:** Android emulator may be slow to start; physical device recommended

---

## 🔮 Future Enhancements

- [ ] User registration/signup
- [ ] Edit existing events
- [ ] Delete events
- [ ] Event categories/tags
- [ ] Search and filter events
- [ ] Push notifications for event reminders
- [ ] User profiles with volunteer history
- [ ] Event attendance tracking
- [ ] Multi-language support

---

##  Assignment Requirements Checklist

### Task 3 Requirements

#### Event Creation
- ✅ Location selection on interactive map
- ✅ Event form with all required fields
- ✅ Date and time pickers

#### Image Handling
- ✅ Check camera permissions before use
- ✅ Check gallery permissions before use
- ✅ Upload image to online storage (ImgBB)
- ✅ Include image URL in event data
- ✅ Display thumbnail after successful upload
- ✅ Display file name after successful upload
- ✅ Display file size after successful upload

#### Save & Navigation
- ✅ "Save" button persists event to database
- ✅ "Next" button saves and navigates back to map
- ✅ Map automatically refreshes to show new event
- ✅ New event appears with correct marker color

---

##  Resources & Documentation

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [ImgBB API Documentation](https://api.imgbb.com/)
- [JSON Server Auth](https://github.com/jeremyben/json-server-auth)

---

##  Author: Gbolabo(Ola)


---

##  License

This project is for educational purposes as part of the SODV2453 course at Bow Valley College.

