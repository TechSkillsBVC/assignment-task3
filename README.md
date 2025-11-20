# Volunteam App

Volunteam is a **React Native (Expo)** mobile application that connects volunteers with community events.  
Users can **log in, browse local events on a map, create new ones**, and **upload event images** using the ImgBB API.

Developed for the **Mobile Application Development II** course at **Bow Valley College**, Volunteam demonstrates full-stack mobile architecture integrating:

- React Native (Expo SDK 54)
- TypeScript
- `json-server` mock backend with `json-server-auth`
- REST API endpoints
- Cloud image hosting (ImgBB)

---

## Project Goal

Promote social engagement and collaboration through a mobile volunteering platform that lets users:

- **Discover volunteer opportunities** nearby
- **Create events** with rich details and images
- **Join and contribute** to community initiatives

It demonstrates real-world mobile patterns:

- Clean UI/UX and form validation
- REST API communication and JSON persistence
- Image uploads to external services
- Caching and data validation

---

## App Features

### Authentication

- Login powered by `json-server-auth`
- Email & password validation
- Session caching with AsyncStorage

### Events Map

- Interactive map (`react-native-maps`)
- Markers for each event’s coordinates
- Tap a marker → view Event Details

### Create Event

- Fields: **name**, **description**, **volunteers needed**, **date/time (ISO)**, **latitude**, **longitude**
- Add image from **camera** or **gallery**
- Thumbnail preview with **filename + size**
- Remove/replace before saving
- Uploads to ImgBB and saves event to `json-server`

### Image Upload

- Uses **expo-image-picker** to pick/capture
- Uses the **modern** Expo FileSystem API (`File`) to produce Base64
- Uploads to ImgBB and stores the returned URL

### Offline Storage

- Caches the authenticated user and token
- Preserves login between app restarts

---

## ⚙️ Setting Up the Development Environment

### 1) Clone & install

```bash
git clone https://github.com/<your-username>/volunteam-app.git
cd volunteam-app
npm install
npx expo install
Requires Node.js 18+ and the Expo CLI (installed above via npx expo install usage).
```

---

### 2) Start the Expo app

```bash
npx expo start
```

Open the app in Expo Go (Android/iOS) on the same Wi-Fi network.

# Fake API (json-server)

This project uses json-server + json-server-auth as a mock backend with auth.

### 1) Set the API base URL

```js
const api = axios.create({
  baseURL: "http://YOUR_IP_ADDRESS:3333",
  timeout: 8000,
});
```

### Helpful IP notes

- Android Emulator: use http://10.0.2.2:3333
- Android (device via Expo Go): use your computer’s LAN IP (e.g. http://192.168.1.23:3333)
- iOS Simulator: can usually use http://127.0.0.1:3333 or your LAN IP

### 2) Run the API locally

From the project root (where db.json lives):

```bash
npx json-server --watch db.json --port 3333 --host YOUR_IP_ADDRESS -m ./node_modules/json-server-auth
```

# Image Upload API (ImgBB)

This project uploads images to ImgBB.

### 1) Add your API key

Create an account: https://imgbb.com/signup

```js
IMGBB_API_KEY = "your_imgbb_api_key_here";
```

### 2) Start Expo with the key available

```js
IMGBB_API_KEY="your_imgbb_api_key_here" npx expo start
```

### 3) Image API code (if already wired)

src/services/imageApi.ts uses Axios + multipart/form-data to /upload on https://api.imgbb.com/1.

# Running the App

### 1) Start the API

```js
npx json-server --watch db.json --port 3333 --host YOUR_IP_ADDRESS -m ./node_modules/json-server-auth
```

### 2) Start Expo (with ImgBB key)

```js
IMGBB_API_KEY="your_imgbb_api_key_here" npx expo start
```

### Open in Expo Go and try:

- Login with a user from db.json (under "users")
- View Map → tap markers → Event Details
- Create Event (attach an image, then Save)

# Tests

This project uses Jest for unit tests.

### Run tests:

```bash
npm test
```
