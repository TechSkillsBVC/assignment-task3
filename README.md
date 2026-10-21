# Volunteam App - Project 1.3

For this project I added the create event pages and connected the events to the API.

## What I added

- Events load from the API and show on the map.
- Past events are not shown.
- The map shows the user's location and the available events.
- A user can choose a location and fill out the form to create an event.
- The form checks that all fields are filled in.
- A photo can be selected from the camera or photo library and uploaded with ImgBB.
- New events are saved to the API and then shown on the map.
- Saved events can still be shown if the API is temporarily unavailable.

## How to run the project

Install the packages:

```bash
npm install --legacy-peer-deps
```

Create a `.env` file using `.env.example`. Add your computer's IP address and your ImgBB key:

```text
API_URL=http://YOUR_COMPUTER_IP:3333
IMGBB_API_KEY=YOUR_IMGBB_API_KEY
```

Run the API in one terminal:

```bash
npm run api
```

Then run Expo in another PowerShell terminal:

```powershell
$env:API_URL="http://YOUR_COMPUTER_IP:3333"
$env:IMGBB_API_KEY="YOUR_IMGBB_API_KEY"
npx expo start --lan --clear
```

## Login

- Email: `luigi@carluccio.it`
- Password: `password`

## Testing

```bash
npm run typecheck
npm test
```
